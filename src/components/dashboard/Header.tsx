import v4Logo from "@/assets/v4-logo.jpg";

interface HeaderProps {
  syncTime: string;
  status: string;
  countdown: number;
}

export const Header = ({ syncTime, status, countdown }: HeaderProps) => {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 glass-neu flex items-center justify-center border-primary/40 overflow-hidden rounded-lg">
          <img src={v4Logo} alt="V4 Company" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase leading-none text-foreground">
            Arena de Resultados{" "}
            <span className="text-muted-foreground font-light italic text-2xl">v4.9</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              Line-up Total Abril
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {syncTime}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="neu-inset px-6 py-3 flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-primary blink" />
          <span className="text-[11px] font-black tracking-[0.2em] text-muted-foreground uppercase font-mono">
            {status}
          </span>
        </div>
        <div className="glass-neu px-4 py-3 flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Próx. Sync
          </span>
          <span className="text-lg font-black text-primary font-mono tabular-nums min-w-[2ch] text-center">
            {countdown}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">s</span>
        </div>
      </div>
    </header>
  );
};