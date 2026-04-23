"""
Importa os dados de Abril 2026 direto para o Supabase.

Uso:
  python3 import_supabase.py <SUPABASE_URL> <SERVICE_ROLE_KEY>

Exemplo:
  python3 import_supabase.py https://xyzxyz.supabase.co eyJhbGci...
"""
import sys
import json
from supabase import create_client

# ── Credenciais ────────────────────────────────────────────────
if len(sys.argv) < 3:
    print("Uso: python3 import_supabase.py <URL> <SERVICE_ROLE_KEY>")
    sys.exit(1)

URL = sys.argv[1]
KEY = sys.argv[2]
sb  = create_client(URL, KEY)

# ── Dados ──────────────────────────────────────────────────────
CONFIG = {
    "periodo":           "ABR 2026",
    "meta_total":        235000,
    "meta_onetime":      180000,
    "meta_mrr":          55000,
    "investimento":      100000,
    "canal_aquisicao":   "Leadbroker",
    "dias_uteis_mes":    22,
    "dias_uteis_hoje":   17,
}

PIPELINE = [
    {"cliente":"Foton",                    "valor":12364.00,  "status":"Fechado",  "temperatura":"Quente","data_lead":"Março","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"Bruno",       "sdr":"Daniel",       "data_assinatura":"2026-04-06"},
    {"cliente":"Vie Douce",                "valor":3301.01,   "status":"Fechado",  "temperatura":"Quente","data_lead":"Abril","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"João",        "sdr":"Daniel",       "data_assinatura":"2026-04-03"},
    {"cliente":"Vie Douce",                "valor":5479.92,   "status":"Fechado",  "temperatura":"Quente","data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"João",        "sdr":"Daniel",       "data_assinatura":"2026-04-07"},
    {"cliente":"Atlas",                    "valor":14050.00,  "status":"Fechado",  "temperatura":"Quente","data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"Bruno",       "sdr":"Daniel",       "data_assinatura":"2026-04-10"},
    {"cliente":"Home Interiores",          "valor":17984.00,  "status":"Fechado",  "temperatura":"Quente","data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"João",        "sdr":"Daniel",       "data_assinatura":"2026-04-15"},
    {"cliente":"Ergon Vision",             "valor":2799.00,   "status":"Fechado",  "temperatura":"Quente","data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"João",        "sdr":"João",         "data_assinatura":"2026-04-14"},
    {"cliente":"Ergon Vision",             "valor":3961.21,   "status":"Fechado",  "temperatura":"Quente","data_lead":"Abril","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"João",        "sdr":"João",         "data_assinatura":"2026-04-14"},
    {"cliente":"Tornearia do Veinho",      "valor":3159.82,   "status":"Fechado",  "temperatura":"Quente","data_lead":"Abril","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"Bruno",       "sdr":"Bruno",        "data_assinatura":"2026-04-16"},
    {"cliente":"ROTA MAQ",                 "valor":3565.09,   "status":"Fechado",  "temperatura":"Quente","data_lead":"Março","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"Bruno",       "sdr":"João",         "data_assinatura":None},
    {"cliente":"Arkan",                    "valor":20000.00,  "status":"Proposta", "temperatura":"Quente","data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"João",        "sdr":None,           "data_assinatura":None},
    {"cliente":"MELK",                     "valor":None,      "status":"Proposta", "temperatura":"Quente","data_lead":"Abril","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"Bruno",       "sdr":"João",         "data_assinatura":None},
    {"cliente":"Essence Tercerização",     "valor":None,      "status":"Proposta", "temperatura":"Quente","data_lead":"Abril","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"Bruno",       "sdr":"João",         "data_assinatura":None},
    {"cliente":"La ensenada",              "valor":45750.00,  "status":"Proposta", "temperatura":"Morno", "data_lead":"Março","canal":"Evento",             "produto":"ONE TIME",    "closer":"Luis Felipe", "sdr":"Luis Felipe",  "data_assinatura":None},
    {"cliente":"Indusbello",               "valor":64633.80,  "status":"Proposta", "temperatura":"Morno", "data_lead":"Março","canal":"Evento",             "produto":"ONE TIME",    "closer":"Luis Felipe", "sdr":"Luis Felipe",  "data_assinatura":None},
    {"cliente":"Hyleflex",                 "valor":18000.00,  "status":"Proposta", "temperatura":"Morno", "data_lead":"Abril","canal":"Recuperação Broker", "produto":"ONE TIME",    "closer":"João",        "sdr":None,           "data_assinatura":None},
    {"cliente":"Joy",                      "valor":25000.00,  "status":"Proposta", "temperatura":"Morno", "data_lead":"Abril","canal":"Recuperação Broker", "produto":"Ass. Booking","closer":"João",        "sdr":None,           "data_assinatura":None},
    {"cliente":"Arrue",                    "valor":14050.00,  "status":"Proposta", "temperatura":"Morno", "data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"Bruno",       "sdr":None,           "data_assinatura":None},
    {"cliente":"Clinica Amare",            "valor":3300.00,   "status":"Proposta", "temperatura":"Morno", "data_lead":"Abril","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"Bruno",       "sdr":"João",         "data_assinatura":None},
    {"cliente":"Confido",                  "valor":None,      "status":"Proposta", "temperatura":"Morno", "data_lead":"Abril","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"Bruno",       "sdr":"João",         "data_assinatura":None},
    {"cliente":"Erione",                   "valor":None,      "status":"Proposta", "temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"Bruno",       "sdr":None,           "data_assinatura":None},
    {"cliente":"Silvio Brandão",           "valor":18000.00,  "status":"Proposta", "temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"João",        "sdr":None,           "data_assinatura":None},
    {"cliente":"Advan",                    "valor":21000.00,  "status":"Proposta", "temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"João",        "sdr":None,           "data_assinatura":None},
    {"cliente":"Ótica Visão",              "valor":38113.08,  "status":"Negativou","temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"Bruno",       "sdr":None,           "data_assinatura":None},
    {"cliente":"Faz Beauty",               "valor":23604.00,  "status":"Proposta", "temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"Bruno",       "sdr":"Bruno",        "data_assinatura":None},
    {"cliente":"Arteled Iluminação",       "valor":None,      "status":"Proposta", "temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"Bruno",       "sdr":"Bruno",        "data_assinatura":None},
    {"cliente":"VegasOn",                  "valor":18000.00,  "status":"Negativou","temperatura":"Frio",  "data_lead":"Abril","canal":"Recuperação Broker", "produto":"ONE TIME",    "closer":"João",        "sdr":None,           "data_assinatura":None},
    {"cliente":"Buffet Primavera",         "valor":14050.00,  "status":"Negativou","temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"Bruno",       "sdr":"Daniel",       "data_assinatura":None},
    {"cliente":"MariasBobinas",            "valor":14050.00,  "status":"Negativou","temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"Bruno",       "sdr":None,           "data_assinatura":None},
    {"cliente":"Mendes Pereira e Taveira", "valor":36000.00,  "status":"Negativou","temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"João",        "sdr":None,           "data_assinatura":None},
    {"cliente":"Mendes Pereira e Taveira", "valor":4000.00,   "status":"Negativou","temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"João",        "sdr":None,           "data_assinatura":None},
    {"cliente":"LuiOfalmologia",           "valor":18546.00,  "status":"Negativou","temperatura":"Frio",  "data_lead":"Março","canal":"Recomendação",       "produto":"ONE TIME",    "closer":"Bruno",       "sdr":None,           "data_assinatura":None},
    {"cliente":"Radar de Licitações",      "valor":3000.00,   "status":"Negativou","temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"João",        "sdr":None,           "data_assinatura":None},
    {"cliente":"Dr. Rafael",               "valor":3900.00,   "status":"Negativou","temperatura":"Frio",  "data_lead":"Abril","canal":"LeadBroker",         "produto":"Ass. Booking","closer":"Bruno",       "sdr":None,           "data_assinatura":None},
    {"cliente":"Dra. Silvia Odete",        "valor":28100.00,  "status":"Stand by", "temperatura":"Morno", "data_lead":"Março","canal":"LeadBroker",         "produto":"ONE TIME",    "closer":"Bruno",       "sdr":None,           "data_assinatura":None},
    {"cliente":"Tenext",                   "valor":5018.00,   "status":"Stand by", "temperatura":"Frio",  "data_lead":"Março","canal":"Box",                "produto":"Ass. Booking","closer":"Bruno",       "sdr":"Marcelo",      "data_assinatura":None},
]

SDR_DIARIO = [
    {"data":"2026-04-01","dia_semana":"Qua","show":8, "no_show":0,"marcadas":0,   "remarcada":0},
    {"data":"2026-04-02","dia_semana":"Qui","show":0, "no_show":1,"marcadas":4,   "remarcada":0},
    {"data":"2026-04-03","dia_semana":"Sex","show":0, "no_show":0,"marcadas":0,   "remarcada":0},
    {"data":"2026-04-06","dia_semana":"Seg","show":3, "no_show":1,"marcadas":5,   "remarcada":1},
    {"data":"2026-04-07","dia_semana":"Ter","show":3, "no_show":0,"marcadas":1,   "remarcada":2},
    {"data":"2026-04-08","dia_semana":"Qua","show":2, "no_show":0,"marcadas":1,   "remarcada":2},
    {"data":"2026-04-09","dia_semana":"Qui","show":3, "no_show":0,"marcadas":4,   "remarcada":0},
    {"data":"2026-04-10","dia_semana":"Sex","show":2, "no_show":1,"marcadas":2,   "remarcada":0},
    {"data":"2026-04-13","dia_semana":"Seg","show":1, "no_show":1,"marcadas":4,   "remarcada":0},
    {"data":"2026-04-14","dia_semana":"Ter","show":1, "no_show":0,"marcadas":3,   "remarcada":0},
    {"data":"2026-04-15","dia_semana":"Qua","show":2, "no_show":0,"marcadas":6,   "remarcada":0},
    {"data":"2026-04-16","dia_semana":"Qui","show":2, "no_show":1,"marcadas":1,   "remarcada":0},
    {"data":"2026-04-17","dia_semana":"Sex","show":1, "no_show":2,"marcadas":3,   "remarcada":0},
    {"data":"2026-04-20","dia_semana":"Seg","show":0, "no_show":1,"marcadas":2,   "remarcada":2},
    {"data":"2026-04-21","dia_semana":"Ter","show":1, "no_show":1,"marcadas":4,   "remarcada":0},
    {"data":"2026-04-22","dia_semana":"Qua","show":3, "no_show":2,"marcadas":None,"remarcada":None},
    {"data":"2026-04-23","dia_semana":"Qui","show":1, "no_show":None,"marcadas":None,"remarcada":None},
]

# ── Import ─────────────────────────────────────────────────────
def run():
    print("\n🔄 Iniciando import para Supabase...\n")

    # Config
    print("📋 Inserindo config do mês...")
    res = sb.table("config_mes").upsert(CONFIG, on_conflict="periodo").execute()
    print(f"   ✅ Config ABR 2026 inserida")

    # Pipeline
    print(f"\n🎯 Inserindo {len(PIPELINE)} deals no pipeline...")
    # Limpa registros do período antes
    sb.table("pipeline").delete().eq("periodo", "ABR 2026").execute()
    res = sb.table("pipeline").insert(PIPELINE).execute()
    print(f"   ✅ {len(PIPELINE)} deals inseridos")

    # SDR Diário
    print(f"\n📞 Inserindo {len(SDR_DIARIO)} registros SDR diário...")
    for row in SDR_DIARIO:
        sb.table("sdr_diario").upsert(row, on_conflict="data").execute()
    print(f"   ✅ SDR diário inserido")

    # Verificação rápida
    print("\n📊 Verificando dados inseridos...")
    p = sb.table("pipeline").select("status", count="exact").execute()
    print(f"   Pipeline: {p.count} registros")
    s = sb.table("sdr_diario").select("*", count="exact").execute()
    print(f"   SDR diário: {s.count} registros")

    print("\n✅ Import concluído com sucesso!\n")
    print("   Acesse seu projeto no Supabase > Table Editor para visualizar.")
    print("   As views v_pipeline_resumo, v_closer_resumo e v_sdr_totais")
    print("   estão disponíveis em Database > Views.\n")

if __name__ == "__main__":
    run()
