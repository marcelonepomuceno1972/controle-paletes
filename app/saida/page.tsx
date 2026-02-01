"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type FornecedorItem = { id: string; nome: string };

const TIPOS_PALETE = ["PBR", "CHEP", "DESCARTÁVEL", "GAIOLA"];

// Origem fixa (matriz)
const ORIGEM_FIXA = "LOGISTICA REVERSA";

// Áreas fixas do CD
const AREAS_CD = [
  "LOGISTICA REVERSA",
  "PRODUÇÃO",
  "FLV",
  "MERCEARIA",
  "FRIGORIFICO",
  "FRIGO HORTOLÂNDIA",
  "RECEBIMENTO",
];

function titleCaseLoose(s: string) {
  return String(s ?? "").trim().replace(/\s+/g, " ");
}

export default function SaidaPage() {
  const [fornecedores, setFornecedores] = useState<FornecedorItem[]>([]);
  const [destino, setDestino] = useState("");

  const [tipoPalete, setTipoPalete] = useState("");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [operador, setOperador] = useState("");
  const [observacao, setObservacao] = useState("");

  async function carregarFornecedores() {
    try {
      const res = await fetch("/api/fornecedores", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as FornecedorItem[];
      setFornecedores(data);

      if (!destino) {
        setDestino("MERCEARIA");
      }
    } catch {
      // silencioso
    }
  }

  useEffect(() => {
    carregarFornecedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvarSaida() {
    const payload = {
      origem: ORIGEM_FIXA,
      destino: titleCaseLoose(destino),
      tipoPalete: titleCaseLoose(tipoPalete).toUpperCase(),
      quantidade: Number(quantidade),
      operador: titleCaseLoose(operador),
      observacao: observacao.trim() ? observacao.trim() : null,
    };

    if (
      !payload.destino ||
      !payload.tipoPalete ||
      !payload.operador ||
      !payload.quantidade
    ) {
      alert("Preencha os campos obrigatórios ❌");
      return;
    }

    if (!Number.isFinite(payload.quantidade) || payload.quantidade <= 0) {
      alert("Quantidade inválida ❌");
      return;
    }

    try {
      const res = await fetch("/api/movimentacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origem: payload.origem,
          destino: payload.destino,
          tipoPalete: payload.tipoPalete,
          quantidade: payload.quantidade,
          observacao: payload.observacao
            ? `${payload.observacao} | Operador: ${payload.operador}`
            : `Operador: ${payload.operador}`,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error ? `Erro: ${data.error}` : "Erro ao salvar saída ❌");
        return;
      }

      alert("Saída salva ✅");
      setTipoPalete("");
      setQuantidade("");
      setOperador("");
      setObservacao("");
    } catch (e: any) {
      alert(e?.message ? `Erro: ${e.message}` : "Erro ao salvar saída ❌");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-2xl bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-800">
            Registro de Saída de Paletes
          </h1>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            ← Início
          </Link>
        </div>

        <p className="mt-2 text-sm text-gray-600">
          Use para registrar retirada/expedição de paletes da área.
        </p>

        {/* Origem fixa */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Área de Origem (fixa)
          </label>
          <input
            value={ORIGEM_FIXA}
            disabled
            className="mt-2 w-full rounded-lg border p-3 bg-gray-100 text-gray-700"
          />
        </div>

        {/* Destino com optgroup */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Destino
          </label>

          <select
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            className="mt-2 w-full rounded-lg border p-3 bg-white"
          >
            <option value="">Selecione o destino</option>

            <optgroup label="Áreas do CD">
              {AREAS_CD.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </optgroup>

            <optgroup label="Fornecedores">
              {fornecedores.map((f) => (
                <option key={f.id} value={f.nome}>
                  {f.nome}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Tipo */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Palete
          </label>
          <select
            value={tipoPalete}
            onChange={(e) => setTipoPalete(e.target.value)}
            className="mt-2 w-full rounded-lg border p-3 bg-white"
          >
            <option value="">Selecione...</option>
            {TIPOS_PALETE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Quantidade */}
        <div className="mt-4">
          <input
            value={quantidade}
            onChange={(e) =>
              setQuantidade(e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            min={1}
            placeholder="Quantidade"
            className="w-full rounded-lg border p-3"
          />
        </div>

        {/* Operador */}
        <div className="mt-4">
          <input
            value={operador}
            onChange={(e) => setOperador(e.target.value)}
            placeholder="Operador"
            className="w-full rounded-lg border p-3"
          />
        </div>

        {/* Observações */}
        <div className="mt-4">
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Observações"
            className="w-full rounded-lg border p-3 min-h-[110px]"
          />
        </div>

        <button
          onClick={salvarSaida}
          className="mt-6 w-full px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Salvar Saída
        </button>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/painel"
            className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg border hover:bg-gray-50"
          >
            Ver Painel
          </Link>

          <Link
            href="/movimentacao"
            className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg border hover:bg-gray-50"
          >
            Movimentação
          </Link>
        </div>
      </div>
    </main>
  );
}
