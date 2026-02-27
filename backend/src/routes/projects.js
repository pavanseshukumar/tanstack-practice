import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createProject,
  listProjects,
  getProjectBoard,
} from "../controllers/projectController.js";
import { createIssue } from "../controllers/issueController.js";

const router = Router();

router.post("/", authenticate, createProject);
router.get("/", authenticate, listProjects);
router.get("/:projectId/board", authenticate, getProjectBoard);
router.post("/:projectId/issues", authenticate, createIssue);

export default router;

