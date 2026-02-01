"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type FornecedorItem = { id: string; nome: string };

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

export default function EntradaPage() {
  const [novoFornecedor, setNovoFornecedor] = useState("");
  const [fornecedores, setFornecedores] = useState<FornecedorItem[]>([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState("");

  const [tipoPalete, setTipoPalete] = useState("");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [area, setArea] = useState("LOGISTICA REVERSA");
  const [operador, setOperador] = useState("");
  const [observacao, setObservacao] = useState("");

  const tiposPadrao = useMemo(() => TIPOS_PALETE, []);

  async function carregarFornecedores() {
    try {
      const res = await fetch("/api/fornecedores", { cache: "no-store" });
      if (!res.ok) return;

      const data = (await res.json()) as FornecedorItem[];
      const ordenado = (data ?? []).slice().sort((a, b) => a.nome.localeCompare(b.nome));
      setFornecedores(ordenado);

      if (!fornecedorSelecionado && ordenado.length > 0) {
        setFornecedorSelecionado(ordenado[0].nome);
      }
    } catch (e) {
      console.error("ERRO carregarFornecedores:", e);
    }
  }

  useEffect(() => {
    carregarFornecedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvarFornecedor() {
    const nome = novoFornecedor.trim();
    if (!nome) {
      alert("Digite o nome do fornecedor.");
      return;
    }

    try {
      const res = await fetch("/api/fornecedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (!res.ok) {
        alert("Erro ao salvar fornecedor ❌");
        return;
      }

      alert("Fornecedor salvo ✅");
      setNovoFornecedor("");
      await carregarFornecedores();
      setFornecedorSelecionado(nome);
    } catch (e) {
      console.error("ERRO salvarFornecedor:", e);
      alert("Erro ao salvar fornecedor ❌");
    }
  }

  async function salvarEntrada() {
    const payload = {
      fornecedor: norm(fornecedorSelecionado),
      tipoPalete: norm(tipoPalete),
      quantidade: Math.trunc(Number(quantidade)),
      area: norm(area),
      operador: operador.trim(),
      observacao: observacao.trim() ? observacao.trim() : null,
    };

    if (
      !payload.fornecedor ||
      !payload.tipoPalete ||
      !payload.area ||
      !payload.operador ||
      !payload.quantidade ||
      payload.quantidade <= 0
    ) {
      alert("Preencha os campos obrigatórios ❌");
      return;
    }

    try {
      const res = await fetch("/api/entrada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Erro ao salvar no banco ❌");
        return;
      }

      alert("Entrada salva no banco ✅");
      setTipoPalete("");
      setQuantidade("");
      setArea("LOGISTICA REVERSA");
      setOperador("");
      setObservacao("");
    } catch (e) {
      console.error("ERRO salvarEntrada:", e);
      alert("Erro ao salvar no banco ❌");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-2xl bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-800">
            Registro de Entrada de Paletas
          </h1>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            ← Início
          </Link>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Cadastrar novo fornecedor (opcional)
          </label>

          <div className="mt-2 flex gap-2">
            <input
              value={novoFornecedor}
              onChange={(e) => setNovoFornecedor(e.target.value)}
              placeholder="Ex: Paletes Dama"
              className="flex-1 rounded-lg border p-3"
            />
            <button
              onClick={salvarFornecedor}
              className="px-4 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
              type="button"
            >
              Salvar
            </button>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Fornecedor
          </label>
          <select
            value={fornecedorSelecionado}
            onChange={(e) => setFornecedorSelecionado(e.target.value)}
            className="mt-2 w-full rounded-lg border p-3 bg-white"
          >
            {fornecedores.length === 0 && <option>Carregar...</option>}
            {fornecedores.map((f) => (
              <option key={f.id} value={f.nome}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Paleta
          </label>
          <select
            value={tipoPalete}
            onChange={(e) => setTipoPalete(e.target.value)}
            className="mt-2 w-full rounded-lg border p-3 bg-white"
          >
            <option value="">Selecione...</option>
            {tiposPadrao.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <input
            value={quantidade}
            onChange={(e) =>
              setQuantidade(e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            placeholder="Quantidade"
            className="w-full rounded-lg border p-3"
            min={1}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Área de Destino
          </label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="mt-2 w-full rounded-lg border p-3 bg-white"
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <input
            value={operador}
            onChange={(e) => setOperador(e.target.value)}
            placeholder="Operador"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div className="mt-4">
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Observações"
            className="w-full rounded-lg border p-3 min-h-[110px]"
          />
        </div>

        <button
          onClick={salvarEntrada}
          className="mt-6 w-full px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          type="button"
        >
          Salvar Entrada
        </button>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link
            href="/painel"
            className="inline-flex items-center justify-center px-4 py-3 rounded-lg border hover:bg-gray-50"
          >
            Ver Painel
          </Link>

          <Link
            href="/saldos"
            className="inline-flex items-center justify-center px-4 py-3 rounded-lg border hover:bg-gray-50"
          >
            Saldo por Área
          </Link>

          <Link
            href="/movimentacao"
            className="inline-flex items-center justify-center px-4 py-3 rounded-lg border hover:bg-gray-50"
          >
            Movimentação
          </Link>
        </div>
      </div>
    </main>
  );
}
