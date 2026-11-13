import { describe, expect, it } from "vitest";
import { placementSchema } from "@/lib/validations/employer";

const validPlacement = {
  title: "Software Engineering Intern", category: "Engineering", employmentType: "internship", workMode: "hybrid", location: "Ilorin",
  description: "Work with the engineering team to build and maintain production software and support quality releases.",
  minLevel: "200", maxLevel: "400", minCgpa: "", siwesRequired: false, durationWeeks: "12", slots: "3",
  applicationDeadline: "", startDate: "", endDate: "",
};

describe("placement authoring validation", () => {
  it("accepts a complete placement draft", () => {
    expect(placementSchema.safeParse(validPlacement).success).toBe(true);
  });

  it("rejects an invalid study level range", () => {
    const result = placementSchema.safeParse({ ...validPlacement, minLevel: "500", maxLevel: "300" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === "maxLevel")).toBe(true);
  });

  it("rejects short descriptions and unsupported work modes", () => {
    expect(placementSchema.safeParse({ ...validPlacement, description: "Too short" }).success).toBe(false);
    expect(placementSchema.safeParse({ ...validPlacement, workMode: "anywhere" }).success).toBe(false);
  });
});
