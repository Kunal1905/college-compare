"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSavedCollege = exports.getSavedColleges = exports.saveCollege = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const collegeValidation_1 = require("../validations/collegeValidation");
const getUserId = (req) => req.user?.userId;
const saveCollege = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const parsedBody = collegeValidation_1.saveCollegeSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid college selection.",
            });
        }
        const { collegeId } = parsedBody.data;
        const [college, existingSave] = await Promise.all([
            db_1.db
                .select({ id: schema_1.colleges.id })
                .from(schema_1.colleges)
                .where((0, drizzle_orm_1.eq)(schema_1.colleges.id, collegeId))
                .limit(1)
                .then((rows) => rows[0]),
            db_1.db
                .select({ id: schema_1.savedColleges.id })
                .from(schema_1.savedColleges)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.savedColleges.userId, userId), (0, drizzle_orm_1.eq)(schema_1.savedColleges.collegeId, collegeId)))
                .limit(1)
                .then((rows) => rows[0]),
        ]);
        if (!college) {
            return res.status(404).json({
                success: false,
                message: "College not found.",
            });
        }
        if (existingSave) {
            return res.status(409).json({
                success: false,
                message: "College is already saved.",
            });
        }
        const [savedCollege] = await db_1.db
            .insert(schema_1.savedColleges)
            .values({
            userId,
            collegeId,
        })
            .returning();
        return res.status(201).json({
            success: true,
            message: "College saved successfully.",
            data: savedCollege,
        });
    }
    catch (error) {
        console.error("Save college error", error);
        return res.status(500).json({
            success: false,
            message: "Unable to save college right now.",
        });
    }
};
exports.saveCollege = saveCollege;
const getSavedColleges = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const savedCollegeRows = await db_1.db
            .select({
            savedId: schema_1.savedColleges.id,
            savedAt: schema_1.savedColleges.createdAt,
            id: schema_1.colleges.id,
            name: schema_1.colleges.name,
            slug: schema_1.colleges.slug,
            location: schema_1.colleges.location,
            state: schema_1.colleges.state,
            fees: schema_1.colleges.fees,
            rating: schema_1.colleges.rating,
            imageUrl: schema_1.colleges.imageUrl,
            overview: schema_1.colleges.overview,
            averagePackage: schema_1.placements.averagePackage,
            highestPackage: schema_1.placements.highestPackage,
            placementRate: schema_1.placements.placementRate,
        })
            .from(schema_1.savedColleges)
            .innerJoin(schema_1.colleges, (0, drizzle_orm_1.eq)(schema_1.savedColleges.collegeId, schema_1.colleges.id))
            .leftJoin(schema_1.placements, (0, drizzle_orm_1.eq)(schema_1.placements.collegeId, schema_1.colleges.id))
            .where((0, drizzle_orm_1.eq)(schema_1.savedColleges.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.savedColleges.createdAt));
        const collegeIds = savedCollegeRows.map((college) => college.id);
        const courseRows = collegeIds.length > 0
            ? await db_1.db
                .select({
                collegeId: schema_1.courses.collegeId,
                name: schema_1.courses.name,
            })
                .from(schema_1.courses)
                .where((0, drizzle_orm_1.inArray)(schema_1.courses.collegeId, collegeIds))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.courses.name))
            : [];
        const coursesByCollege = new Map();
        for (const courseRow of courseRows) {
            const existingCourses = coursesByCollege.get(courseRow.collegeId) ?? [];
            existingCourses.push(courseRow.name);
            coursesByCollege.set(courseRow.collegeId, existingCourses);
        }
        return res.status(200).json({
            success: true,
            data: savedCollegeRows.map((college) => ({
                ...college,
                averagePackage: college.averagePackage ?? 0,
                highestPackage: college.highestPackage ?? 0,
                placementRate: college.placementRate ?? 0,
                courses: coursesByCollege.get(college.id) ?? [],
            })),
        });
    }
    catch (error) {
        console.error("Fetch saved colleges error", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch saved colleges right now.",
        });
    }
};
exports.getSavedColleges = getSavedColleges;
const removeSavedCollege = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const parsedParams = collegeValidation_1.collegeIdParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid college id.",
            });
        }
        const { collegeId } = parsedParams.data;
        const deletedRows = await db_1.db
            .delete(schema_1.savedColleges)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.savedColleges.userId, userId), (0, drizzle_orm_1.eq)(schema_1.savedColleges.collegeId, collegeId)))
            .returning({ id: schema_1.savedColleges.id });
        if (deletedRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Saved college not found.",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Saved college removed successfully.",
        });
    }
    catch (error) {
        console.error("Remove saved college error", error);
        return res.status(500).json({
            success: false,
            message: "Unable to remove saved college right now.",
        });
    }
};
exports.removeSavedCollege = removeSavedCollege;
