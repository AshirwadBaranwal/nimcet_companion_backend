import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: [String],
    durationMinutes: Number,
    totalQuestions: Number,
    totalMarks: Number,
    isActive: { type: Boolean, default: true },
    startTime: Date,
    endTime: Date,
    type: { type: String, enum: ["practice", "mock"] },
    tags: [String],
  },
  { timestamps: true }
);

const Test = mongoose.model("Test", testSchema);

export default Test;
