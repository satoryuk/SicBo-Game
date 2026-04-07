export default function BalanceBar({ balance, lastWin, rounds }) {
  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex items-center gap-6 bg-gradient-to-br from-[#1a1200]/90 to-[#2a1e00]/90 backdrop-blur-md border-2 border-sicbo-gold-dark/60 rounded-xl px-8 py-4 shadow-[0_4px_24px_rgba(201,168,76,0.3),inset_0_1px_0_rgba(201,168,76,0.1)] transition-all duration-300 hover:shadow-[0_6px_32px_rgba(201,168,76,0.4)]">
        <BalanceItem label="Balance" value={`🪙 ${balance.toLocaleString()}`} />
        <Divider />
        <BalanceItem
          label="Last Win"
          value={lastWin ? `+${lastWin}` : "—"}
          highlight={!!lastWin}
        />
        <Divider />
        <BalanceItem label="Rounds" value={rounds} />
      </div>
    </div>
  );
}

function BalanceItem({ label, value, highlight }) {
  return (
    <div className="text-center transition-all duration-300">
      <div className="text-[0.6rem] tracking-[0.2em] text-sicbo-gold/70 uppercase font-semibold mb-1">
        {label}
      </div>
      <div
        className={`text-xl font-bold transition-all duration-300 ${
          highlight ? "text-[#f0d080] animate-pulse" : "text-[#f0d080]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-9 bg-sicbo-gold-dark" />;
}
