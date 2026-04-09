const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["player", "admin"], default: "player" },

    coins: { type: Number, default: 500 },
    realBalance: { type: Number, default: 0 },

    totalWins: { type: Number, default: 0 },
    totalLosses: { type: Number, default: 0 },
    totalRounds: { type: Number, default: 0 },
    totalWagered: { type: Number, default: 0 },
    biggestWin: { type: Number, default: 0 },

    rank: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "VIP"],
      default: "Bronze",
    },

    loginStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date, default: null },

    isBanned: { type: Boolean, default: false },
    bannedReason: { type: String, default: "" },

    isFlagged: { type: Boolean, default: false },

    refreshToken: { type: String, default: null },
  },
  { timestamps: true },
);

UserSchema.methods.computeRank = function () {
  if (this.totalRounds >= 500) return "VIP";
  if (this.totalRounds >= 200) return "Gold";
  if (this.totalRounds >= 50) return "Silver";
  return "Bronze";
};

module.exports = mongoose.model("User", UserSchema);
