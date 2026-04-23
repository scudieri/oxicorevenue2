interface StrategicTotalsProps {
  ticket: string;
  diasHoje: number;
  diasTotal: number;
}

export const StrategicTotals = ({ ticket, diasHoje, diasTotal }: StrategicTotalsProps) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="neu-inset p-8 text-center flex flex-col justify-center border border-foreground/5">
        <span className="text-[10px] font-black text-muted-foreground uppercase block mb-2 tracking-[0.2em]">
          Ticket Médio Abr
        </span>
        <span className="text-2xl font-black text-foreground tracking-tighter">{ticket}</span>
      </div>

      <div className="neu-inset p-8 text-center flex flex-col justify-center border border-foreground/5">
        <span className="text-[10px] font-black text-muted-foreground uppercase block mb-2 tracking-[0.2em]">
          Timeline Operacional
        </span>
        <span className="text-2xl font-black text-foreground tracking-tight">
          {diasHoje} / {diasTotal}{" "}
          <span className="text-muted-foreground text-xs ml-1 font-bold">DIAS</span>
        </span>
      </div>
    </section>
  );
};
