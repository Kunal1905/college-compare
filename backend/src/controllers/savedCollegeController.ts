import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { Response } from "express";
import { db } from "../db";
import { colleges, courses, placements, savedColleges } from "../db/schema";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  collegeIdParamSchema,
  saveCollegeSchema,
} from "../validations/collegeValidation";

const getUserId = (req: AuthenticatedRequest) => req.user?.userId;

export const saveCollege = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const parsedBody = saveCollegeSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid college selection.",
      });
    }

    const { collegeId } = parsedBody.data;

    const [college, existingSave] = await Promise.all([
      db
        .select({ id: colleges.id })
        .from(colleges)
        .where(eq(colleges.id, collegeId))
        .limit(1)
        .then((rows) => rows[0]),
      db
        .select({ id: savedColleges.id })
        .from(savedColleges)
        .where(
          and(
            eq(savedColleges.userId, userId),
            eq(savedColleges.collegeId, collegeId)
          )
        )
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

    const [savedCollege] = await db
      .insert(savedColleges)
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
  } catch (error) {
    console.error("Save college error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save college right now.",
    });
  }
};

export const getSavedColleges = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const savedCollegeRows = await db
      .select({
        savedId: savedColleges.id,
        savedAt: savedColleges.createdAt,
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
      .from(savedColleges)
      .innerJoin(colleges, eq(savedColleges.collegeId, colleges.id))
      .leftJoin(placements, eq(placements.collegeId, colleges.id))
      .where(eq(savedColleges.userId, userId))
      .orderBy(desc(savedColleges.createdAt));

    const collegeIds = savedCollegeRows.map((college) => college.id);
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
      data: savedCollegeRows.map((college) => ({
        ...college,
        averagePackage: college.averagePackage ?? 0,
        highestPackage: college.highestPackage ?? 0,
        placementRate: college.placementRate ?? 0,
        courses: coursesByCollege.get(college.id) ?? [],
      })),
    });
  } catch (error) {
    console.error("Fetch saved colleges error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch saved colleges right now.",
    });
  }
};

export const removeSavedCollege = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const parsedParams = collegeIdParamSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid college id.",
      });
    }

    const { collegeId } = parsedParams.data;

    const deletedRows = await db
      .delete(savedColleges)
      .where(
        and(
          eq(savedColleges.userId, userId),
          eq(savedColleges.collegeId, collegeId)
        )
      )
      .returning({ id: savedColleges.id });

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
  } catch (error) {
    console.error("Remove saved college error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to remove saved college right now.",
    });
  }
};
