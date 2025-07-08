"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGame = exports.getGameHistory = exports.addGameResult = exports.getAllRegisteredPlayers = exports.getAllPlayers = void 0;
const fs_1 = __importDefault(require("fs"));
const socket_1 = require("../routes/socket");
const DATA_FILE = "./data/tt.json";
const K_FACTOR = 32; // ELO adjustment factor
const HANDICAP_VALUE = 100;
// Helper to read the data file
const readData = () => {
    try {
        const rawData = fs_1.default.readFileSync(DATA_FILE, "utf-8");
        const file = JSON.parse(rawData);
        file.gameHistory.sort((g1, g2) => new Date(g1.timestamp) < new Date(g2.timestamp) ? 1 : -1); // Sort game history by timestamp descending
        file.players.sort((p1, p2) => p2.elo - p1.elo); // Sort players by ELO descending
        return file;
    }
    catch (error) {
        throw error;
    }
};
// Helper to write to the data file
const writeData = (data) => {
    fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
};
// Function to calculate ELO score adjustments, includes handicap, adjusts for # of games won
function calculateElo(playerA, playerB, scoreA, scoreB, handicapA = 0, handicapB = 0) {
    const effectiveEloA = playerA.elo + handicapA * HANDICAP_VALUE;
    const effectiveEloB = playerB.elo + handicapB * HANDICAP_VALUE;
    const expectedA = 1 / (1 + Math.pow(10, (effectiveEloB - effectiveEloA) / 400));
    const expectedB = 1 - expectedA;
    const normalizedScoreA = scoreA / (scoreA + scoreB);
    const normalizedScoreB = scoreB / (scoreA + scoreB);
    const changeA = Math.round(K_FACTOR * (normalizedScoreA - expectedA));
    const changeB = Math.round(K_FACTOR * (normalizedScoreB - expectedB));
    playerA.elo += changeA;
    playerB.elo += changeB;
    return scoreA >= scoreB ? changeA : changeB; // Return the change for the winning player, always A if tie
}
// Controller to get all players
const getAllPlayers = (req, res, next) => {
    try {
        const data = readData();
        res.send(data.players);
    }
    catch (err) {
        res.status(500).send({ error: "Failed to load players." });
    }
};
exports.getAllPlayers = getAllPlayers;
// Controller to get all registered player names
const getAllRegisteredPlayers = (req, res, next) => {
    try {
        const data = readData();
        const playerNames = data.players.map(player => player.name); // Extract player names
        res.send(playerNames);
    }
    catch (err) {
        res.status(500).send({ error: "Failed to load player names." });
    }
};
exports.getAllRegisteredPlayers = getAllRegisteredPlayers;
// Controller to add a game result with optional handicaps
const addGameResult = (req, res, next) => {
    try {
        const { playerA, playerB, result, handicapA = 0, // Default handicap for playerA
        handicapB = 0 // Default handicap for playerB
         } = req.body;
        // Validate the request
        if (!playerA ||
            !playerB ||
            !result ||
            typeof result.playerAScore !== "number" ||
            typeof result.playerBScore !== "number" ||
            handicapA < 0 ||
            handicapB < 0 // Handicaps must be non-negative
        ) {
            return res.status(400).send({ error: "Invalid request format. Ensure valid player names, result, and optional positive handicaps are provided." });
        }
        const { playerAScore, playerBScore } = result;
        if (playerAScore === playerBScore) {
            return res.status(400).send({ error: "A game cannot end in a draw in a best-of-three format." });
        }
        const data = readData();
        // Find players or create new player records
        let playerARecord = data.players.find(player => player.name.toLowerCase() === playerA.toLowerCase());
        let playerBRecord = data.players.find(player => player.name.toLowerCase() === playerB.toLowerCase());
        if (!playerARecord) {
            playerARecord = { name: playerA, elo: 1200 }; // Default ELO for new players
            data.players.push(playerARecord);
        }
        if (!playerBRecord) {
            playerBRecord = { name: playerB, elo: 1200 }; // Default ELO for new players
            data.players.push(playerBRecord);
        }
        let winner = playerAScore > playerBScore ? playerARecord.name : playerBRecord.name;
        winner = playerAScore === playerBScore ? 'TIE' : winner;
        // Update ELO ratings and calculate the ELO change considering handicaps
        const eloChange = calculateElo(playerARecord, playerBRecord, playerAScore, playerBScore, handicapA, handicapB);
        // Save the game result into history with included handicaps
        data.gameHistory.push({
            playerA: playerARecord.name,
            playerB: playerBRecord.name,
            playerAScore,
            playerBScore,
            winner,
            eloChange,
            timestamp: new Date().toISOString(),
            handicapA, // Store handicap for playerA
            handicapB, // Store handicap for playerB
        });
        writeData(data);
        (0, socket_1.sendEvent)("new-tt-match");
        res.send({
            message: "Game result recorded successfully.",
            playerA: playerARecord,
            playerB: playerBRecord,
        });
    }
    catch (err) {
        res.status(500).send({ error: "Failed to record game result." });
    }
};
exports.addGameResult = addGameResult;
// Controller to get game history
const getGameHistory = (req, res, next) => {
    try {
        const data = readData();
        res.send(data.gameHistory); // Serve full game history, including handicaps
    }
    catch (err) {
        res.status(500).send({ error: "Failed to load game history." });
    }
};
exports.getGameHistory = getGameHistory;
// Controller to delete a game result
const deleteGame = (req, res, next) => {
    try {
        const gameId = req.params.id; // Get the game ID from the request URL
        const data = readData(); // Read the existing data
        // Find the match in the history
        const gameIndex = data.gameHistory.findIndex((game, index) => index.toString() === gameId);
        if (gameIndex === -1) {
            return res.status(404).send({ error: "Game not found" });
        }
        // Remove the game from the match history
        data.gameHistory.splice(gameIndex, 1);
        // Reset all player ratings to the default (1200)
        data.players.forEach(player => {
            player.elo = 1200; // Reset all players to their starting ELO
        });
        // Replay all games in chronological order to reconstruct player ratings
        // This uses the stored `eloChange` values from the history
        data.gameHistory.sort((g1, g2) => new Date(g1.timestamp) > new Date(g2.timestamp) ? 1 : -1); // Sort by timestamp ascending
        data.gameHistory.forEach(game => {
            const { playerA, playerB, eloChange, winner } = game;
            const playerARecord = data.players.find(player => player.name.toLowerCase() === playerA.toLowerCase());
            const playerBRecord = data.players.find(player => player.name.toLowerCase() === playerB.toLowerCase());
            if (playerARecord && playerBRecord) {
                if (winner.toLowerCase() === playerARecord.name.toLowerCase()) {
                    playerARecord.elo += eloChange; // Apply ELO change to the winner
                    playerBRecord.elo -= eloChange; // Apply ELO change to the loser
                }
                else if (winner.toLowerCase() === playerBRecord.name.toLowerCase()) {
                    playerBRecord.elo += eloChange; // Apply ELO change to the winner
                    playerARecord.elo -= eloChange; // Apply ELO change to the loser
                }
            }
        });
        // Re-sort players based on updated ELO scores
        data.players.sort((p1, p2) => p2.elo - p1.elo);
        writeData(data);
        res.send({
            message: "Game deleted successfully",
            updatedPlayers: data.players,
        });
    }
    catch (error) {
        res.status(500).send({ error: "An error occurred while deleting the game" });
    }
    (0, socket_1.sendEvent)("new-tt-match");
};
exports.deleteGame = deleteGame;
