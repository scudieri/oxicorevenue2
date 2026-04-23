import { cn } from "@/lib/utils";

interface PacingStatusProps {
  realPct: number;
  idealPct: number;
  gap: number;
  formatCurrency: (value: number) => string;
}

export const PacingStatus = ({ realPct, idealPct, gap, formatCurrency }: PacingStatusProps) => {
  const isAhead = gap >= 0;

  return (
    <div className="glass-neu p-8 space-y-8 bg-background/40 border border-foreground/5">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">
            Atingimento Global
          </span>
          <span className="text-4xl font-black leading-none tracking-tighter">
            {realPct.toFixed(1)}%
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">
            Meta Ideal
          </span>
          <span className="text-xl font-bold text-muted-foreground tracking-tighter">
            {idealPct.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="bar-track bg-foreground/5 overflow-visible relative">
        <div
          className="bar-fill-white transition-all duration-1000"
          style={{ width: `${Math.min(realPct, 100)}%` }}
        />
        <div
          className="absolute w-1 h-[22px] bg-foreground -top-[5px] rounded shadow-[0_0_15px_white] z-20 transition-all duration-1000"
          style={{ left: `${Math.min(idealPct, 100)}%` }}
        />
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center py-3 border-b border-foreground/5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            GAP de Batalha
          </span>
          <div className="flex items-center gap-2 font-mono">
            <span
              className={cn(
                "text-base font-black",
                isAhead ? "text-emerald" : "text-primary"
              )}
            >
              {formatCurrency(Math.abs(gap))}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "w-full py-3 text-center text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] italic",
            isAhead
              ? "bg-emerald/10 text-emerald border border-emerald/20"
              : "bg-primary/10 text-primary border border-primary/20"
          )}
        >
          {isAhead ? "Performance Dominante" : "Abaixo do Ritmo Ideal"}
        </div>
      </div>
    </div>
  );
};
