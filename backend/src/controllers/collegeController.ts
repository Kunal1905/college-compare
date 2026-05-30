import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { Request, Response } from "express";
import { getCourseCategoryPatterns } from "../constants/courseCategories";
import { db } from "../db";
import { colleges, courses, placements, reviews } from "../db/schema";
import {
  collegeQuerySchema,
  slugParamSchema,
} from "../validations/collegeValidation";

const buildFilters = (query: {
  search?: string;
  location?: string[];
  course?: string;
  minRating?: number;
  maxFees?: number;
}) => {
  const filters: SQL[] = [];
  const buildCourseExistsFilter = (condition: SQL) =>
    sql<boolean>`exists (
      select 1
      from ${courses}
      where ${courses.collegeId} = ${colleges.id}
        and ${condition}
    )`;

  if (query.search) {
    filters.push(
      or(
        ilike(colleges.name, `%${query.search}%`),
        ilike(colleges.location, `%${query.search}%`),
        ilike(colleges.state, `%${query.search}%`),
        buildCourseExistsFilter(ilike(courses.name, `%${query.search}%`))
      )!
    );
  }

  if (query.location && query.location.length > 0) {
    filters.push(
      or(
        ...query.location.flatMap((location) => [
          ilike(colleges.location, `%${location}%`),
          ilike(colleges.state, `%${location}%`),
        ])
      )!
    );
  }

  if (query.course) {
    const coursePatterns = getCourseCategoryPatterns(query.course);
    const courseMatch = or(
      ...coursePatterns.map((pattern) => ilike(courses.name, pattern))
    );

    if (courseMatch) {
      filters.push(buildCourseExistsFilter(courseMatch));
    }
  }

  if (typeof query.minRating === "number") {
    filters.push(gte(colleges.rating, query.minRating));
  }

  if (typeof query.maxFees === "number") {
    filters.push(lte(colleges.fees, query.maxFees));
  }

  return filters.length > 0 ? and(...filters) : undefined;
};

export const getColleges = async (req: Request, res: Response) => {
  try {
    const parsedQuery = collegeQuerySchema.safeParse(req.query);

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
    const orderByClause =
      sort === "fees_asc" ? asc(colleges.fees) : desc(colleges.rating);
    const offset = (page - 1) * limit;

    const [countRow, collegeRows] = await Promise.all([
      db
        .select({
          total: sql<number>`cast(count(*) as int)`,
        })
        .from(colleges)
        .where(whereClause)
        .then((rows) => rows[0]),
      db
        .select({
          id: colleges.id,
          name: colleges.name,
          slug: colleges.slug,
          location: colleges.location,
          state: colleges.state,
          fees: colleges.fees,
          rating: colleges.rating,
          imageUrl: colleges.imageUrl,
          overview: colleges.overview,
          averagePackage: placements.averagePackage,
          highestPackage: placements.highestPackage,
          placementRate: placements.placementRate,
        })
        .from(colleges)
        .leftJoin(placements, eq(placements.collegeId, colleges.id))
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
    ]);

    const total = countRow?.total ?? 0;
    const collegeIds = collegeRows.map((college) => college.id);
    const courseRows =
      collegeIds.length > 0
        ? await db
            .select({
              collegeId: courses.collegeId,
              name: courses.name,
            })
            .from(courses)
            .where(inArray(courses.collegeId, collegeIds))
            .orderBy(asc(courses.name))
        : [];

    const coursesByCollege = new Map<number, string[]>();

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
  } catch (error) {
    console.error("Fetch colleges error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch colleges right now.",
    });
  }
};

export const getCollegeBySlug = async (req: Request, res: Response) => {
  try {
    const parsedParams = slugParamSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid college slug.",
      });
    }

    const { slug } = parsedParams.data;

    const [college, collegeCourses, collegeReviews] = await Promise.all([
      db
        .select({
          id: colleges.id,
          name: colleges.name,
          slug: colleges.slug,
          location: colleges.location,
          state: colleges.state,
          fees: colleges.fees,
          rating: colleges.rating,
          imageUrl: colleges.imageUrl,
          overview: colleges.overview,
          createdAt: colleges.createdAt,
          averagePackage: placements.averagePackage,
          highestPackage: placements.highestPackage,
          placementRate: placements.placementRate,
          topRecruiters: placements.topRecruiters,
        })
        .from(colleges)
        .leftJoin(placements, eq(placements.collegeId, colleges.id))
        .where(eq(colleges.slug, slug))
        .limit(1)
        .then((rows) => rows[0]),
      db
        .select({
          id: courses.id,
          name: courses.name,
          duration: courses.duration,
          fees: courses.fees,
        })
        .from(courses)
        .innerJoin(colleges, eq(courses.collegeId, colleges.id))
        .where(eq(colleges.slug, slug))
        .orderBy(asc(courses.fees)),
      db
        .select({
          id: reviews.id,
          student: reviews.student,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .innerJoin(colleges, eq(reviews.collegeId, colleges.id))
        .where(eq(colleges.slug, slug))
        .orderBy(desc(reviews.createdAt)),
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
        placement:
          college.averagePackage !== null &&
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
  } catch (error) {
    console.error("Fetch college detail error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch this college right now.",
    });
  }
};
