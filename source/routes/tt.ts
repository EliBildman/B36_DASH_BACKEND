import { Router } from "express";
import { getAllPlayers, 
  getAllRegisteredPlayers,
  addGameResult,
  getGameHistory,
  deleteGame } from "../controller.ts/tt.controller";

const router = Router();

// Get all players with details (ELO, etc.)
router.get("/players", getAllPlayers);

// Get all registered player names (simplified)
router.get("/players/names", getAllRegisteredPlayers);

// Add a game result
router.post("/game", addGameResult);

// Get game history
router.get("/gameHistory", getGameHistory);

router.delete("/game/:id", deleteGame);


export default router;