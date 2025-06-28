import mongoose from "mongoose";

const questionGroupSchema = new mongoose.Schema({
  title: String, // optional short title (e.g., "Directions for Q80–Q84")
  start: Number,
  last: Number,
  instructions: String, // full shared passage/instruction
  category: String, // full shared passage/instruction
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
});
const QuestionGroup = mongoose.model("QuestionGroup", questionGroupSchema);

export default QuestionGroup;
