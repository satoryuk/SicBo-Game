import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-sicbo-dark">
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : ""
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <header className="bg-gradient-to-r from-[#0b1a10] to-[#0e2218] border-b-2 border-sicbo-gold-dark/50 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile hamburger */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="bg-transparent border border-sicbo-gold-dark/50 rounded-lg p-2 cursor-pointer flex flex-col gap-1 items-center justify-center"
                aria-label="Open menu"
              >
                <div className="w-4 h-0.5 bg-sicbo-gold rounded" />
                <div className="w-4 h-0.5 bg-sicbo-gold rounded" />
                <div className="w-4 h-0.5 bg-sicbo-gold rounded" />
              </button>
            )}
            <div>
              <div className="text-sicbo-gold text-xl sm:text-2xl font-black tracking-[0.15em] [text-shadow:0_0_20px_rgba(201,168,76,0.5)]">
                SIC BO
              </div>
              <div className="text-sicbo-text-muted text-[0.5rem] sm:text-[0.6rem] tracking-[0.2em] font-noto">
                骰寶 · DICE TREASURE
              </div>
            </div>
            <div className="bg-red-900/20 border border-red-700/50 text-red-400 text-[0.5rem] sm:text-[0.6rem] px-2 sm:px-3 py-1 rounded-full tracking-wider font-semibold">
              ADMIN
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-sicbo-gold/70 text-[0.55rem] sm:text-[0.65rem] tracking-wider hidden sm:block">
              LOGGED IN AS
            </div>
            <div className="text-sicbo-text text-xs sm:text-sm tracking-wide font-semibold">
              @{user.username}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
