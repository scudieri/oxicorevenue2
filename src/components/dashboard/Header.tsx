import v4Logo from "@/assets/v4-logo.jpg";

interface HeaderProps {
  syncTime: string;
  status?: string;
  countdown?: number;
}

export const Header = ({ syncTime }: HeaderProps) => {
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
              Performance Live
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {syncTime}
            </span>
          </div>
        </div>
      </div>

    </header>
  );
};