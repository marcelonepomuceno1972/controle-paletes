"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const AREAS = [
  "LOGISTICA REVERSA",
  "PRODUÇÃO",
  "FLV",
  "MERCEARIA",
  "FRIGORIFICO",
  "FRIGO HORTOLÂNDIA",
  "RECEBIMENTO",
];

const TIPOS_PALETE = ["PBR", "CHEP", "DESCARTÁVEL", "GAIOLA"];

type Item = {
  id: string;
  createdAt: string;
  origem: string | null;
  destino: string;
  tipoPalete: string;
  quantidade: number;
  fornecedor: string | null;
  observacao: string | null;
};

export default function HistoricoPage() {
  const [dados, setDados] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [area, setArea] = useState("");
  const [tipoPalete, setTipoPalete] = useState("");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");

  async function carregar() {
    setLoading(true);

    const params = new URLSearchParams();
    if (area) params.append("area", area);
    if (tipoPalete) params.append("tipoPalete", tipoPalete);
    if (dataIni) params.append("dataIni", dataIni);
    if (dataFim) params.append("dataFim", dataFim);

    try {
      const res = await fetch(`/api/historico?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setDados(data);
    } catch {
      alert("Erro ao carregar histórico ❌");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Histórico de Movimentações
          </h1>

          <Link href="/" className="px-3 py-2 rounded-lg border hover:bg-gray-50">
            ← Início
          </Link>
        </div>

        {/* FILTROS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Todas as áreas</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            value={tipoPalete}
            onChange={(e) => setTipoPalete(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Todos os paletes</option>
            {TIPOS_PALETE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
            className="border rounded p-2"
          />

          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border rounded p-2"
          />

          <button
            onClick={carregar}
            className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
          >
            Filtrar
          </button>
        </div>
<div className="flex gap-2 mb-4">
  <a
    href={`/api/historico/export?formato=csv&area=${area}&tipoPalete=${tipoPalete}&dataIni=${dataIni}&dataFim=${dataFim}`}
    className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"
  >
    Exportar CSV
  </a>

  <a
    href={`/api/historico/export?formato=xlsx&area=${area}&tipoPalete=${tipoPalete}&dataIni=${dataIni}&dataFim=${dataFim}`}
    className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"
  >
    Exportar Excel
  </a>
</div>
        {/* TABELA */}
        {loading ? (
          <p>Carregando...</p>
        ) : dados.length === 0 ? (
          <p className="text-gray-500">Nenhum registro encontrado.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Data</th>
                  <th className="border p-2">Origem</th>
                  <th className="border p-2">Destino</th>
                  <th className="border p-2">Tipo</th>
                  <th className="border p-2">Qtd</th>
                  <th className="border p-2">Fornecedor</th>
                  <th className="border p-2">Obs.</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="border p-2">
                      {new Date(m.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="border p-2">{m.origem ?? "ENTRADA"}</td>
                    <td className="border p-2">{m.destino}</td>
                    <td className="border p-2">{m.tipoPalete}</td>
                    <td className="border p-2 font-medium">{m.quantidade}</td>
                    <td className="border p-2">{m.fornecedor ?? "-"}</td>
                    <td className="border p-2">{m.observacao ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

