import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

interface HeaderLike {
  get(name: string): string | null;
}

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

function createLimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

// Limiters per endpoint
const limiters = {
  login: createLimiter(5, "15 m"),
  register: createLimiter(3, "1 h"),
  forgotPassword: createLimiter(3, "1 h"),
  resetPassword: createLimiter(5, "15 m"),
  resendVerification: createLimiter(3, "15 m"),
} as const;

export type LimiterKey = keyof typeof limiters;

/** Extract client IP from a NextRequest (API routes) */
export function getIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

/** Extract client IP from next/headers (Server Actions) */
export function getIPFromHeaders(headers: HeaderLike): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Unix timestamp (seconds)
}

export async function rateLimit(
  key: LimiterKey,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = limiters[key];

  // Fail open if Redis/limiter is unavailable
  if (!limiter) {
    return { success: true, remaining: 1, reset: 0 };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: Math.ceil(result.reset / 1000),
    };
  } catch {
    // Fail open on Redis errors
    return { success: true, remaining: 1, reset: 0 };
  }
}

/** Build a 429 JSON Response for API routes */
export function rateLimitResponse(reset: number): Response {
  const retryAfter = Math.max(0, reset - Math.floor(Date.now() / 1000));
  const minutes = Math.ceil(retryAfter / 60);
  const message =
    minutes >= 1
      ? `Too many attempts. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`
      : "Too many attempts. Please try again shortly.";

  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfter),
    },
  });
}

/** Format a rate limit error message for Server Actions */
export function rateLimitMessage(reset: number): string {
  const retryAfter = Math.max(0, reset - Math.floor(Date.now() / 1000));
  const minutes = Math.ceil(retryAfter / 60);
  return minutes >= 1
    ? `Too many attempts. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`
    : "Too many attempts. Please try again shortly.";
}
