import { prisma } from "@/app/lib/prisma";
import { FarolLogisticaReversa } from "@/components/FarolLogisticaReversa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AREAS = [
  "LOGISTICA REVERSA",
  "PRODUÇÃO",
  "FLV",
  "MERCEARIA",
  "FRIGORIFICO",
  "FRIGO HORTOLÂNDIA",
  "RECEBIMENTO",
];

function norm(s: string) {
  return String(s ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function add(
  saldo: Record<string, Record<string, number>>,
  area: string,
  tipo: string,
  qtd: number
) {
  const a = norm(area);
  const t = norm(tipo);
  if (!a || !t || !Number.isFinite(qtd)) return;

  if (!saldo[a]) saldo[a] = {};
  saldo[a][t] = (saldo[a][t] ?? 0) + Math.trunc(qtd);
}

export default async function SaldosPage() {
  const entradas = await prisma.entrada.findMany({
    select: {
      area: true,
      tipoPalete: true,
      quantidade: true,
    },
  });

  const movs = await prisma.movimentacao.findMany({
    select: {
      origem: true,
      destino: true,
      tipoPalete: true,
      quantidade: true,
    },
  });

  const saldo: Record<string, Record<string, number>> = {};

  // ENTRADAS: somam na área
  for (const e of entradas) {
    add(saldo, e.area, e.tipoPalete, e.quantidade);
  }

  // MOVIMENTAÇÕES: -origem, +destino
  for (const m of movs) {
    add(saldo, m.destino, m.tipoPalete, m.quantidade);

    if (m.origem) {
      add(saldo, m.origem, m.tipoPalete, -m.quantidade);
    }
  }

  // Descobre todos os tipos existentes
  const tiposSet = new Set<string>();
  for (const area of Object.keys(saldo)) {
    for (const tipo of Object.keys(saldo[area] ?? {})) {
      tiposSet.add(tipo);
    }
  }
  const tipos = Array.from(tiposSet).sort((a, b) => a.localeCompare(b));

  const areas = AREAS.map((a) => a.toUpperCase());

  const cards = areas.map((area) => {
    const porTipo = saldo[area] ?? {};
    const total = Object.values(porTipo).reduce((acc, n) => acc + n, 0);
    return { area, total, porTipo };
  });

  const totalGeral = cards.reduce((acc, c) => acc + c.total, 0);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl bg-white rounded-xl shadow p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard — Saldos por Área
            </h1>
            <p className="text-gray-600 mt-1">
              Total geral:{" "}
              <span className="font-semibold">{totalGeral}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href="/painel"
              className="inline-block px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
            >
              Painel
            </a>

            <a
              href="/movimentacao"
              className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Nova Movimentação
            </a>

            <a
              href="/entrada"
              className="inline-block px-4 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300"
            >
              Nova Entrada
            </a>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.area} className="border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Área</div>
                  <div className="text-lg font-bold text-gray-800">
                    {c.area}
                  </div>
                </div>

                {/* FAROL — SOMENTE LOGÍSTICA REVERSA */}
                <FarolLogisticaReversa
                  area={c.area}
                  saldo={c.total}
                />
              </div>

              <div className="mt-3 text-3xl font-extrabold">
                {c.total}
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {tipos.length === 0 ? (
                  <span>Sem tipos cadastrados ainda.</span>
                ) : (
                  <ul className="space-y-1">
                    {tipos.map((t) => (
                      <li key={t} className="flex justify-between">
                        <span>{t}</span>
                        <span className="font-semibold">
                          {c.porTipo[t] ?? 0}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tabela detalhada */}
        <div className="mt-8 overflow-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Área</th>
                <th className="p-3">Total</th>
                {tipos.map((t) => (
                  <th key={t} className="p-3">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {cards.map((c) => (
                <tr key={c.area} className="border-t">
                  <td className="p-3 font-semibold">
                    {c.area}
                  </td>
                  <td className="p-3 font-bold">
                    {c.total}
                  </td>
                  {tipos.map((t) => (
                    <td key={t} className="p-3">
                      {c.porTipo[t] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}

              {cards.length === 0 && (
                <tr>
                  <td
                    className="p-6 text-gray-500"
                    colSpan={2 + tipos.length}
                  >
                    Nenhum saldo disponível.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Regra: Entradas somam na área; Movimentações somam no destino
          e descontam na origem. Farol ativo apenas para Logística
          Reversa (≤600 crítico, 601–1199 atenção, ≥1200 saudável).
        </p>
      </div>
    </main>
  );
}
