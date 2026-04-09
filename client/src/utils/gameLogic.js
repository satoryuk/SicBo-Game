// Payout table for total bets
export const PAYOUT_TABLE = {
  4: 50,
  5: 18,
  6: 14,
  7: 12,
  8: 8,
  9: 6,
  10: 6,
  11: 6,
  12: 6,
  13: 8,
  14: 12,
  15: 14,
  16: 18,
  17: 50,
};

// Calculate game result
export const calculateGameResult = (vals, betType, betValue, betAmount) => {
  const sum = vals.reduce((a, b) => a + b, 0);
  const isTriple = vals[0] === vals[1] && vals[1] === vals[2];

  let won = false;
  let payout = 0;

  if (betType === "bigsmall") {
    if (betValue === "big" && sum >= 11 && sum <= 17 && !isTriple) {
      won = true;
      payout = betAmount;
    } else if (betValue === "small" && sum >= 4 && sum <= 10 && !isTriple) {
      won = true;
      payout = betAmount;
    }
  } else if (betType === "number") {
    const count = vals.filter((v) => v === betValue).length;
    if (count > 0) {
      won = true;
      payout = betAmount * count;
    }
  } else if (betType === "total") {
    if (sum === betValue) {
      won = true;
      payout = betAmount * (PAYOUT_TABLE[betValue] || 6);
    }
  }

  return { won, payout, sum, isTriple };
};

// Generate random dice values
export const rollDice = () => [
  Math.floor(Math.random() * 6) + 1,
  Math.floor(Math.random() * 6) + 1,
  Math.floor(Math.random() * 6) + 1,
];

// Get user from localStorage safely
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

// Update user in localStorage
export const updateUser = (updates) => {
  const user = getUser();
  const updated = { ...user, ...updates };
  localStorage.setItem("user", JSON.stringify(updated));
  return updated;
};
