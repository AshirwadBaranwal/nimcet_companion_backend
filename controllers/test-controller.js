// controllers/testController.js

import QuestionGroup from "../models/quesGroupModel.js";
import Question from "../models/quesModel.js";
import Test from "../models/testModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Create Test
export const createTest = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    durationMinutes,
    totalQuestions,
    totalMarks,
    isActive,
    startTime,
    endTime,
    type,
    tags,
  } = req.body;

  if (!title) throw new ApiError(400, "Test title is required");
  if (type && !["practice", "mock"].includes(type)) {
    throw new ApiError(400, "Test type must be either 'practice' or 'mock'");
  }
  if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
    throw new ApiError(400, "End time must be after start time");
  }

  const newTest = new Test({
    title: title.trim(),
    description: description?.trim() || "",
    category: Array.isArray(category)
      ? category.filter((cat) => cat.trim())
      : [],
    durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
    totalQuestions: totalQuestions ? parseInt(totalQuestions) : undefined,
    totalMarks: totalMarks ? parseInt(totalMarks) : undefined,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    startTime: startTime ? new Date(startTime) : undefined,
    endTime: endTime ? new Date(endTime) : undefined,
    type: type || "practice",
    tags: Array.isArray(tags) ? tags.filter((tag) => tag.trim()) : [],
  });

  const savedTest = await newTest.save();
  res
    .status(201)
    .json({ message: "Test created successfully", data: savedTest });
});

export const getAllTests = asyncHandler(async (req, res) => {
  const tests = await Test.find();
  if (!tests) throw new ApiError(404, "No tests found");
  res.status(200).json({ data: tests });
});

export const getQuestionsByTestId = asyncHandler(async (req, res) => {
  const { testId } = req.query;
  const category = req.body.selectedCategories;
  if (!testId) throw new ApiError(400, "Missing testId in request");

  const filter = { testId };
  if (Array.isArray(category) && category.length > 0) {
    filter.category = { $in: category };
  }

  const questions = await Question.find(filter).sort({ questionNo: 1 });
  res.status(200).json(questions);
});

export const addSingleQuestion = asyncHandler(async (req, res) => {
  const newQuestion = new Question(req.body);
  await newQuestion.save();
  res
    .status(201)
    .json({ message: "Question added successfully", question: newQuestion });
});

export const addMultipleQuestions = asyncHandler(async (req, res) => {
  const questionsArray = req.body.questions;
  if (!Array.isArray(questionsArray)) {
    throw new ApiError(
      400,
      "Invalid request body: 'questions' must be an array"
    );
  }

  const inserted = await Question.insertMany(questionsArray);
  res.status(201).json({ message: "Questions added successfully", inserted });
});

export const createQuestionGroup = asyncHandler(async (req, res) => {
  const { title, instructions, testId, category, start, last } = req.body;
  if (!instructions || !testId) {
    throw new ApiError(400, "Instructions and testId are required");
  }

  const newGroup = await QuestionGroup.create({
    title,
    instructions,
    testId,
    category,
    start,
    last,
  });
  res.status(201).json({ message: "Question group created", group: newGroup });
});

export const getGroupsByTestId = asyncHandler(async (req, res) => {
  const { testId } = req.query;
  const selectedCategories = req.body.selectedCategories;
  if (!testId) throw new ApiError(400, "Missing testId in query");

  const filter = { testId };
  if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
    filter.category = { $in: selectedCategories };
  }

  const groups = await QuestionGroup.find(filter);
  res.status(200).json(groups);
});

export const deleteQuestionGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const group = await QuestionGroup.findByIdAndDelete(id);
  if (!group) throw new ApiError(404, "Question group not found");
  res.status(200).json({ message: "Question group deleted" });
});

export const updateQuestionGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, instructions } = req.body;
  const updated = await QuestionGroup.findByIdAndUpdate(
    id,
    { title, instructions },
    { new: true }
  );
  if (!updated) throw new ApiError(404, "Question group not found");
  res.status(200).json({ message: "Question group updated", updated });
});
