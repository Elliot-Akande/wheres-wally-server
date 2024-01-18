const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true, min: 0 },
});

const LeaderboardSchema = new mongoose.Schema({
  level: { type: mongoose.Types.ObjectId, ref: "Level", required: true },
  scores: { type: [scoreSchema], required: true },
});

module.exports = mongoose.model("Leaderboard", LeaderboardSchema);
