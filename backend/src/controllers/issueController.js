import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Status } from "../models/Status.js";
import { Issue } from "../models/Issue.js";

const { isValidObjectId } = mongoose;

export async function createIssue(req, res) {
  try {
    const userId = req.user?.id;
    const { projectId } = req.params;
    const { title, description, assignee } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!isValidObjectId(projectId)) {
      res.status(400).json({ message: "Invalid project id." });
      return;
    }

    if (!title) {
      res.status(400).json({ message: "Title is required." });
      return;
    }

    const project = await Project.findOneAndUpdate(
      { _id: projectId, members: userId },
      { $inc: { issueCounter: 1 } },
      { new: true },
    );

    if (!project) {
      res
        .status(404)
        .json({ message: "Project not found or access denied." });
      return;
    }

    const defaultStatus = await Status.findOne({
      projectId: project._id,
    }).sort({ order: 1 });

    if (!defaultStatus) {
      res
        .status(500)
        .json({ message: "No default status configured for project." });
      return;
    }

    const lastIssue = await Issue.findOne({
      projectId: project._id,
      statusId: defaultStatus._id,
    })
      .sort({ order: -1 })
      .lean();

    const nextOrder = (lastIssue?.order ?? 0) + 1;

    const issue = await Issue.create({
      projectId: project._id,
      issueNumber: project.issueCounter,
      title,
      description: description || "",
      statusId: defaultStatus._id,
      assignee: assignee && isValidObjectId(assignee) ? assignee : undefined,
      order: nextOrder,
    });

    res.status(201).json(issue);
  } catch (err) {
    console.error("Create issue error:", err);
    res
      .status(500)
      .json({ message: "Failed to create issue. Please try again." });
  }
}

export async function moveIssue(req, res) {
  try {
    const userId = req.user?.id;
    const { issueId } = req.params;
    const { statusId, order } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!isValidObjectId(issueId) || !isValidObjectId(statusId)) {
      res.status(400).json({ message: "Invalid issue or status id." });
      return;
    }

    if (typeof order !== "number" || order < 1) {
      res
        .status(400)
        .json({ message: "Order must be a positive number." });
      return;
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      res.status(404).json({ message: "Issue not found." });
      return;
    }

    const project = await Project.findOne({
      _id: issue.projectId,
      members: userId,
    });

    if (!project) {
      res
        .status(403)
        .json({ message: "You do not have access to this project." });
      return;
    }

    const status = await Status.findOne({
      _id: statusId,
      projectId: project._id,
    });
    if (!status) {
      res.status(400).json({ message: "Status does not belong to project." });
      return;
    }

    issue.statusId = statusId;
    issue.order = order;
    await issue.save();

    res.json(issue);
  } catch (err) {
    console.error("Move issue error:", err);
    res
      .status(500)
      .json({ message: "Failed to move issue. Please try again." });
  }
}

