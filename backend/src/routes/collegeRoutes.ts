import { Router } from "express";
import {
  getCollegeBySlug,
  getColleges,
} from "../controllers/collegeController";

const router = Router();

router.get("/", getColleges);
router.get("/:slug", getCollegeBySlug);

export default router;
