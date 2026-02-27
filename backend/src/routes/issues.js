import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { moveIssue } from "../controllers/issueController.js";

const router = Router();

router.patch("/:issueId/move", authenticate, moveIssue);

export default router;

