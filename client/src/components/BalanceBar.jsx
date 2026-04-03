export default function BalanceBar({ balance, lastWin, rounds }) {
  return (
    <div className="flex items-center gap-5 bg-gradient-to-br from-[#1a1200] to-[#2a1e00] border border-sicbo-gold-dark rounded-lg px-7 py-3 mb-7 shadow-[0_0_20px_rgba(201,168,76,0.4)]">
      <BalanceItem label="Balance" value={`${balance.toLocaleString()}`} />
      <Divider />
      <BalanceItem label="Last Win" value={lastWin ? `+${lastWin}` : "—"} />
      <Divider />
      <BalanceItem label="Rounds" value={rounds} />
    </div>
  );
}

function BalanceItem({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-[0.6rem] tracking-[0.2em] text-sicbo-text-muted uppercase">
        {label}
      </div>
      <div className="text-xl font-bold text-[#f0d080]">{value}</div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-9 bg-sicbo-gold-dark" />;
}
