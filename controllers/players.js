// router.post("/:teamId/players", verifyToken, async (req, res) => {
//     try {
//         // Attach the user as the manager of the player
//         req.body.manager = req.user._id;
//
//         // Find the team by the teamId from the params
//         const team = await Team.findById(req.params.teamId);
//
//         // Ensure the team exists
//         if (!team) {
//             return res.status(404).json({ error: "Team not found" });
//         }
//
//         // Add the player to the team's players array
//         team.players.push(req.body);
//
//         // Save the team with the new player
//         await team.save();
//
//         // Get the newly added player (the last one in the array)
//         const newPlayer = team.players[team.players.length - 1];
//
//         // Send back the newly added player
//         res.status(201).json(newPlayer);
//
//     } catch (err) {
//         console.error("Error:", err); // Log the error for debugging
//         res.status(500).json({ error: err.message });
//     }
// });
