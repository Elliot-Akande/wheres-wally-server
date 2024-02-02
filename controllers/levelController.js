const Level = require("../models/level");
const Leaderboard = require("../models/leaderboard");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const parseJWT = (req, res, next) => {
  // Check JWT is present
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader === "undefined") {
    const err = new Error("Forbidden");
    err.status = 403;
    return next(err);
  }

  // Verify token
  const token = bearerHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_KEY, (err, data) => {
    if (err) {
      const error = new Error("Invalid token");
      error.status = 403;
      return next(error);
    }
    req.token = data;
    next();
  });
};

// GET list of all levels
exports.levelList = asyncHandler(async (req, res, next) => {
  const levels = await Level.find({}, "levelNum imageUrl")
    .sort({ levelNum: 1 })
    .exec();

  res.json(levels);
});

// GET level details
exports.levelDetails = asyncHandler(async (req, res, next) => {
  const data = await Level.findById(req.params.levelId).exec();

  if (!data) {
    const err = new Error("Level not found");
    err.status = 404;
    return next(err);
  }

  jwt.sign({ isComplete: false }, process.env.JWT_KEY, (err, token) => {
    if (err) return next(err);
    return res.json({ token, data });
  });
});

// GET level leaderboard
exports.leaderboardGET = asyncHandler(async (req, res, next) => {
  const leaderboard = await Leaderboard.findOne({
    level: req.params.levelId,
  }).exec();

  if (!leaderboard) {
    const err = new Error("Leaderboard not found");
    err.status = 404;
    return next(err);
  }

  res.json(leaderboard);
});

// POST score to level leaderboard
exports.leaderboardPOST = [
  body("name", "Name must be present").trim().isLength({ min: 1 }).escape(),
  parseJWT,
  asyncHandler(async (req, res, next) => {
    // Check level is complete
    if (!req.token.isComplete) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }

    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check level exists
    const leaderboard = await Leaderboard.findOne({
      level: req.params.levelId,
    }).exec();
    if (!leaderboard) {
      const err = new Error("Level not found");
      err.status = 404;
      return next(err);
    }

    // Recursive binary search
    const insertIntoLeaderboard = (
      user,
      start = 0,
      end = leaderboard.scores.length - 1
    ) => {
      const middle = Math.floor((start + end) / 2);
      const currEntry = leaderboard.scores[middle];

      if (start === end) {
        if (currEntry.score > user.score) {
          leaderboard.scores.splice(middle, 1, user, currEntry);
        } else {
          leaderboard.scores.splice(middle, 1, currEntry, user);
        }
        leaderboard.save();
        return;
      }

      if (currEntry.score > user.score) {
        return insertIntoLeaderboard(user, start, middle - 1);
      }

      if (currEntry.score < user.score) {
        return insertIntoLeaderboard(user, middle + 1, end);
      }
    };

    insertIntoLeaderboard({ name: req.body.name, score: req.token.score });
    res.json(leaderboard);
  }),
];

// POST request for checking an answer is correct
exports.checkAnswer = [
  body("character", "Character must be present")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("xCoord", "xCoord must be an integer of 0 or more")
    .trim()
    .isInt({ min: 0 }),
  body("yCoord", "yCoord must be an integer of 0 or more")
    .trim()
    .isInt({ min: 0 }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { character, xCoord, yCoord } = req.body;
    const data = await Level.findOne(
      { "answers.character": character },
      { "answers.$": 1 }
    ).exec();

    // Check supplied character is in this level
    if (!data) {
      const err = new Error("Character not in level");
      err.status = 404;
      return next(err);
    }

    const validateCoords = (correctX, correctY, userX, userY, size) => {
      const deltaX = correctX - userX;
      const deltaY = correctY - userY;
      return deltaX ** 2 + deltaY ** 2 <= size ** 2;
    };

    const answer = data.answers[0];
    res.json({
      isCorrect: validateCoords(
        answer.xCoord,
        answer.yCoord,
        xCoord,
        yCoord,
        answer.size
      ),
    });
  }),
];

// POST request for checking a level is complete
exports.checkComplete = [
  body("answers", "Answers must be present and must be an array").isArray(),
  body("answers.*.character", "Character must be present")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("answers.*.xCoord", "xCoord must be an integer of 0 or more")
    .trim()
    .isInt({ min: 0 }),
  body("answers.*.yCoord", "yCoord must be an integer of 0 or more")
    .trim()
    .isInt({ min: 0 }),

  parseJWT,
  asyncHandler(async (req, res, next) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check level exists
    const level = await Level.findById(req.params.levelId).exec();
    if (!level) {
      const err = new Error("Level not found");
      err.status = 404;
      return next(err);
    }

    const isCorrectAnswer = (correctAnswer, userAnswer) => {
      const deltaX = correctAnswer.xCoord - userAnswer.xCoord;
      const deltaY = correctAnswer.yCoord - userAnswer.yCoord;
      return deltaX ** 2 + deltaY ** 2 <= correctAnswer.size ** 2;
    };

    // Check answers are correct
    const { answers } = req.body;
    level.answers.forEach((correctAnswer) => {
      const userAnswer = answers.find(
        (answer) => answer.character === correctAnswer.character
      );

      if (
        typeof userAnswer === "undefined" ||
        !isCorrectAnswer(correctAnswer, userAnswer)
      ) {
        return res.json({ isComplete: false });
      }
    });

    // Create new token
    const finishTime = Math.round(new Date().getTime() / 1000);
    jwt.sign(
      { isComplete: true, score: finishTime - req.token.iat },
      process.env.JWT_KEY,
      (err, newToken) => {
        if (err) return next(err);
        // Send score data with new token
        return res.json({
          token: newToken,
          score: finishTime - req.token.iat,
          isComplete: true,
        });
      }
    );
  }),
];
