import { NextFunction, Request, Response } from "express";
import fs from "fs";
import { sendEvent } from "../routes/socket";

const DATA_FILE = "./data/tt.json";
const K_FACTOR = 32; // ELO adjustment factor
const HANDICAP_VALUE = 100;

// Player type
interface Player {
  name: string;
  elo: number;
}

// Game result type
interface GameResult {
  playerAScore: number;
  playerBScore: number;
}

// Game history entry type
interface GameHistoryEntry {
  playerA: string;
  playerB: string;
  playerAScore: number;
  playerBScore: number;
  winner: string;
  timestamp: string;
  eloChange: number;
  handicapA: number; // Handicap for playerA
  handicapB: number; // Handicap for playerB
}

// Full data structure for the data file
interface DataFile {
  players: Player[];
  gameHistory: GameHistoryEntry[];
}

// Helper to read the data file
const readData = (): DataFile => {
  try {
    const rawData = fs.readFileSync(DATA_FILE, "utf-8");
    const file = JSON.parse(rawData) as DataFile;
    file.gameHistory.sort((g1, g2) => 
      new Date(g1.timestamp) < new Date(g2.timestamp) ? 1 : -1
    ); // Sort game history by timestamp descending
    file.players.sort((p1, p2) => p2.elo - p1.elo); // Sort players by ELO descending
    return file;
  } catch (error) {
    throw error;
  }
};

// Helper to write to the data file
const writeData = (data: DataFile) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
};

// Function to calculate ELO score adjustments, includes handicap, adjusts for # of games won
function calculateElo(
  playerA: Player,
  playerB: Player,
  scoreA: number,
  scoreB: number,
  handicapA: number = 0,
  handicapB: number = 0
): number {


  const effectiveEloA = playerA.elo + handicapA * HANDICAP_VALUE;
  const effectiveEloB = playerB.elo + handicapB * HANDICAP_VALUE;

  const expectedA = 1 / (1 + Math.pow(10, (effectiveEloB - effectiveEloA) / 400));
  const expectedB = 1 - expectedA;

  const normalizedScoreA = scoreA / (scoreA + scoreB)
  const normalizedScoreB = scoreB / (scoreA + scoreB)

  const changeA = Math.round(K_FACTOR * (normalizedScoreA - expectedA));
  const changeB = Math.round(K_FACTOR * (normalizedScoreB - expectedB));

  playerA.elo += changeA;
  playerB.elo += changeB;

  return scoreA >= scoreB ?  changeA : changeB; // Return the change for the winning player, always A if tie
}

// Controller to get all players
export const getAllPlayers = (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = readData();
    res.send(data.players);
  } catch (err) {
    res.status(500).send({ error: "Failed to load players." });
  }
};

// Controller to get all registered player names
export const getAllRegisteredPlayers = (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = readData();
    const playerNames = data.players.map(player => player.name); // Extract player names
    res.send(playerNames);
  } catch (err) {
    res.status(500).send({ error: "Failed to load player names." });
  }
};

// Controller to add a game result with optional handicaps
export const addGameResult = (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      playerA,
      playerB,
      result,
      handicapA = 0, // Default handicap for playerA
      handicapB = 0  // Default handicap for playerB
    }: {
      playerA: string;
      playerB: string;
      result: GameResult;
      handicapA?: number;
      handicapB?: number;
    } = req.body;

    // Validate the request
    if (
      !playerA || 
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

    sendEvent("new-tt-match");

    res.send({
      message: "Game result recorded successfully.",
      playerA: playerARecord,
      playerB: playerBRecord,
    });
  } catch (err) {
    res.status(500).send({ error: "Failed to record game result." });
  }
};

// Controller to get game history
export const getGameHistory = (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = readData();
    res.send(data.gameHistory); // Serve full game history, including handicaps
  } catch (err) {
    res.status(500).send({ error: "Failed to load game history." });
  }
};

// Controller to delete a game result
export const deleteGame = (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id; // Get the game ID from the request URL
    const data = readData(); // Read the existing data

    // Find the match in the history
    const gameIndex = data.gameHistory.findIndex(
      (game, index) => index.toString() === gameId
    );

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
    data.gameHistory.sort((g1, g2) =>
      new Date(g1.timestamp) > new Date(g2.timestamp) ? 1 : -1
    ); // Sort by timestamp ascending

    data.gameHistory.forEach(game => {
      const { playerA, playerB, eloChange, winner } = game;

      const playerARecord = data.players.find(
        player => player.name.toLowerCase() === playerA.toLowerCase()
      );
      const playerBRecord = data.players.find(
        player => player.name.toLowerCase() === playerB.toLowerCase()
      );

      if (playerARecord && playerBRecord) {
        if (winner.toLowerCase() === playerARecord.name.toLowerCase()) {
          playerARecord.elo += eloChange; // Apply ELO change to the winner
          playerBRecord.elo -= eloChange; // Apply ELO change to the loser
        } else if (winner.toLowerCase() === playerBRecord.name.toLowerCase()) {
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
  } catch (error) {
    res.status(500).send({ error: "An error occurred while deleting the game" });
  }

  sendEvent("new-tt-match");
};