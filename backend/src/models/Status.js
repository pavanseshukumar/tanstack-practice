import mongoose from "mongoose";

const { Schema } = mongoose;

const statusSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
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

export const Status = mongoose.model("Status", statusSchema);

