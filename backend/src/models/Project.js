import mongoose from "mongoose";

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    issueCounter: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Project = mongoose.model("Project", projectSchema);

