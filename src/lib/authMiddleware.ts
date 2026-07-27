import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export interface AuthenticatedRequestInfo {
  userId: string;
  role: "customer" | "artisan" | "admin";
  email: string;
}

export function getAuthUser(req: NextRequest): AuthenticatedRequestInfo | null {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded as AuthenticatedRequestInfo;
}

export function requireRole(req: NextRequest, allowedRoles: ("customer" | "artisan" | "admin")[]) {
  const user = getAuthUser(req);
  if (!user) return { status: 401, error: "Unauthorized" };
  if (!allowedRoles.includes(user.role)) return { status: 403, error: "Forbidden" };
  return { user };
}
