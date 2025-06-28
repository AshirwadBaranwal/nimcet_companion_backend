import express from "express";
import {
  addMultipleQuestions,
  addSingleQuestion,
  createQuestionGroup,
  createTest,
  deleteQuestionGroup,
  getAllTests,
  getGroupsByTestId,
  getQuestionsByTestId,
  updateQuestionGroup,
} from "../controllers/test-controller.js";

const testRouter = express.Router();

testRouter.route("/create").post(createTest);
testRouter.route("/tests").post(getAllTests);
testRouter.route("/addquestion").post(addSingleQuestion);
testRouter.route("/addquestions").post(addMultipleQuestions);
testRouter.route("/getallquestions").post(getQuestionsByTestId);
testRouter.post("/group/create", createQuestionGroup);
testRouter.post("/group", getGroupsByTestId);
testRouter.delete("/group/:id", deleteQuestionGroup);
testRouter.put("/group/:id", updateQuestionGroup);

export default testRouter;
