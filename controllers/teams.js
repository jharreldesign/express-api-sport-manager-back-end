const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Team = require("../models/team");
const router = express.Router();

// POST /teams (Create a new team)
router.post("/", verifyToken, async (req, res) => {
    try {
        req.body.manager = req.user._id;
        const team = await Team.create(req.body);
        res.status(201).json({ team, manager: req.user._id });  // Returning only _id of the manager
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
});

// PUT /teams/:teamId (Update a specific team)
router.put("/:teamId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team.manager.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.teamId,
            req.body,
            { new: true }
        );

        updatedTeam.manager = req.user;  // Explicitly set the manager here
        res.status(200).json(updatedTeam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /teams/:teamId (Delete a specific team)
router.delete("/:teamId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team.manager.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }

        const deletedTeam = await Team.findByIdAndDelete(req.params.teamId);
        res.status(200).json(deletedTeam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /teams/:teamId/players (Add a player to a team)
router.post("/:teamId/players", verifyToken, async (req, res) => {
    try {
        req.body.manager = req.user._id;
        const team = await Team.findById(req.params.teamId);

        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        // Optionally check for existing player with the same number
        const existingPlayer = team.players.find(player => player.player_number === req.body.player_number);
        if (existingPlayer) {
            return res.status(400).json({ error: "Player with this number already exists" });
        }

        team.players.push(req.body);
        await team.save();

        const newPlayer = team.players[team.players.length - 1];
        res.status(201).json(newPlayer);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /teams/:teamId (Get a specific team by ID)
router.get("/:teamId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId).populate([
            'manager',
            'players.manager',
        ]);
        res.status(200).json(team);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.put("/:teamId/players/:playerId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        const player = team.players.id(req.params.playerId);
        if (!player) {
            return res.status(404).json({ error: "Player not found" });
        }

        if (!player.manager || String(player.manager) !== String(req.user._id)) {
            return res.status(403).json({ message: "You are not authorized to edit this player." });
        }

        Object.assign(player, req.body);
        await team.save();
        res.status(200).json({ message: "Player updated successfully", player });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:teamId/players/:playerId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        const player = team.players.id(req.params.playerId);

        // ensures the current user is the author of the comment
        if (player.manager.toString() !== req.user._id) {
            return res
                .status(403)
                .json({ message: "You are not authorized to edit this player" });
        }

        team.players.remove({ _id: req.params.playerId });
        await team.save();
        res.status(200).json({ message: "Player deleted successfully" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

module.exports = router;
