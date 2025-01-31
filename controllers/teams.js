// controllers/teams.js
const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Team = require("../models/team");
const playerRouter = require("./players");  // Import the new players router
const router = express.Router();

// POST /teams (Create a new team)
router.post("/", verifyToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized: Please log in first" });
        }

        const { name, city, stadium, sport } = req.body;
        if (!name || !city || !stadium || !sport) {
            return res.status(400).json({ error: "All fields (name, city, stadium, sport) are required." });
        }

        req.body.manager = req.user._id;
        const team = await Team.create(req.body);
        res.status(201).json({ team, manager: req.user._id });
    } catch (err) {
        console.error("Error creating team:", err);
        if (err.code === 11000) {
            return res.status(400).json({ error: "Team name already exists." });
        }
        res.status(500).json({ error: "Failed to create team. Please try again later." });
    }
});

// GET /teams (Get all teams)
router.get("/", verifyToken, async (req, res) => {
    try {
        const teams = await Team.find({})
            .populate("manager")
            .sort({ createdAt: "desc" });
        res.status(200).json(teams);
    } catch (err) {
        console.error("Error fetching teams:", err);
        res.status(500).json({ error: "Failed to fetch teams. Please try again later." });
    }
});

// Use the player routes for team-related player management
router.use("/:teamId/players", playerRouter);  // Adding the players routes under the team route

// Other team routes (update, delete, etc.)
router.put("/:teamId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: "Team not found." });
        }

        if (!team.manager.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not authorized to update this team." });
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.teamId,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedTeam);
    } catch (err) {
        console.error("Error updating team:", err);
        if (err.code === 11000) {
            return res.status(400).json({ error: "Team name already exists." });
        }
        res.status(500).json({ error: "Failed to update team. Please try again later." });
    }
});

router.delete("/:teamId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: "Team not found." });
        }

        if (!team.manager.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not authorized to delete this team." });
        }

        await Team.findByIdAndDelete(req.params.teamId);
        res.status(200).json({ message: "Team deleted successfully." });
    } catch (err) {
        console.error("Error deleting team:", err);
        res.status(500).json({ error: "Failed to delete team. Please try again later." });
    }
});

module.exports = router;
