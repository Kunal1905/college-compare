"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collegeIdParamSchema = exports.saveCollegeSchema = exports.slugParamSchema = exports.collegeQuerySchema = void 0;
const zod_1 = require("zod");
const optionalTrimmedString = zod_1.z.preprocess((value) => {
    if (typeof value !== "string") {
        return value;
    }
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
}, zod_1.z.string().trim().optional());
const optionalNumberInRange = (minimum, maximum) => zod_1.z.preprocess((value) => {
    if (typeof value !== "string") {
        return value;
    }
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
}, zod_1.z.coerce.number().min(minimum).max(maximum).optional());
const optionalPositiveInteger = zod_1.z.preprocess((value) => {
    if (typeof value !== "string") {
        return value;
    }
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
}, zod_1.z.coerce.number().int().positive().optional());
exports.collegeQuerySchema = zod_1.z.object({
    search: optionalTrimmedString,
    location: optionalTrimmedString,
    course: optionalTrimmedString,
    minRating: optionalNumberInRange(0, 5),
    maxFees: optionalPositiveInteger,
    sort: zod_1.z.enum(["rating_desc", "fees_asc"]).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(24).default(8),
});
exports.slugParamSchema = zod_1.z.object({
    slug: zod_1.z.string().trim().min(1),
});
exports.saveCollegeSchema = zod_1.z.object({
    collegeId: zod_1.z.coerce.number().int().positive(),
});
exports.collegeIdParamSchema = zod_1.z.object({
    collegeId: zod_1.z.coerce.number().int().positive(),
});
