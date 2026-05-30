import { Router } from "express";
import {
  getSavedColleges,
  removeSavedCollege,
  saveCollege,
} from "../controllers/savedCollegeController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.post("/", saveCollege);
router.get("/", getSavedColleges);
router.delete("/:collegeId", removeSavedCollege);

export default router;
