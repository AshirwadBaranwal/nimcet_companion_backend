import express from "express";
import {
  addMultipleQuestions,
  addSingleQuestion,
  createTest,
  getAllTests,
  getQuestionsByTestId,
} from "../controllers/test-controller.js";

const testRouter = express.Router();

testRouter.route("/create").post(createTest);
testRouter.route("/tests").post(getAllTests);
testRouter.route("/addquestion").post(addSingleQuestion);
testRouter.route("/addquestions").post(addMultipleQuestions);
testRouter.route("/getallquestions").post(getQuestionsByTestId);

export default testRouter;
