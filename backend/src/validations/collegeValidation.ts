import { z } from "zod";

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().trim().optional());

const optionalNumberInRange = (minimum: number, maximum: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }, z.coerce.number().min(minimum).max(maximum).optional());

const optionalPositiveInteger = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.coerce.number().int().positive().optional());

export const collegeQuerySchema = z.object({
  search: optionalTrimmedString,
  location: optionalTrimmedString,
  course: optionalTrimmedString,
  minRating: optionalNumberInRange(0, 5),
  maxFees: optionalPositiveInteger,
  sort: z.enum(["rating_desc", "fees_asc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(8),
});

export const slugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

export const saveCollegeSchema = z.object({
  collegeId: z.coerce.number().int().positive(),
});

export const collegeIdParamSchema = z.object({
  collegeId: z.coerce.number().int().positive(),
});
