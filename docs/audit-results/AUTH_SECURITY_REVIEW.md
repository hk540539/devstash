# Auth Security Review

**Last Audit:** 2026-04-12  
**Auditor:** auth-auditor agent  
**Scope:** Authentication, email verification, password reset, profile page

---

## Critical Issues

_None found._

---

## High Issues

### [HIGH-1] Verification and Password-Reset Tokens Stored as Plaintext in the Database

- **File:** `src/app/register/page.tsx:51-55`, `src/app/forgot-password/page.tsx:33-38`
- **Issue:** Both email-verification tokens and password-reset tokens are generated as `randomBytes(32).toString('hex')` and stored verbatim in the `VerificationToken.token` column. If the database is ever read-compromised (SQL injection, a leaked backup, a misconfigured Prisma Studio instance, etc.), every active token is immediately usable — an attacker can verify any unverified account or reset any user's password without interacting with the email system.

  Password-reset tokens are especially sensitive because they allow full account takeover. A single DB read returning active reset tokens is sufficient to take over every account that has a pending reset.

- **Fix:** Hash tokens before storing them, and compare the hash at use time.

  ```ts
  import { createHash, randomBytes } from 'crypto'

  // Generation (register / forgot-password):
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')

  await prisma.verificationToken.create({
    data: { identifier: email, token: tokenHash, expires },
  })

  // Send rawToken in the email URL, never store it.
  await sendVerificationEmail(email, rawToken)

  // Verification (verify-email / reset-password):
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const record = await prisma.verificationToken.findUnique({ where: { token: tokenHash } })
  ```

  SHA-256 is appropriate here because the raw token already has 256 bits of entropy from `randomBytes(32)`, so a fast hash is acceptable (no need for bcrypt).

---

## Medium Issues

### [MED-1] No Rate Limiting on Any Auth Endpoint

- **File:** `src/app/api/auth/register/route.ts` (entire file), `src/app/register/page.tsx` (Server Action), `src/app/forgot-password/page.tsx` (Server Action), `src/app/verify-email/page.tsx` (page load triggers DB work)
- **Issue:** None of the auth-related endpoints or Server Actions implement rate limiting. There is no middleware, no IP-based throttle, and no library (e.g., `@upstash/ratelimit`, `express-rate-limit`, or Vercel's edge rate limiting) in place. This enables:
  - **Account enumeration at scale** — POST `/api/auth/register` and the register Server Action both return distinct responses for existing vs. non-existing emails (`"Email already in use"` / `"An account with this email already exists."`). Without rate limiting, an attacker can silently enumerate registered emails in bulk.
  - **Credential stuffing** — The credentials sign-in path (via NextAuth) is also unbounded.
  - **Reset-email flooding** — The forgot-password action will send a reset email on every invocation for a valid account (it deletes the previous token first, so there's no deduplication window). An attacker can spam password-reset emails to any user.
- **Fix:** Add a rate limiter at the middleware / edge layer. For a Vercel deployment, Upstash Redis with `@upstash/ratelimit` is the standard approach:

  ```ts
  // src/proxy.ts (or middleware.ts)
  import { Ratelimit } from '@upstash/ratelimit'
  import { Redis } from '@upstash/redis'

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
  })
  // Apply to /api/auth/register, /forgot-password, /verify-email, etc.
  ```

  At minimum, apply a strict limit (e.g., 5 requests/minute per IP) to the register and forgot-password routes.

### [MED-2] Duplicate Registration Path with Weaker Validation

- **File:** `src/app/api/auth/register/route.ts:7-19`
- **Issue:** There are two independent registration paths: the Server Action in `src/app/register/page.tsx` (used by the UI) and the REST API route at `POST /api/auth/register`. The API route is publicly accessible and has weaker validation — it does **not** validate email format (no regex, no Zod), whereas the Server Action validates with `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. An attacker (or a future mobile/CLI client) calling the API route directly can register accounts with malformed email addresses (e.g., `"notanemail"`, `" "`, `"a@"`), which then get stored in the database. These accounts would never receive a verification email but do consume a user row.

  Additionally, neither the API route nor the Server Action uses Zod — validation is done with ad-hoc checks only.

- **Fix:** Either remove the API route (the Server Action is sufficient for the current web-only architecture) or bring its validation up to parity. If keeping it, add Zod:

  ```ts
  import { z } from 'zod'

  const RegisterSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  ```

---

## Low / Informational

### [LOW-1] Expired Tokens Remain in the Database Indefinitely

- **File:** `src/app/verify-email/page.tsx:24-27`, `src/app/reset-password/page.tsx:19`
- **Issue:** Expired verification and password-reset tokens are only deleted when a user actually visits the expiry-check path. There is no background cleanup job. Over time, the `VerificationToken` table accumulates stale rows. This is not directly exploitable — the expiry check (`record.expires < new Date()`) correctly rejects them — but it increases the blast radius of a DB read compromise (more stale tokens visible) and adds unnecessary DB clutter.
- **Fix:** Add a periodic cleanup query, or rely on a Neon scheduled query / cron to `DELETE FROM "VerificationToken" WHERE expires < NOW()`. Alternatively, delete expired tokens for the same identifier at the start of new token creation (the forgot-password flow already does this for its own prefix; the same pattern could be applied in registration).

### [LOW-2] `callbackUrl` Open-Redirect Surface (Mitigated by NextAuth)

- **File:** `src/app/sign-in/page.tsx:17`, `src/app/sign-in/SignInForm.tsx:35,51`
- **Issue:** The `callbackUrl` from the query string is read directly and embedded into a hidden form field, then passed to NextAuth's `signIn(..., { redirectTo })`. NextAuth v5 validates `redirectTo` and restricts it to the same origin, so this is not an exploitable open redirect. However, a malicious link like `https://devstash.app/sign-in?callbackUrl=https://evil.com` will silently fall back to the default rather than warning the user.
- **Fix:** No urgent action required given NextAuth's protection. As a defence-in-depth measure, consider validating that `callbackUrl` starts with `/` before using it:

  ```ts
  const safeRedirect = callbackUrl?.startsWith('/') ? callbackUrl : '/dashboard'
  ```

---

## Passed Checks

| Check | File | Status |
|-------|------|--------|
| bcrypt used with cost factor ≥ 10 (cost = 12) | `src/app/api/auth/register/route.ts:22`, `src/app/register/page.tsx:40`, `src/app/(app)/profile/page.tsx:71` | ✅ Pass |
| Raw password never logged, stored in response, or returned | `src/app/api/auth/register/route.ts`, `src/auth.ts` | ✅ Pass |
| Password comparison uses `bcrypt.compare` (timing-safe) | `src/auth.ts:43-46`, `src/app/(app)/profile/page.tsx:68` | ✅ Pass |
| Verification token uses `crypto.randomBytes(32)` (CSPRNG) | `src/app/register/page.tsx:51` | ✅ Pass |
| Verification token has 24h expiry | `src/app/register/page.tsx:52` | ✅ Pass |
| Verification token deleted after successful use (single-use) | `src/app/verify-email/page.tsx:29-35` | ✅ Pass |
| Password reset token uses `crypto.randomBytes(32)` (CSPRNG) | `src/app/forgot-password/page.tsx:33` | ✅ Pass |
| Password reset token has 1h expiry | `src/app/forgot-password/page.tsx:34` | ✅ Pass |
| Password reset token deleted after successful reset (single-use) | `src/app/reset-password/page.tsx:76` | ✅ Pass |
| Forgot-password form avoids user enumeration (same response for known/unknown email) | `src/app/forgot-password/page.tsx:24-26` | ✅ Pass |
| New password minimum length validated before hashing on reset | `src/app/reset-password/page.tsx:54-56` | ✅ Pass |
| Profile page calls `auth()` and bails on missing session | `src/app/(app)/profile/page.tsx:14-15` | ✅ Pass |
| `changePasswordAction` re-calls `auth()` server-side; uses `session.user.id` for DB lookup | `src/app/(app)/profile/page.tsx:44-45,61-62` | ✅ Pass |
| Old password verified before allowing password change | `src/app/(app)/profile/page.tsx:68-69` | ✅ Pass |
| `deleteAccountAction` re-calls `auth()` server-side; calls `signOut()` after deletion | `src/app/(app)/profile/page.tsx:81-85` | ✅ Pass |
| Update/delete operations scoped to `session.user.id` (no userId from request body) | `src/app/(app)/profile/page.tsx:61,72,84` | ✅ Pass |
| Duplicate email check present in registration | `src/app/register/page.tsx:35-38`, `src/app/api/auth/register/route.ts:17-19` | ✅ Pass |
| `(app)` layout independently enforces authentication via `auth()` | `src/app/(app)/layout.tsx:8-9` | ✅ Pass |
| Email verification enforced on credentials sign-in | `src/auth.ts:50-52` | ✅ Pass |
| Password hash cost ≥ 10 in all locations (12 used throughout) | All registration / password-change paths | ✅ Pass |

---

## Summary

0 critical, 1 high, 2 medium, 2 low issues found.

The most important fix is **[HIGH-1]**: hashing tokens before storing them in the database. This is a straightforward change that significantly reduces the damage of any future database read compromise. **[MED-1]** (rate limiting) should be addressed before the application accepts real users, as it enables both enumeration and spam at scale.
