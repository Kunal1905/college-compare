"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollegeBySlug = exports.getColleges = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const courseCategories_1 = require("../constants/courseCategories");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const collegeValidation_1 = require("../validations/collegeValidation");
const buildFilters = (query) => {
    const filters = [];
    const buildCourseExistsFilter = (condition) => (0, drizzle_orm_1.sql) `exists (
      select 1
      from ${schema_1.courses}
      where ${schema_1.courses.collegeId} = ${schema_1.colleges.id}
        and ${condition}
    )`;
    if (query.search) {
        filters.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.colleges.name, `%${query.search}%`), (0, drizzle_orm_1.ilike)(schema_1.colleges.location, `%${query.search}%`), (0, drizzle_orm_1.ilike)(schema_1.colleges.state, `%${query.search}%`), buildCourseExistsFilter((0, drizzle_orm_1.ilike)(schema_1.courses.name, `%${query.search}%`))));
    }
    if (query.location && query.location.length > 0) {
        filters.push((0, drizzle_orm_1.or)(...query.location.flatMap((location) => [
            (0, drizzle_orm_1.ilike)(schema_1.colleges.location, `%${location}%`),
            (0, drizzle_orm_1.ilike)(schema_1.colleges.state, `%${location}%`),
        ])));
    }
    if (query.course) {
        const coursePatterns = (0, courseCategories_1.getCourseCategoryPatterns)(query.course);
        const courseMatch = (0, drizzle_orm_1.or)(...coursePatterns.map((pattern) => (0, drizzle_orm_1.ilike)(schema_1.courses.name, pattern)));
        if (courseMatch) {
            filters.push(buildCourseExistsFilter(courseMatch));
        }
    }
    if (typeof query.minRating === "number") {
        filters.push((0, drizzle_orm_1.gte)(schema_1.colleges.rating, query.minRating));
    }
    if (typeof query.maxFees === "number") {
        filters.push((0, drizzle_orm_1.lte)(schema_1.colleges.fees, query.maxFees));
    }
    return filters.length > 0 ? (0, drizzle_orm_1.and)(...filters) : undefined;
};
const getColleges = async (req, res) => {
    try {
        const parsedQuery = collegeValidation_1.collegeQuerySchema.safeParse(req.query);
        if (!parsedQuery.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid filters supplied.",
            });
        }
        const { page, limit, sort, location, ...filters } = parsedQuery.data;
        const whereClause = buildFilters({
            ...filters,
            location: location
                ?.split(",")
                .map((value) => value.trim())
                .filter(Boolean),
        });
        const orderByClause = sort === "fees_asc" ? (0, drizzle_orm_1.asc)(schema_1.colleges.fees) : (0, drizzle_orm_1.desc)(schema_1.colleges.rating);
        const offset = (page - 1) * limit;
        const [countRow, collegeRows] = await Promise.all([
            db_1.db
                .select({
                total: (0, drizzle_orm_1.sql) `cast(count(*) as int)`,
            })
                .from(schema_1.colleges)
                .where(whereClause)
                .then((rows) => rows[0]),
            db_1.db
                .select({
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
                .from(schema_1.colleges)
                .leftJoin(schema_1.placements, (0, drizzle_orm_1.eq)(schema_1.placements.collegeId, schema_1.colleges.id))
                .where(whereClause)
                .orderBy(orderByClause)
                .limit(limit)
                .offset(offset),
        ]);
        const total = countRow?.total ?? 0;
        const collegeIds = collegeRows.map((college) => college.id);
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
            data: collegeRows.map((college) => ({
                ...college,
                averagePackage: college.averagePackage ?? 0,
                highestPackage: college.highestPackage ?? 0,
                placementRate: college.placementRate ?? 0,
                courses: coursesByCollege.get(college.id) ?? [],
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    }
    catch (error) {
        console.error("Fetch colleges error", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch colleges right now.",
        });
    }
};
exports.getColleges = getColleges;
const getCollegeBySlug = async (req, res) => {
    try {
        const parsedParams = collegeValidation_1.slugParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid college slug.",
            });
        }
        const { slug } = parsedParams.data;
        const [college, collegeCourses, collegeReviews] = await Promise.all([
            db_1.db
                .select({
                id: schema_1.colleges.id,
                name: schema_1.colleges.name,
                slug: schema_1.colleges.slug,
                location: schema_1.colleges.location,
                state: schema_1.colleges.state,
                fees: schema_1.colleges.fees,
                rating: schema_1.colleges.rating,
                imageUrl: schema_1.colleges.imageUrl,
                overview: schema_1.colleges.overview,
                createdAt: schema_1.colleges.createdAt,
                averagePackage: schema_1.placements.averagePackage,
                highestPackage: schema_1.placements.highestPackage,
                placementRate: schema_1.placements.placementRate,
                topRecruiters: schema_1.placements.topRecruiters,
            })
                .from(schema_1.colleges)
                .leftJoin(schema_1.placements, (0, drizzle_orm_1.eq)(schema_1.placements.collegeId, schema_1.colleges.id))
                .where((0, drizzle_orm_1.eq)(schema_1.colleges.slug, slug))
                .limit(1)
                .then((rows) => rows[0]),
            db_1.db
                .select({
                id: schema_1.courses.id,
                name: schema_1.courses.name,
                duration: schema_1.courses.duration,
                fees: schema_1.courses.fees,
            })
                .from(schema_1.courses)
                .innerJoin(schema_1.colleges, (0, drizzle_orm_1.eq)(schema_1.courses.collegeId, schema_1.colleges.id))
                .where((0, drizzle_orm_1.eq)(schema_1.colleges.slug, slug))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.courses.fees)),
            db_1.db
                .select({
                id: schema_1.reviews.id,
                student: schema_1.reviews.student,
                rating: schema_1.reviews.rating,
                comment: schema_1.reviews.comment,
                createdAt: schema_1.reviews.createdAt,
            })
                .from(schema_1.reviews)
                .innerJoin(schema_1.colleges, (0, drizzle_orm_1.eq)(schema_1.reviews.collegeId, schema_1.colleges.id))
                .where((0, drizzle_orm_1.eq)(schema_1.colleges.slug, slug))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.reviews.createdAt)),
        ]);
        if (!college) {
            return res.status(404).json({
                success: false,
                message: "College not found.",
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                id: college.id,
                name: college.name,
                slug: college.slug,
                location: college.location,
                state: college.state,
                fees: college.fees,
                rating: college.rating,
                imageUrl: college.imageUrl,
                overview: college.overview,
                createdAt: college.createdAt,
                courses: collegeCourses,
                placement: college.averagePackage !== null &&
                    college.highestPackage !== null &&
                    college.placementRate !== null
                    ? {
                        averagePackage: college.averagePackage,
                        highestPackage: college.highestPackage,
                        placementRate: college.placementRate,
                        topRecruiters: college.topRecruiters ?? [],
                    }
                    : null,
                reviews: collegeReviews,
            },
        });
    }
    catch (error) {
        console.error("Fetch college detail error", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch this college right now.",
        });
    }
};
exports.getCollegeBySlug = getCollegeBySlug;
