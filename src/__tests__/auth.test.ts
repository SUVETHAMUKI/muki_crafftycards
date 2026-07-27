import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "../lib/jwt";

describe("JWT Helper Tests", () => {
  it("should sign and verify a token successfully", () => {
    const payload = {
      userId: "user_123",
      role: "customer" as const,
      email: "test@example.com",
    };

    const token = signToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.role).toBe(payload.role);
    expect(decoded?.email).toBe(payload.email);
  });

  it("should return null for an invalid token", () => {
    const decoded = verifyToken("invalid.token.here");
    expect(decoded).toBeNull();
  });
});
