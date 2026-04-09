import { useState, useEffect } from "react";
import api from "../../api";

const RANK_COLORS = {
  Bronze: "#cd7f32",
  Silver: "#c0c0c0",
  Gold: "#c9a84c",
  VIP: "#9b59b6",
};

export default function Profile() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    api.get("/api/game/stats").then((r) => setStats(r.data));
    api.get("/api/game/history").then((r) => setHistory(r.data));
  }, []);

  const rankColor = stats ? RANK_COLORS[stats.rank] || "#a08050" : "#a08050";

  const rankData = [
    { rank: "Bronze", min: 0, color: "#cd7f32" },
    { rank: "Silver", min: 50, color: "#c0c0c0" },
    { rank: "Gold", min: 200, color: "#c9a84c" },
    { rank: "VIP", min: 500, color: "#9b59b6" },
  ];

  const statsData = stats
    ? [
        {
          label: "Total Rounds",
          value: stats.totalRounds,
          color: "text-[#f0d080]",
        },
        {
          label: "Win Rate",
          value: `${stats.winRate}%`,
          color: "text-[#27ae60]",
        },
        {
          label: "Total Wins",
          value: stats.totalWins,
          color: "text-[#27ae60]",
        },
        {
          label: "Total Losses",
          value: stats.totalLosses,
          color: "text-[#c0392b]",
        },
        {
          label: "Total Wagered",
          value: `🪙 ${stats.totalWagered}`,
          color: "text-sicbo-text-muted",
        },
        {
          label: "Biggest Win",
          value: `🪙 ${stats.biggestWin}`,
          color: "text-sicbo-gold",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-sicbo-dark bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,76,0.08)_0%,transparent_60%)] font-cinzel text-sicbo-text p-8 pb-16">
      <div className="flex flex-col gap-5">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-2xl p-6 shadow-[0_0_30px_rgba(201,168,76,0.15)] text-center">
          <div className="text-5xl mb-2">👤</div>
          <div className="text-2xl font-bold text-[#f0d080] tracking-wider">
            {user.username}
          </div>
          {stats && (
            <div
              className="inline-block mt-2 rounded-full px-4 py-1 text-xs tracking-wider font-bold border"
              style={{
                backgroundColor: `${rankColor}22`,
                borderColor: rankColor,
                color: rankColor,
              }}
            >
              {stats.rank}
            </div>
          )}
          {stats && (
            <div className="text-sicbo-text-muted text-[0.7rem] mt-2.5">
              🔥 Login Streak:{" "}
              <strong className="text-sicbo-gold">
                {stats.loginStreak} days
              </strong>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            {statsData.map((s) => (
              <div
                key={s.label}
                className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-2xl p-4 px-3 shadow-[0_0_30px_rgba(201,168,76,0.15)] text-center"
              >
                <div className="text-[0.55rem] text-sicbo-text-muted tracking-[0.2em] mb-1.5">
                  {s.label.toUpperCase()}
                </div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Rank Progress */}
        {stats && (
          <div className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-2xl p-6 shadow-[0_0_30px_rgba(201,168,76,0.15)]">
            <div className="text-[0.65rem] tracking-[0.2em] text-sicbo-text-muted mb-3.5">
              🏅 RANK PROGRESS
            </div>
            {rankData.map((r) => (
              <div key={r.rank} className="flex items-center gap-3 mb-2.5">
                <div
                  className="w-15 text-[0.7rem] font-bold"
                  style={{ color: r.color }}
                >
                  {r.rank}
                </div>
                <div className="flex-1 bg-black/30 rounded h-2 overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      backgroundColor: r.color,
                      width: `${Math.min((stats.totalRounds / (r.min || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="w-15 text-sicbo-text-muted text-[0.6rem] text-right">
                  {stats.totalRounds}/{r.min || "—"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Bets */}
        <div className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-2xl p-6 shadow-[0_0_30px_rgba(201,168,76,0.15)]">
          <div className="text-[0.65rem] tracking-[0.25em] text-sicbo-text-muted mb-3.5">
            📜 RECENT BETS
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {["Dice", "Total", "Bet Type", "Wager", "Result", "Date"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-sicbo-gold border-b border-sicbo-gold-dark p-2 px-2.5 text-left"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r._id}>
                    <td className="text-sicbo-text-muted p-2 px-2.5 border-b border-sicbo-gold-dark/10">
                      {r.diceValues?.join(" · ")}
                    </td>
                    <td className="text-sicbo-text-muted p-2 px-2.5 border-b border-sicbo-gold-dark/10">
                      {r.total}
                    </td>
                    <td className="text-sicbo-text-muted p-2 px-2.5 border-b border-sicbo-gold-dark/10 capitalize">
                      {r.betType}
                    </td>
                    <td className="text-sicbo-text-muted p-2 px-2.5 border-b border-sicbo-gold-dark/10">
                      🪙 {r.betAmount}
                    </td>
                    <td
                      className={`p-2 px-2.5 border-b border-sicbo-gold-dark/10 font-bold ${r.won ? "text-[#27ae60]" : "text-[#c0392b]"}`}
                    >
                      {r.won ? `+${r.payout}` : `-${r.betAmount}`}
                    </td>
                    <td className="text-sicbo-text-muted p-2 px-2.5 border-b border-sicbo-gold-dark/10 text-[0.6rem]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-sicbo-text-muted p-5 border-b border-sicbo-gold-dark/10 text-center"
                    >
                      No rounds yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
