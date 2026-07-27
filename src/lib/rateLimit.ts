import { NextRequest } from "next/server";

const tracker = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(req: NextRequest, limit = 10, windowMs = 60 * 1000) {
  const ip = req.headers.get("x-forwarded-for") || "local-ip";
  const now = Date.now();
  const tracking = tracker.get(ip);

  if (!tracking) {
    tracker.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, count: 1, resetTime: now + windowMs };
  }

  if (now > tracking.resetTime) {
    tracking.count = 1;
    tracking.resetTime = now + windowMs;
    return { success: true, count: 1, resetTime: tracking.resetTime };
  }

  tracking.count += 1;
  if (tracking.count > limit) {
    return { success: false, count: tracking.count, resetTime: tracking.resetTime };
  }

  return { success: true, count: tracking.count, resetTime: tracking.resetTime };
}
