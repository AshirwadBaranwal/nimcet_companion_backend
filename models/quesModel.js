// models/Question.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    ques: {
      type: String,
      required: true,
    },
    options: [
      {
        text: { type: String, required: true },
        imageUrl: { type: String, default: null },
      },
    ],
    correctOption: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    review: {
      type: Boolean,
      default: false,
    },
    explanation: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    choosenOpt: {
      type: String,
      default: null,
    },
    marks: {
      type: Number,
      default: 4,
    },
    negativeMarks: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

questionSchema.index({ ques: "text" }); // for text search


export default Question;

