const express = require("express");
const router = express.Router();
const levelController = require("../controllers/levelController");

// Get list of all levels
router.get("/", levelController.levelList);

// Get level details
router.get("/:levelId", levelController.levelDetails);

// Get level leaderboard
router.get("/:levelId/leaderboard", levelController.leaderboardGET);

// POST score to level leaderboard
router.post("/:levelId/leaderboard", levelController.leaderboardPOST);

// POST request for checking an answer is correct
router.post("/:levelId/check-answer", levelController.checkAnswer);

// POST request for checking a level is complete
router.post("/:levelId/check-complete", levelController.checkComplete);

module.exports = router;
