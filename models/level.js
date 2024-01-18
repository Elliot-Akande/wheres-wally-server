const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  character: { type: String, required: true },
  xCoord: { type: Number, required: true, min: 0 },
  yCoord: { type: Number, required: true, min: 0 },
});

const LevelSchema = new Schema({
  levelNum: { type: Number, required: true, unique: true, min: 1 },
  answers: { type: [answerSchema], required: true },
});

module.exports = mongoose.model("Level", LevelSchema);
