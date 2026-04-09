import { useState, useEffect } from "react";
import api from "../../api";
import socket from "../../socket";

const RATE = 100; // $1 = 100 coins
const LOW_BALANCE_THRESHOLD = 100; // warn when < 100 coins

export default function Wallet() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}"),
  );
  const [coins, setCoins] = useState(0);
  const [txns, setTxns] = useState([]);
  const [depAmt, setDepAmt] = useState("");
  const [withAmt, setWithAmt] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    socket.on("withdrawal_approved", (data) => {
      if (data.userId === currentUser._id) {
        flash(
          `✅ Withdrawal approved! $${data.amount} processed (${data.coins} coins)`,
          "green",
        );
        fetchData();
      }
    });

    socket.on("withdrawal_rejected", (data) => {
      if (data.userId === currentUser._id) {
        flash(
          `❌ Withdrawal rejected: ${data.reason}. ${data.coins} coins refunded`,
          "red",
        );
        fetchData();
      }
    });

    return () => {
      socket.off("withdrawal_approved");
      socket.off("withdrawal_rejected");
    };
  }, []);

  const fetchData = async () => {
    const [me, t] = await Promise.all([
      api.get("/api/auth/me"),
      api.get("/api/wallet/transactions"),
    ]);
    setCoins(me.data.coins);
    setTxns(t.data);
    const updated = { ...user, coins: me.data.coins };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  const deposit = async () => {
    if (!depAmt || depAmt <= 0) return flash("Enter a valid amount", "red");
    setLoading(true);
    try {
      const { data } = await api.post("/api/wallet/deposit", {
        amount: Number(depAmt),
      });
      setCoins(data.coins);
      setDepAmt("");
      flash(`✅ Deposited $${depAmt} → +${data.addedCoins} coins!`, "green");
      fetchData();
    } catch (e) {
      flash(e.response?.data?.message || "Error", "red");
    }
    setLoading(false);
  };

  const withdraw = async () => {
    if (!withAmt || withAmt <= 0) return flash("Enter a valid amount", "red");
    setLoading(true);
    try {
      const { data } = await api.post("/api/wallet/withdraw", {
        coins: Number(withAmt),
      });
      setCoins(data.coins);
      setWithAmt("");
      flash(
        `⏳ Withdrawal of ${withAmt} coins ($${(withAmt / RATE).toFixed(2)}) submitted — pending admin approval.`,
        "yellow",
      );
      fetchData();
    } catch (e) {
      flash(e.response?.data?.message || "Error", "red");
    }
    setLoading(false);
  };

  const flash = (text, color) => {
    setMsg({ text, color });
    setTimeout(() => setMsg(null), 5000);
  };

  const isLowBalance = coins < LOW_BALANCE_THRESHOLD;

  return (
    <div className="min-h-screen bg-sicbo-dark bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,76,0.08)_0%,transparent_60%)] font-cinzel text-sicbo-text p-8 pb-16">
      <div className="flex flex-col gap-5">
        {/* Low balance warning */}
        {isLowBalance && (
          <div className="bg-[#c0392b]/10 border border-[#c0392b] rounded-lg p-3 flex items-center gap-2.5">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="text-[#ff6655] font-bold text-xs">
                Low Balance Warning
              </div>
              <div className="text-sicbo-text-muted text-[0.7rem] mt-0.5">
                You have only{" "}
                <strong className="text-sicbo-gold">🪙 {coins}</strong> coins
                left. Deposit to keep playing!
              </div>
            </div>
          </div>
        )}

        {/* Coin balance */}
        <div className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-2xl p-6 shadow-[0_0_30px_rgba(201,168,76,0.15)] text-center">
          <div className="text-[0.6rem] tracking-[0.3em] text-sicbo-text-muted">
            YOUR WALLET
          </div>
          <div
            className={`text-5xl font-black my-2.5 transition-colors duration-500 ${isLowBalance ? "text-[#c0392b]" : "text-sicbo-gold"}`}
          >
            🪙 {coins.toLocaleString()}
          </div>
          <div className="text-sicbo-text-muted text-[0.7rem]">
            ≈ ${(coins / RATE).toFixed(2)} real value &nbsp;|&nbsp; Rate: $1 ={" "}
            {RATE} coins
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div
            className={`border rounded-lg p-2.5 px-4 text-xs text-center ${
              msg.color === "green"
                ? "bg-[#27ae60]/15 border-[#27ae60] text-[#27ae60]"
                : msg.color === "yellow"
                  ? "bg-sicbo-gold/15 border-sicbo-gold text-sicbo-gold"
                  : "bg-[#c0392b]/15 border-[#c0392b] text-[#ff6655]"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Deposit & Withdraw */}
        <div className="grid grid-cols-2 gap-4">
          {/* Deposit */}
          <div className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-2xl p-6 shadow-[0_0_30px_rgba(201,168,76,0.15)]">
            <div className="text-[0.65rem] tracking-[0.2em] text-[#27ae60] mb-3">
              💵 DEPOSIT MONEY
            </div>
            <input
              className="w-full p-2.5 px-3.5 bg-black/40 border border-sicbo-gold-dark rounded-lg text-sicbo-text font-cinzel text-sm outline-none mb-2.5"
              type="number"
              placeholder="Amount in $ (e.g. 10)"
              value={depAmt}
              onChange={(e) => setDepAmt(e.target.value)}
            />
            {depAmt > 0 && (
              <div className="text-sicbo-text-muted text-[0.7rem] mb-2">
                → You will receive{" "}
                <strong className="text-sicbo-gold">
                  {depAmt * RATE} coins
                </strong>
              </div>
            )}
            <button
              className="w-full bg-[#27ae60]/15 border border-[#27ae60] rounded-lg text-[#27ae60] font-cinzel cursor-pointer p-2 px-4 text-xs hover:bg-[#27ae60]/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={deposit}
              disabled={loading}
            >
              Deposit
            </button>
          </div>

          {/* Withdraw */}
          <div className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-2xl p-6 shadow-[0_0_30px_rgba(201,168,76,0.15)]">
            <div className="text-[0.65rem] tracking-[0.2em] text-[#c0392b] mb-3">
              🏧 WITHDRAW COINS
            </div>
            <input
              className="w-full p-2.5 px-3.5 bg-black/40 border border-sicbo-gold-dark rounded-lg text-sicbo-text font-cinzel text-sm outline-none mb-2.5"
              type="number"
              placeholder={`Coins (min ${RATE})`}
              value={withAmt}
              onChange={(e) => setWithAmt(e.target.value)}
            />
            {withAmt >= RATE && (
              <div className="text-sicbo-text-muted text-[0.7rem] mb-2">
                → You will receive{" "}
                <strong className="text-[#27ae60]">
                  ${(withAmt / RATE).toFixed(2)}
                </strong>
                <span className="text-sicbo-text-muted text-[0.6rem] block mt-0.5">
                  ⏳ Requires admin approval
                </span>
              </div>
            )}
            <button
              className="w-full bg-[#c0392b]/15 border border-[#c0392b] rounded-lg text-[#ff6655] font-cinzel cursor-pointer p-2 px-4 text-xs hover:bg-[#c0392b]/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={withdraw}
              disabled={loading}
            >
              Request Withdrawal
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-gradient-to-br from-sicbo-green-dark to-sicbo-green border-2 border-sicbo-gold-dark rounded-2xl p-6 shadow-[0_0_30px_rgba(201,168,76,0.15)]">
          <div className="text-[0.65rem] tracking-[0.25em] text-sicbo-text-muted mb-3.5">
            📜 TRANSACTION HISTORY
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {["Type", "Status", "Coins", "Amount", "Note", "Date"].map(
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
                {txns.map((t) => {
                  const typeColors = {
                    deposit: "text-[#27ae60]",
                    withdraw: "text-[#c0392b]",
                    bet: "text-sicbo-text-muted",
                    win: "text-sicbo-gold",
                    bonus: "text-[#4488ff]",
                  };
                  const statusColors = {
                    completed: "text-[#27ae60]",
                    pending: "text-sicbo-gold",
                    rejected: "text-[#c0392b]",
                  };
                  return (
                    <tr key={t._id}>
                      <td
                        className={`p-2 px-2.5 border-b border-sicbo-gold-dark/10 font-bold uppercase text-[0.6rem] ${typeColors[t.type] || "text-sicbo-text-muted"}`}
                      >
                        {t.type}
                      </td>
                      <td
                        className={`p-2 px-2.5 border-b border-sicbo-gold-dark/10 text-[0.6rem] font-bold ${statusColors[t.status] || "text-sicbo-text-muted"}`}
                      >
                        {t.status || "completed"}
                      </td>
                      <td
                        className={`p-2 px-2.5 border-b border-sicbo-gold-dark/10 ${t.coins >= 0 ? "text-[#27ae60]" : "text-[#c0392b]"}`}
                      >
                        {t.coins >= 0 ? "+" : ""}
                        {t.coins}
                      </td>
                      <td className="text-sicbo-text-muted p-2 px-2.5 border-b border-sicbo-gold-dark/10">
                        {t.amount > 0 ? `$${t.amount}` : "—"}
                      </td>
                      <td className="text-sicbo-text-muted p-2 px-2.5 border-b border-sicbo-gold-dark/10 text-[0.65rem]">
                        {t.note}
                      </td>
                      <td className="text-sicbo-text-muted p-2 px-2.5 border-b border-sicbo-gold-dark/10 text-[0.6rem]">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
                {txns.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-sicbo-text-muted p-5 border-b border-sicbo-gold-dark/10 text-center"
                    >
                      No transactions yet
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
