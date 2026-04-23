import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  variant?: "default" | "primary" | "highlight";
}

export const KPICard = ({ label, value, subtitle, variant = "default" }: KPICardProps) => {
  return (
    <div
      className={cn(
        "glass-neu p-8",
        variant === "primary" && "border-l-2 border-primary",
        variant === "highlight" && "bg-secondary/30 border border-primary/10"
      )}
    >
      <p
        className={cn(
          "text-[10px] font-black uppercase tracking-widest mb-3",
          variant === "primary" ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </p>
      <h2
        className={cn(
          "text-2xl font-black tracking-tighter",
          variant === "highlight" ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </h2>
      {subtitle ? (
        <p className="text-[9px] font-bold text-muted-foreground mt-2 tracking-widest uppercase">
          {subtitle}
        </p>
      ) : (
        <div className="mt-4 h-1 w-12 bg-secondary rounded-full" />
      )}
    </div>
  );
};
