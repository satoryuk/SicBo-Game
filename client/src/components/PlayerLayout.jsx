import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import socket from "../socket";

export default function PlayerLayout() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!socket.connected) {
      socket.connect();
    }

    const handleWithdrawalApproved = (data) => {
      console.log("Withdrawal approved event received:", data);
      if (data.userId === currentUser._id) {
        showNotification(
          `✅ Withdrawal Approved! $${data.amount} has been processed and sent to your account.`,
          "green",
        );
      }
    };

    const handleWithdrawalRejected = (data) => {
      console.log("Withdrawal rejected event received:", data);
      if (data.userId === currentUser._id) {
        showNotification(
          `❌ Withdrawal Rejected: ${data.reason}. ${data.coins} coins have been refunded to your wallet.`,
          "red",
        );
      }
    };

    socket.on("withdrawal_approved", handleWithdrawalApproved);
    socket.on("withdrawal_rejected", handleWithdrawalRejected);

    return () => {
      socket.off("withdrawal_approved", handleWithdrawalApproved);
      socket.off("withdrawal_rejected", handleWithdrawalRejected);
    };
  }, []);

  const showNotification = (text, color) => {
    setNotification({ text, color });
    setTimeout(() => setNotification(null), 8000);
  };

  return (
    <>
      <NavBar />
      {notification && (
        <div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 border-2 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] font-cinzel text-sm animate-[slideDown_0.3s_ease-out] ${
            notification.color === "green"
              ? "bg-[#27ae60]/95 border-[#27ae60] text-white"
              : "bg-[#c0392b]/95 border-[#c0392b] text-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {notification.color === "green" ? "💰" : "⚠️"}
            </span>
            <div className="flex-1">
              <div className="font-bold mb-1">
                {notification.color === "green"
                  ? "Withdrawal Approved"
                  : "Withdrawal Rejected"}
              </div>
              <div className="text-xs opacity-90">{notification.text}</div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-white/70 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <Outlet />
    </>
  );
}
