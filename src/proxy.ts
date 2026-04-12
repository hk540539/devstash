import { auth } from "@/auth"

// In Next.js 16, proxy.ts replaces middleware.ts and runs on Node.js runtime.
// Using auth from @/auth directly — no edge compatibility workarounds needed.
// Dashboard protection is also enforced server-side in layout.tsx.
export const proxy = auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return Response.redirect(signInUrl)
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/profile"],
}
