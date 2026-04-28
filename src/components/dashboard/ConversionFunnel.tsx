import { motion } from "framer-motion";

interface FunnelData {
  leads: number;
  marcados: number;
  acontecidos: number;
  vendas: number;
}

interface ConversionFunnelProps {
  data: FunnelData;
}

const pct = (value: number, total: number) =>
  total > 0 ? `${((value / total) * 100).toFixed(0)}%` : "0%";

export const ConversionFunnel = ({ data }: ConversionFunnelProps) => {
  const steps = [
    { value: data.leads,       indent: 0, conversion: null,                                         sublabel: "ENTRADA NO FUNIL"   },
    { value: data.marcados,    indent: 1, conversion: `${pct(data.marcados, data.leads)} TAXA MARCAÇÃO`,    sublabel: "REUNIÕES AGENDADAS" },
    { value: data.acontecidos, indent: 2, conversion: `${pct(data.acontecidos, data.marcados)} SHOW RATE`,  sublabel: "REUNIÕES REALIZADAS"},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground italic">
          Funil de Vendas
        </h3>
      </div>

      <div className="glass-neu p-10">
        <div className="space-y-3">
          {/* Top: Total de Leads */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="neu-inset p-5 flex justify-between items-center rounded-2xl"
          >
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Total de Leads
            </span>
            <div className="text-right">
              <span className="text-xl font-black text-white">{data.leads}</span>
              <div className="text-[8px] text-muted-foreground font-bold uppercase">{steps[0].sublabel}</div>
            </div>
          </motion.div>

          {/* Steps com conversão */}
          {steps.slice(1).map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index + 1) * 0.1 }}
              className="neu-inset p-5 flex justify-between items-center rounded-2xl"
              style={{
                marginLeft: `${step.indent * 32}px`,
                marginRight: `${step.indent * 16}px`,
              }}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E10600]">
                {step.conversion}
              </span>
              <div className="text-right">
                <span className="text-xl font-black text-white">{step.value}</span>
                <div className="text-[8px] text-muted-foreground font-bold uppercase">{step.sublabel}</div>
              </div>
            </motion.div>
          ))}

          {/* Final: Vendas Fechadas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 flex justify-between items-center bg-gradient-to-br from-[#E10600] to-[#7a0300] rounded-3xl shadow-2xl shadow-[#E10600]/40 border border-white/5"
            style={{ marginLeft: `${3 * 32}px`, marginRight: `${3 * 16}px` }}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest font-mono">
                {pct(data.vendas, data.acontecidos)} CONVERSÃO FINAL
              </span>
              <span className="text-base font-black text-white uppercase italic tracking-tight">
                VENDAS FECHADAS
              </span>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">{data.vendas}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
