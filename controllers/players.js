// controllers/players.js
const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Team = require("../models/team");
const router = express.Router();

// POST /teams/:teamId/players (Add a player to a team)
router.post("/:teamId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: "Team not found." });
        }

        // Check if the logged-in user is the team manager
        if (!team.manager.equals(req.user._id)) {
            return res.status(403).json({ error: "Only the team manager can add players." });
        }

        // Validate required fields for the player
        const { first_name, last_name, player_number, position } = req.body;
        if (!first_name || !last_name || !player_number || !position) {
            return res.status(400).json({ error: "All fields (first_name, last_name, player_number, position) are required." });
        }

        // Check for existing player with the same number
        const existingPlayer = team.players.find(player => player.player_number === req.body.player_number);
        if (existingPlayer) {
            return res.status(400).json({ error: "Player with this number already exists." });
        }

        // Add the logged-in user's ID as the player manager
        req.body.manager = req.user._id;

        // Add the player to the team
        team.players.push(req.body);
        await team.save();

        // Respond with the newly added player
        const newPlayer = team.players[team.players.length - 1];
        res.status(201).json(newPlayer);
    } catch (err) {
        console.error("Error adding player:", err);
        res.status(500).json({ error: "Failed to add player. Please try again later." });
    }
});

// PUT /teams/:teamId/players/:playerId (Update a player in a team)
router.put("/:teamId/players/:playerId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: "Team not found." });
        }

        const player = team.players.id(req.params.playerId);
        if (!player) {
            return res.status(404).json({ error: "Player not found." });
        }

        // Check if the logged-in user is the player manager
        if (!player.manager.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not authorized to update this player." });
        }

        // Update the player
        Object.assign(player, req.body);
        await team.save();

        res.status(200).json({ message: "Player updated successfully.", player });
    } catch (err) {
        console.error("Error updating player:", err);
        res.status(500).json({ error: "Failed to update player. Please try again later." });
    }
});

// DELETE /teams/:teamId/players/:playerId (Remove a player from a team)
router.delete("/:teamId/players/:playerId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: "Team not found." });
        }

        const player = team.players.id(req.params.playerId);
        if (!player) {
            return res.status(404).json({ error: "Player not found." });
        }

        // Check if the logged-in user is the player manager
        if (!player.manager.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not authorized to delete this player." });
        }

        // Remove the player from the team
        team.players.remove({ _id: req.params.playerId });
        await team.save();

        res.status(200).json({ message: "Player deleted successfully." });
    } catch (err) {
        console.error("Error deleting player:", err);
        res.status(500).json({ error: "Failed to delete player. Please try again later." });
    }
});

module.exports = router;
