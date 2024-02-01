const Level = require("../models/level");
const Leaderboard = require("../models/leaderboard");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const { body, validationResult } = require("express-validator");

// Get list of all levels
exports.levelList = asyncHandler(async (req, res, next) => {
  const levels = await Level.find({}, "levelNum imageUrl")
    .sort({ levelNum: 1 })
    .exec();

  res.json(levels);
});

// Get level details
exports.levelDetails = asyncHandler(async (req, res, next) => {
  const data = await Level.findById(req.params.levelId).exec();

  if (!data) {
    const err = new Error("Level not found");
    err.status = 404;
    return next(err);
  }

  const userId = uuid();

  const token = jwt.sign({ cur: userId }, process.env.JWT_KEY, (err, token) => {
    if (err) return next(err);
    return res.json({ token, data });
  });
});

// Get level leaderboard
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
exports.leaderboardPOST = asyncHandler(async (req, res, next) => {
  res.json({ msg: "Not yet implemented" });
});

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

    const answer = data.answers[0];

    const validateCoords = (correctX, correctY, userX, userY, size) => {
      const deltaX = correctX - userX;
      const deltaY = correctY - userY;
      return deltaX ** 2 + deltaY ** 2 <= size ** 2;
    };

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
exports.checkComplete = asyncHandler(async (req, res, next) => {
  res.json({ msg: "Not yet implemented" });
});
