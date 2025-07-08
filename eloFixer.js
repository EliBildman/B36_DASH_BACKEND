const fs = require('fs');

// Configurations
const DATA_FILE = './tt.json'; // Update this path to point to your JSON file
const K_FACTOR = 32; // Standard ELO adjustment factor

// Helper: Calculate ELO Change
function calculateEloChange(playerA, playerB, winner) {
  const expectedA = 1 / (1 + Math.pow(10, (playerB.elo - playerA.elo) / 400));
  const expectedB = 1 - expectedA;

  let eloChange;
  if (winner === "A") {
    eloChange = Math.round(K_FACTOR * (1 - expectedA));
    playerA.elo += eloChange;
    playerB.elo -= eloChange;
  } else {
    eloChange = Math.round(K_FACTOR * (1 - expectedB));
    playerB.elo += eloChange;
    playerA.elo -= eloChange;
  }

  return eloChange;
}

// Script: Reprocess Game History
function processEloChanges() {
  // 1. Read the existing data JSON file
  const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(rawData);

  // 2. Reset all player elo ratings to default (1200)
  data.players.forEach(player => {
    player.elo = 1200; // Reset all ELO ratings
  });

  // 3. Reprocess game history and calculate ELO changes
  const updatedHistory = data.gameHistory.map(game => {
    const { playerA, playerB, playerAScore, playerBScore } = game;

    // Determine winner
    const winner = playerAScore > playerBScore ? "A" : "B";

    // Find or create players
    let playerARecord = data.players.find(p => p.name.toLowerCase() === playerA.toLowerCase());
    let playerBRecord = data.players.find(p => p.name.toLowerCase() === playerB.toLowerCase());

    if (!playerARecord) {
      playerARecord = { name: playerA, elo: 1200 };
      data.players.push(playerARecord);
    }

    if (!playerBRecord) {
      playerBRecord = { name: playerB, elo: 1200 };
      data.players.push(playerBRecord);
    }

    // Calculate ELO change
    const eloChange = calculateEloChange(playerARecord, playerBRecord, winner);

    // Return updated game with eloChange
    return {
      ...game,
      eloChange
    };
  });

  // 4. Write the updated data back to the JSON file
  const updatedData = {
    ...data,
    gameHistory: updatedHistory
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2), 'utf-8');

  console.log('ELO changes have been recalculated and saved to the data file.');
}

processEloChanges();