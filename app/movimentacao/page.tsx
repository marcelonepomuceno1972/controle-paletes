"use client";

import { useMemo, useState } from "react";

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

function norm(s: string) {
  return String(s ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

export default function MovimentacaoPage() {
  const [origem, setOrigem] = useState("LOGISTICA REVERSA");
  const [destino, setDestino] = useState("MERCEARIA");
  const [tipoPalete, setTipoPalete] = useState("PBR");
  const [quantidade, setQuantidade] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");

  const [salvando, setSalvando] = useState(false);

  const podeSalvar = useMemo(() => {
    const qtd = Number(quantidade);
    return (
      origem.trim().length > 0 &&
      destino.trim().length > 0 &&
      tipoPalete.trim().length > 0 &&
      Number.isFinite(qtd) &&
      qtd > 0 &&
      norm(origem) !== norm(destino)
    );
  }, [origem, destino, tipoPalete, quantidade]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!podeSalvar) {
      alert("Preencha os campos corretamente (origem ≠ destino e quantidade > 0).");
      return;
    }

    setSalvando(true);

    const payload = {
      origem: norm(origem),
      destino: norm(destino),
      tipoPalete: norm(tipoPalete),
      quantidade: Math.trunc(Number(quantidade)),
      observacao: observacao.trim() ? observacao.trim() : null,
    };

    try {
      const res = await fetch("/api/movimentacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error ? `Erro: ${data.error}` : "Erro ao salvar movimentação");
        return;
      }

      alert("Movimentação salva ✅");
      setQuantidade("");
      setObservacao("");
    } catch (err) {
      console.error("ERRO FETCH MOVIMENTACAO:", err);
      alert("Falha ao conectar na API ❌");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-xl space-y-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Movimentação de Paletes</h1>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            ← Início
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Origem</label>
            <select
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="mt-2 w-full border p-3 rounded-lg bg-white"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Destino</label>
            <select
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="mt-2 w-full border p-3 rounded-lg bg-white"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Palete</label>
            <select
              value={tipoPalete}
              onChange={(e) => setTipoPalete(e.target.value)}
              className="mt-2 w-full border p-3 rounded-lg bg-white"
            >
              {TIPOS_PALETE.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <input
            type="number"
            placeholder="Quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="w-full border p-3 rounded-lg"
            min={1}
          />

          <textarea
            placeholder="Observações (opcional)"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full border p-3 rounded-lg"
            rows={3}
          />

          <button
            type="submit"
            disabled={salvando}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Registrar Movimentação"}
          </button>
        </form>

        <div className="grid grid-cols-3 gap-2">
          <a
            href="/painel"
            className="text-center px-4 py-3 rounded-lg bg-gray-900 text-white hover:bg-black"
          >
            Ver Painel
          </a>

          <a
            href="/saldos"
            className="text-center px-4 py-3 rounded-lg border bg-white hover:bg-gray-50"
          >
            Saldo por Área
          </a>

          <a
            href="/entrada"
            className="text-center px-4 py-3 rounded-lg border bg-white hover:bg-gray-50"
          >
            Voltar p/ Entrada
          </a>
        </div>
      </div>
    </main>
  );
}

