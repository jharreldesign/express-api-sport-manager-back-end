const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
            required: true,
        },
        player_number: {
            type: Number,
            required: true,
        },
        position: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
)

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        stadium: {
            type: String,
            required: true,
        },
        sport: {
            type: String,
            required: true,
            enum: ['Baseball', 'Football', 'Basketball', 'Hockey', 'Soccer'],
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },  // This links the team to the user who is managing it
        players: [playerSchema],  // The players that belong to the team
    },
    { timestamps: true }
);

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
