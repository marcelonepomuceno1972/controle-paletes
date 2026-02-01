"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

type LinhaResumo = {
  entradas: number;
  saidas: number;
  saldo: number;
};

type KPI = {
  entradas: number;
  saidas: number;
  estoqueMedio: number;
  giro: number;
};

export default function ResumoMensalPage() {
  const hoje = new Date();

  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);

  const [porArea, setPorArea] = useState<Record<string, LinhaResumo>>({});
  const [porTipo, setPorTipo] = useState<Record<string, LinhaResumo>>({});
  const [comparativo, setComparativo] = useState<{ mes: number; saldo: number }[]>([]);
  const [kpi, setKpi] = useState<KPI | null>(null);

  const [loading, setLoading] = useState(false);

  async function carregarTudo() {
    setLoading(true);
    try {
      const [rArea, rTipo, rComp, rKpi] = await Promise.all([
        fetch(`/api/resumo-mensal?ano=${ano}&mes=${mes}`, { cache: "no-store" }),
        fetch(`/api/resumo-mensal-por-tipo?ano=${ano}&mes=${mes}`, { cache: "no-store" }),
        fetch(`/api/comparativo-mensal?ano=${ano}`, { cache: "no-store" }),
        fetch(`/api/kpi-giro?ano=${ano}&mes=${mes}`, { cache: "no-store" }),
      ]);

      setPorArea(await rArea.json());
      setPorTipo(await rTipo.json());
      setComparativo(await rComp.json());
      setKpi(await rKpi.json());
    } catch {
      alert("Erro ao carregar resumo mensal ❌");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarTudo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const areas = Object.keys(porArea);
  const tipos = Object.keys(porTipo);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl bg-white rounded-xl shadow p-6 space-y-10">
        {/* CABEÇALHO */}
        <header className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-800">
            Resumo Mensal Executivo
          </h1>

          <Link
            href="/painel"
            className="px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            ← Painel
          </Link>
        </header>

        {/* FILTROS + EXPORT */}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm">Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm">Mês</label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="border rounded p-2"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={carregarTudo}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Atualizar
          </button>

          <a
            href={`/api/resumo-mensal/export?ano=${ano}&mes=${mes}&formato=csv`}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Exportar CSV
          </a>

          <a
            href={`/api/resumo-mensal/export?ano=${ano}&mes=${mes}&formato=xlsx`}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Exportar Excel
          </a>
        </div>

        {loading ? (
          <p>Carregando dados...</p>
        ) : (
          <>
            {/* KPI */}
            {kpi && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <p className="text-sm text-gray-500">Entradas</p>
                  <p className="text-2xl font-bold">{kpi.entradas}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <p className="text-sm text-gray-500">Saídas</p>
                  <p className="text-2xl font-bold">{kpi.saidas}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <p className="text-sm text-gray-500">Estoque Médio</p>
                  <p className="text-2xl font-bold">{kpi.estoqueMedio}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <p className="text-sm text-gray-500">Giro</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {kpi.giro}
                  </p>
                </div>
              </div>
            )}

            {/* GRÁFICO ENTRADAS x SAÍDAS */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Bar
                data={{
                  labels: areas,
                  datasets: [
                    {
                      label: "Entradas",
                      data: areas.map((a) => porArea[a].entradas),
                      backgroundColor: "#16a34a",
                    },
                    {
                      label: "Saídas",
                      data: areas.map((a) => porArea[a].saidas),
                      backgroundColor: "#dc2626",
                    },
                  ],
                }}
              />
            </div>

            {/* GRÁFICO POR TIPO */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Bar
                data={{
                  labels: tipos,
                  datasets: [
                    {
                      label: "Entradas",
                      data: tipos.map((t) => porTipo[t].entradas),
                      backgroundColor: "#22c55e",
                    },
                    {
                      label: "Saídas",
                      data: tipos.map((t) => porTipo[t].saidas),
                      backgroundColor: "#ef4444",
                    },
                  ],
                }}
              />
            </div>

            {/* COMPARATIVO MÊS A MÊS */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Line
                data={{
                  labels: comparativo.map((m) => `M${m.mes}`),
                  datasets: [
                    {
                      label: "Saldo Mensal",
                      data: comparativo.map((m) => m.saldo),
                      borderColor: "#2563eb",
                    },
                  ],
                }}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
