const express = require("express");
const router = express.Router();
const levelController = require("../controllers/levelController");

// Get list of all levels
router.get("/", levelController.levelList);

// Get level details
router.get("/:levelNum", levelController.levelDetails);

// Get level leaderboard
router.get("/:levelNum/leaderboard", levelController.leaderboardGET);

// POST score to level leaderboard
router.post("/:levelNum/leaderboard", levelController.leaderboardPOST);

// POST request for checking an answer is correct
router.post("/:levelNum/check-answer", levelController.checkAnswer);

// POST request for checking a level is complete
router.post("/:levelNum/check-complete", levelController.checkComplete);

module.exports = router;
