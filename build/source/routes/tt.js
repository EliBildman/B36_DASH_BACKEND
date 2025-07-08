"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tt_controller_1 = require("../controller.ts/tt.controller");
const router = (0, express_1.Router)();
// Get all players with details (ELO, etc.)
router.get("/players", tt_controller_1.getAllPlayers);
// Get all registered player names (simplified)
router.get("/players/names", tt_controller_1.getAllRegisteredPlayers);
// Add a game result
router.post("/game", tt_controller_1.addGameResult);
// Get game history
router.get("/gameHistory", tt_controller_1.getGameHistory);
router.delete("/game/:id", tt_controller_1.deleteGame);
exports.default = router;
