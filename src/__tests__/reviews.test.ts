import { describe, it, expect } from "vitest";
import Review from "../models/Review";

describe("Review Model registration", () => {
  it("should define Review model schema and fields correctly", () => {
    expect(Review).toBeDefined();
    expect(Review.modelName).toBe("Review");
    expect(Review.schema.paths.productId).toBeDefined();
    expect(Review.schema.paths.rating).toBeDefined();
    expect(Review.schema.paths.comment).toBeDefined();
  });
});
