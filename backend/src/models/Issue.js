import mongoose from "mongoose";

const { Schema } = mongoose;

const issueSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    issueNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    statusId: {
      type: Schema.Types.ObjectId,
      ref: "Status",
      required: true,
      index: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

issueSchema.index({ projectId: 1, issueNumber: 1 }, { unique: true });

export const Issue = mongoose.model("Issue", issueSchema);

