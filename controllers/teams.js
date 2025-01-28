const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Team = require("../models/team");
const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
    try {
        // Attach the user as the manager of the team
        req.body.manager = req.user._id;

        // Create the new team with the data from the request body
        const team = await Team.create(req.body);

        // Optionally include the manager in the response (if needed)
        res.status(201).json({ team, manager: req.user });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/", verifyToken, async (req, res) => {
    try {
        const teams = await Team.find({})
            .populate("manager")
            .sort({ createdAt: "desc" });
        res.status(200).json(teams);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.put("/:teamId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);  // Corrected rq to req

        if (!team.manager.equals(req.user._id)) {  // Corrected req.user_id to req.user._id
            return res.status(403).send("You're not allowed to do that!");
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.teamId,  // Corrected res.params.teamId to req.params.teamId
            req.body,            // Corrected res.body to req.body
            { new: true }
        );

        updatedTeam._doc.manager = req.user;

        res.status(200).json(updatedTeam);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.delete("/:teamId", verifyToken, async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);

        if (!team.manager.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }

        const deletedTeam = await Team.findByIdAndDelete(req.params.teamId);
        res.status(200).json(deletedTeam);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});



module.exports = router;
