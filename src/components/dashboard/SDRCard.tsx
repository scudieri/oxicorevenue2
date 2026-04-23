import { cn } from "@/lib/utils";

interface SDRCardProps {
  name: string;
  value: number;
  progress: number;
  avatar: string;
  rank?: "gold" | "silver";
}

export const SDRCard = ({ name, value, progress, avatar, rank }: SDRCardProps) => {
  return (
    <div className={cn(
      "glass-neu p-5 flex items-center gap-5 border border-emerald/10 relative overflow-visible",
      rank === "silver" && "opacity-70",
      !rank && "opacity-90"
    )}>
      {rank && (
        <div
          className={cn(
            "absolute -top-3 left-6 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest z-10",
            rank === "gold" 
              ? "bg-emerald text-background" 
              : "bg-muted-foreground/30 text-muted-foreground"
          )}
        >
          {rank === "gold" ? "Top SDR" : "Challenger"}
        </div>
      )}
      
      <div className="w-[68px] h-[68px] rounded-[20px] p-[3px] bg-gradient-to-br from-secondary to-background border border-emerald/30 flex-shrink-0">
        <img
          src={avatar}
          alt={name}
          className="w-full h-full rounded-[17px] object-cover contrast-110"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-black uppercase tracking-tight truncate">{name}</span>
          <span className="text-xs font-bold text-emerald font-mono">
            {value} Marcadas Abr
          </span>
        </div>
        <div className="bar-track">
          <div
            className={cn(
              "bar-fill-emerald transition-all duration-1000",
              rank === "silver" && "bg-muted-foreground",
              !rank && "bg-muted-foreground/50"
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
