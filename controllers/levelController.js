const Level = require("../models/level");
const Leaderboard = require("../models/leaderboard");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");

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
exports.checkAnswer = asyncHandler(async (req, res, next) => {
  res.json({ msg: "Not yet implemented" });
});

// POST request for checking a level is complete
exports.checkComplete = asyncHandler(async (req, res, next) => {
  res.json({ msg: "Not yet implemented" });
});
