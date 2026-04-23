import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/dashboard/LoadingScreen";
import { Header } from "@/components/dashboard/Header";
import { KPICard } from "@/components/dashboard/KPICard";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { FunnelInsights } from "@/components/dashboard/FunnelInsights";
import { CloserCard } from "@/components/dashboard/CloserCard";
import { SDRCard } from "@/components/dashboard/SDRCard";
import { PacingStatus } from "@/components/dashboard/PacingStatus";
import { AddDealModal } from "@/components/dashboard/AddDealModal";
import { AddSdrModal } from "@/components/dashboard/AddSdrModal";
import { CloserModal } from "@/components/dashboard/CloserModal";
import { useConfig, usePipeline, useSdrDiario } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { TableProperties, Users, LogOut } from "lucide-react";

import brunoPic  from "@/assets/bruno.png";
import felipePic from "@/assets/felipe.png";
import joaoPic   from "@/assets/joao.png";

const AVATARS = { bruno: brunoPic, luisFelipe: felipePic, joaoGabriel: joaoPic };

const formatC = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

const Index = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { data: config,  isLoading: loadingConfig  } = useConfig();
  const { data: pipeline, isLoading: loadingPipeline, dataUpdatedAt } = usePipeline();
  const { data: sdrData,  isLoading: loadingSdr     } = useSdrDiario();

  const handleLogout = async () => { await signOut(); navigate("/login") };

  const loading = loadingPipeline || loadingSdr;

  // ── KPIs derivados ──────────────────────────────────────────
  const kpis = useMemo(() => {
    if (!pipeline || !sdrData) return null;

    const fechados   = pipeline.filter(d => d.status === "Fechado");
    const propostas  = pipeline.filter(d => d.status === "Proposta");

    const receita    = fechados.reduce((s, d)  => s + (d.valor ?? 0), 0);
    const naRua      = propostas.reduce((s, d) => s + (d.valor ?? 0), 0);
    const vendasC    = fechados.length;

    const brunoR      = fechados.filter(d => d.closer === "Bruno").reduce((s, d) => s + (d.valor ?? 0), 0);
    const luisFelipeR = fechados.filter(d => d.closer === "Luís Felipe" || d.closer === "Luis Felipe").reduce((s, d) => s + (d.valor ?? 0), 0);

    const totalShow      = sdrData.reduce((s, d) => s + (d.show     ?? 0), 0);
    const totalMarcadas  = sdrData.reduce((s, d) => s + (d.marcadas ?? 0), 0);

    const joaoGabrielM = pipeline.filter(d => d.sdr === "João Gabriel" || d.sdr === "João").length;

    const invest     = config?.investimento     ?? 100000;
    const meta       = config?.meta_total       ?? 235000;
    const diasT      = config?.dias_uteis_mes   ?? 22;
    const diasH      = config?.dias_uteis_hoje  ?? 17;

    const cpl        = 0; // sem tabela de leads ainda
    const cpc        = totalMarcadas > 0 ? invest / totalMarcadas : 0;
    const cpm        = totalMarcadas > 0 ? invest / totalMarcadas : 0;
    const cpr        = totalShow > 0     ? invest / totalShow     : 0;
    const cpv        = vendasC > 0       ? invest / vendasC       : 0;
    const ticketMedio = vendasC > 0      ? receita / vendasC      : 0;
    const roas        = invest > 0       ? receita / invest       : 0;

    const idealVal   = (meta / diasT) * diasH;
    const progReal   = meta > 0 ? (receita / meta) * 100 : 0;
    const progIdeal  = meta > 0 ? (idealVal / meta) * 100 : 0;
    const gap        = receita - idealVal;

    return {
      meta, receita, naRua, cpv, vendasC,
      leads: pipeline.length, contatos: totalMarcadas, marcados: totalMarcadas,
      acontecidos: totalShow,
      cpl, cpc, cpm, cpr, funnelCpv: cpv,
      funnelInvest: invest, ticketMedio, roas,
      invest, diasT, diasH,
      bruno: brunoR, luisFelipe: luisFelipeR,
      joaoGabrielMarcadas: joaoGabrielM,
      progReal, progIdeal, gap,
    };
  }, [pipeline, sdrData, config]);

  const syncTime = dataUpdatedAt
    ? `Última Sync: ${new Date(dataUpdatedAt).toLocaleTimeString()}`
    : "Syncing...";

  const status = loading ? "Connecting" : kpis ? "Live Dark Active" : "Sync Failure";

  const closers = [
    { name: "Bruno",       value: kpis?.bruno      ?? 0, avatar: AVATARS.bruno      },
    { name: "Luís Felipe", value: kpis?.luisFelipe ?? 0, avatar: AVATARS.luisFelipe },
  ].sort((a, b) => b.value - a.value);

  const sdrs = [
    { name: "João Gabriel", value: kpis?.joaoGabrielMarcadas ?? 0, avatar: AVATARS.joaoGabriel },
  ];

  const hasAnySales    = closers.some(c => c.value > 0);
  const hasAnyMarcadas = sdrs.some(s => s.value > 0);

  return (
    <>
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>

      <div className="p-4 md:p-10 lg:p-14 min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-[1850px] mx-auto space-y-12"
        >
          {/* Header + botões de ação */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Header syncTime={syncTime} status={status} countdown={20} />
            </div>
            <div className="flex gap-2 pt-2 flex-wrap">
              <Link to="/pipeline">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#333] text-gray-400 hover:text-white hover:border-[#C8FF00] text-xs tracking-widest uppercase transition-all">
                  <TableProperties className="w-3 h-3" /> Pipeline
                </button>
              </Link>
              <AddDealModal />
              <AddSdrModal />
              <CloserModal />
              <button onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#333] text-gray-600 hover:text-red-400 hover:border-red-400/40 text-xs tracking-widest uppercase transition-all">
                <LogOut className="w-3 h-3" /> Sair
              </button>
            </div>
          </div>

          {/* KPIs globais */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <KPICard label="Meta do Mês" value={formatC(kpis?.meta ?? 0)} />
            <KPICard
              label="Faturamento Confirmado"
              value={formatC(kpis?.receita ?? 0)}
              subtitle={`${kpis?.vendasC ?? 0} NEGÓCIOS FECHADOS EM ABR`}
              variant="primary"
            />
            <KPICard label='Negócios "Na Rua"' value={formatC(kpis?.naRua ?? 0)} />
            <KPICard
              label="CPV Consolidado"
              value={formatC(kpis?.cpv ?? 0)}
              subtitle="Custo Por Venda"
              variant="highlight"
            />
          </section>

          {/* Grid operacional */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              <ConversionFunnel
                data={{
                  leads:      kpis?.leads      ?? 0,
                  contatos:   kpis?.contatos   ?? 0,
                  marcados:   kpis?.marcados   ?? 0,
                  acontecidos:kpis?.acontecidos ?? 0,
                  vendas:     kpis?.vendasC    ?? 0,
                }}
              />
              <FunnelInsights
                cpl={kpis?.cpl ?? 0}
                cpc={kpis?.cpc ?? 0}
                cpm={kpis?.cpm ?? 0}
                cpr={kpis?.cpr ?? 0}
                cpv={kpis?.funnelCpv ?? 0}
                invest={kpis?.funnelInvest ?? 0}
                ticketMedio={kpis?.ticketMedio ?? 0}
                roas={kpis?.roas ?? 0}
                formatCurrency={formatC}
              />
            </div>

            <aside className="lg:col-span-4 space-y-10">
              {/* Closers */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground px-2 border-l-4 border-primary pl-4 italic">
                  Arena dos Closers
                </h3>
                <div className="space-y-6">
                  {closers.map((c, idx) => (
                    <CloserCard
                      key={c.name}
                      name={c.name}
                      value={formatC(c.value)}
                      progress={(c.value / ((kpis?.meta ?? 1) / 2)) * 100}
                      avatar={c.avatar}
                      rank={hasAnySales ? (idx === 0 ? "gold" : "silver") : undefined}
                    />
                  ))}
                </div>
              </div>

              {/* SDRs */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground px-2 border-l-4 border-emerald pl-4 italic">
                  Motor SDR Abr
                </h3>
                {sdrs.map((s) => (
                  <SDRCard
                    key={s.name}
                    name={s.name}
                    value={s.value}
                    progress={(s.value / 70) * 100}
                    avatar={s.avatar}
                    rank={hasAnyMarcadas ? "gold" : undefined}
                  />
                ))}
              </div>

              <PacingStatus
                realPct={kpis?.progReal  ?? 0}
                idealPct={kpis?.progIdeal ?? 0}
                gap={kpis?.gap ?? 0}
                formatCurrency={formatC}
              />
            </aside>
          </div>

          <footer className="pt-10 pb-16 text-center border-t border-foreground/5 opacity-40">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em]">
              V4 COMPANY • PERFORMANCE ARENA • DANIEL CANQUERINO
            </p>
          </footer>
        </motion.div>
      </div>
    </>
  );
};

export default Index;
