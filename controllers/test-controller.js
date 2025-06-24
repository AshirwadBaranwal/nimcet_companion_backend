// controllers/testController.js

import Question from "../models/quesModel.js";
import Test from "../models/testModel.js";

// Create Test Controller
export const createTest = async (req, res) => {
  try {
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

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (type && !["practice", "mock"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'practice' or 'mock'",
      });
    }

    // Validate date ranges if both startTime and endTime are provided
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: "End time must be after start time",
        });
      }
    }

    // Create new test
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

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      data: savedTest,
    });
  } catch (error) {
    console.error("Error creating test:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find();
    if (tests) {
      return res.status(200).json({
        success: true,
        data: tests,
      });
    } else {
      return res.status(500).json({
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Fetch all questions by testId
export const getQuestionsByTestId = async (req, res) => {
  try {
    const { testId } = req.query;
    const category = req.body.selectedCategories;
    console.log(category);
    if (!testId) {
      return res.status(400).json({ message: "Missing testId in body" });
    }

    const filter = { testId };

    if (Array.isArray(category) && category.length > 0) {
      filter.category = { $in: category };
    }

    const questions = await Question.find(filter).sort({ questionNo: 1 });

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions", error });
  }
};

// Add single question
export const addSingleQuestion = async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    await newQuestion.save();
    res
      .status(201)
      .json({ message: "Question added successfully", question: newQuestion });
  } catch (error) {
    res.status(400).json({ message: "Failed to add question", error });
  }
};

// Add multiple questions at once
export const addMultipleQuestions = async (req, res) => {
  try {
    const questionsArray = req.body.questions;
    if (!Array.isArray(questionsArray)) {
      return res
        .status(400)
        .json({ message: "Invalid format: Expected an array" });
    }

    const inserted = await Question.insertMany(questionsArray);
    res.status(201).json({ message: "Questions added successfully", inserted });
  } catch (error) {
    res.status(500).json({ message: "Failed to add questions", error });
  }
};
