import { motion } from "framer-motion";

interface FunnelData {
  leads: number;
  contatos: number;
  marcados: number;
  acontecidos: number;
  vendas: number;
}

interface ConversionFunnelProps {
  data: FunnelData;
}

const calcPercentage = (value: number, total: number) =>
  total > 0 ? `${((value / total) * 100).toFixed(0)}%` : "0%";

export const ConversionFunnel = ({ data }: ConversionFunnelProps) => {
  const steps = [
    { 
      label: "TOTAL DE LEADS", 
      value: data.leads, 
      indent: 0,
      conversion: null,
      sublabel: "ENTRADA NO FUNIL"
    },
    {
      label: null,
      value: data.contatos,
      indent: 1,
      conversion: `${calcPercentage(data.contatos, data.leads)} TAXA CONTATO`,
      sublabel: "LEADS CONTACTADOS"
    },
    {
      label: null,
      value: data.marcados,
      indent: 2,
      conversion: `${calcPercentage(data.marcados, data.contatos)} TAXA MARCAÇÃO`,
      sublabel: "REUNIÕES AGENDADAS"
    },
    {
      label: null,
      value: data.acontecidos,
      indent: 3,
      conversion: `${calcPercentage(data.acontecidos, data.marcados)} SHOW RATE`,
      sublabel: "REUNIÕES REALIZADAS"
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground italic">
          Funil de Vendas (Abril)
        </h3>
        <span className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest">
          Base: Pipeline ABR 2026
        </span>
      </div>

      <div className="glass-neu p-10">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="neu-inset p-5 flex justify-between items-center rounded-2xl"
              style={{
                marginLeft: `${step.indent * 32}px`,
                marginRight: `${step.indent * 16}px`,
              }}
            >
              {step.label ? (
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {step.label}
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  {step.conversion}
                </span>
              )}
              <div className="text-right">
                <span className="text-xl font-black text-foreground">
                  {step.value}
                </span>
                <div className="text-[8px] text-muted-foreground font-bold uppercase">
                  {step.sublabel}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Final Closure - Vendas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 flex justify-between items-center bg-gradient-to-br from-primary to-primary/40 rounded-3xl shadow-2xl shadow-primary/40 border border-foreground/5"
            style={{
              marginLeft: `${4 * 32}px`,
              marginRight: `${4 * 16}px`,
            }}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest font-mono">
                {calcPercentage(data.vendas, data.acontecidos)} CONVERSÃO FINAL
              </span>
              <span className="text-base font-black text-foreground uppercase italic tracking-tight">
                VENDAS FECHADAS
              </span>
            </div>
            <span className="text-4xl font-black text-foreground tracking-tighter">{data.vendas}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
