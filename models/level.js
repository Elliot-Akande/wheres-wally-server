const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  character: { type: String, required: true },
  imageUrl: { type: String, required: true },
  xCoord: { type: Number, required: true, min: 0 },
  yCoord: { type: Number, required: true, min: 0 },
  size: { type: Number, required: true, min: 0, default: 50 },
});

const LevelSchema = new Schema({
  levelNum: { type: Number, required: true, unique: true, min: 1 },
  imageUrl: { type: String, required: true },
  answers: { type: [answerSchema], required: true },
});

module.exports = mongoose.model("Level", LevelSchema);
