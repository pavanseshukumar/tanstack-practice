import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Status } from "../models/Status.js";
import { Issue } from "../models/Issue.js";

const { isValidObjectId } = mongoose;

export async function createProject(req, res) {
  try {
    const { name, key, description } = req.body;

    if (!name || !key) {
      res
        .status(400)
        .json({ message: "Project name and key are required." });
      return;
    }

    const normalizedKey = String(key).toUpperCase().trim();

    const existing = await Project.findOne({ key: normalizedKey });
    if (existing) {
      res
        .status(409)
        .json({ message: "A project with this key already exists." });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const session = await mongoose.startSession();
    let project;

    await session.withTransaction(async () => {
      project = await Project.create(
        [
          {
            name,
            key: normalizedKey,
            description: description || "",
            createdBy: userId,
            members: [userId],
          },
        ],
        { session },
      ).then((docs) => docs[0]);

      const defaultStatuses = [
        { name: "Todo", order: 1 },
        { name: "In Progress", order: 2 },
        { name: "Review", order: 3 },
        { name: "Completed", order: 4 },
      ].map((s) => ({
        ...s,
        projectId: project._id,
      }));

      await Status.insertMany(defaultStatuses, { session });
    });

    await session.endSession();

    res.status(201).json(project);
  } catch (err) {
    console.error("Create project error:", err);
    res
      .status(500)
      .json({ message: "Failed to create project. Please try again." });
  }
}

export async function listProjects(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const projects = await Project.find({ members: userId }).sort({
      createdAt: -1,
    });

    res.json(projects);
  } catch (err) {
    console.error("List projects error:", err);
    res.status(500).json({ message: "Failed to load projects." });
  }
}

export async function getProjectBoard(req, res) {
  try {
    const userId = req.user?.id;
    const { projectId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!isValidObjectId(projectId)) {
      res.status(400).json({ message: "Invalid project id." });
      return;
    }

    const project = await Project.findOne({
      _id: projectId,
      members: userId,
    });

    if (!project) {
      res
        .status(404)
        .json({ message: "Project not found or access denied." });
      return;
    }

    const [statuses, issues] = await Promise.all([
      Status.find({ projectId: project._id }).sort({ order: 1 }),
      Issue.find({ projectId: project._id }),
    ]);

    res.json({
      project,
      statuses,
      issues,
    });
  } catch (err) {
    console.error("Get board error:", err);
    res.status(500).json({ message: "Failed to load board." });
  }
}

