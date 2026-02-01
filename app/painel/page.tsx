import { FarolLogisticaReversa } from '@/components/FarolLogisticaReversa'
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const AREAS = [
  "LOGISTICA REVERSA",
  "PRODUÇÃO",
  "FLV",
  "MERCEARIA",
  "FRIGORIFICO",
  "FRIGO HORTOLÂNDIA",
  "RECEBIMENTO",
] as const;

const TIPOS = ["PBR", "CHEP", "DESCARTÁVEL", "GAIOLA"] as const;

/* 🚦 REGRA DO SEMÁFORO */
function semaforoEstoque(valor: number) {
  if (valor <= 500) {
    return { label: "CRÍTICO", cor: "text-red-600", bg: "bg-red-50" };
  }
  if (valor <= 1000) {
    return { label: "ATENÇÃO", cor: "text-yellow-700", bg: "bg-yellow-50" };
  }
  return { label: "SAUDÁVEL", cor: "text-green-700", bg: "bg-green-50" };
}

export default async function Painel() {
  /* ===========================
     CÁLCULO DE SALDO (REGRA ÚNICA)
     =========================== */

  const entradas = await prisma.movimentacao.groupBy({
    by: ["destino", "tipoPalete"],
    _sum: { quantidade: true },
  });

  const saidas = await prisma.movimentacao.groupBy({
    by: ["origem", "tipoPalete"],
    _sum: { quantidade: true },
  });

  const saldo: Record<string, Record<string, number>> = {};

  for (const area of AREAS) {
    saldo[area] = {};
    for (const tipo of TIPOS) saldo[area][tipo] = 0;
  }

  for (const e of entradas) {
    if (e.destino && saldo[e.destino]) {
      saldo[e.destino][e.tipoPalete] += e._sum.quantidade ?? 0;
    }
  }

  for (const s of saidas) {
    if (s.origem && saldo[s.origem]) {
      saldo[s.origem][s.tipoPalete] -= s._sum.quantidade ?? 0;
    }
  }

  /* ===========================
     LOGÍSTICA REVERSA (FOCO)
     =========================== */

  const saldoLogistica = saldo["LOGISTICA REVERSA"];
  const totalLogistica = Object.values(saldoLogistica).reduce(
    (acc, v) => acc + v,
    0
  );

  const statusLogistica = semaforoEstoque(totalLogistica);

  const totalGeral = Object.values(saldo).reduce(
    (acc, area) =>
      acc + Object.values(area).reduce((a, b) => a + b, 0),
    0
  );

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl bg-white rounded-xl shadow p-6 space-y-6">
        {/* CABEÇALHO */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard — Saldos por Área
            </h1>
            <p className="text-gray-600">
              Total geral: <strong>{totalGeral}</strong>
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/entrada"
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              Nova Entrada
            </Link>
            <Link
              href="/movimentacao"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Nova Movimentação
            </Link>
          </div>
        </header>

        {/* CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AREAS.map((area) => {
            const totalArea = Object.values(saldo[area]).reduce(
              (a, b) => a + b,
              0
            );

            /* 🔥 CARD ESPECIAL — LOGÍSTICA REVERSA */
            if (area === "LOGISTICA REVERSA") {
              return (
                <div
                  key={area}
                  className={`rounded-xl border p-6 ${statusLogistica.bg}`}
                >
                  <p className="text-sm text-gray-500">Área</p>
                  <h2 className="text-lg font-semibold">{area}</h2>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-4xl font-bold">
                      {totalLogistica}
                    </p>

                    {/* SEMÁFORO */}
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${statusLogistica.cor}`}
                      >
                        {statusLogistica.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        Capacidade de atendimento
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-700 space-y-1">
                    {Object.entries(saldo[area]).map(([tipo, qtd]) => (
                      <div key={tipo} className="flex justify-between">
                        <span>{tipo}</span>
                        <span>{qtd}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            /* CARD NORMAL — DEMAIS ÁREAS */
            return (
              <div key={area} className="rounded-xl border p-6">
                <p className="text-sm text-gray-500">Área</p>
                <h2 className="text-lg font-semibold">{area}</h2>
                <p className="mt-2 text-4xl font-bold">{totalArea}</p>

                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  {Object.entries(saldo[area]).map(([tipo, qtd]) => (
                    <div key={tipo} className="flex justify-between">
                      <span>{tipo}</span>
                      <span>{qtd}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
