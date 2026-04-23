import { motion } from "framer-motion";

interface FunnelInsightsProps {
  cpl: number;
  cpc: number;
  cpm: number;
  cpr: number;
  cpv: number;
  invest: number;
  ticketMedio: number;
  roas: number;
  formatCurrency: (v: number) => string;
}

export const FunnelInsights = ({
  cpl,
  cpc,
  cpm,
  cpr,
  cpv,
  invest,
  ticketMedio,
  roas,
  formatCurrency,
}: FunnelInsightsProps) => {
  const metrics = [
    { label: "CPL", value: formatCurrency(cpl), sublabel: "Custo por Lead" },
    { label: "CPC", value: formatCurrency(cpc), sublabel: "Custo por Contato" },
    { label: "CPM", value: formatCurrency(cpm), sublabel: "Custo por Marcação" },
    { label: "CPR", value: formatCurrency(cpr), sublabel: "Custo por Reunião" },
    { label: "CPV", value: formatCurrency(cpv), sublabel: "Custo por Venda", highlight: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground italic">
          Métricas de Investimento
        </h3>
      </div>

      <div className="glass-neu p-8">
        {/* Cost Metrics Grid */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`neu-inset p-4 text-center ${metric.highlight ? 'border border-primary/30 bg-primary/5' : ''}`}
            >
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                {metric.label}
              </span>
              <div className="text-lg font-black text-foreground mt-1">
                {metric.value}
              </div>
              <div className="text-[8px] text-muted-foreground font-bold uppercase mt-1">
                {metric.sublabel}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats Row */}
        <div className="grid grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="neu-inset p-5 text-center"
          >
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              Investimento Total
            </span>
            <div className="text-2xl font-black text-foreground mt-2">
              {formatCurrency(invest)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="neu-inset p-5 text-center"
          >
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              Ticket Médio
            </span>
            <div className="text-2xl font-black text-foreground mt-2">
              {formatCurrency(ticketMedio)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="p-5 text-center bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl border border-emerald-500/20"
          >
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
              ROAS
            </span>
            <div className="text-3xl font-black text-emerald-400 mt-2">
              {roas.toFixed(2)}x
            </div>
            <div className="text-[8px] text-emerald-400/70 font-bold uppercase mt-1">
              Retorno sobre Investimento
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
