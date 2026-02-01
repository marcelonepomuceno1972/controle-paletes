"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Loja = {
  id: number;
  nome: string;
};

export default function RetornoLojaPage() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaId, setLojaId] = useState("");
  const [tipoPalete, setTipoPalete] = useState("PBR");
  const [quantidade, setQuantidade] = useState(0);

  useEffect(() => {
    fetch("/api/lojas")
      .then((res) => res.json())
      .then(setLojas);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lojaId || quantidade <= 0) return;

    await fetch("/api/movimentacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origem: "LOJA",
        destino: "LOGISTICA REVERSA",
        lojaId: Number(lojaId),
        tipoPalete,
        quantidade,
      }),
    });

    setQuantidade(0);
    alert("Retorno registrado");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl bg-white rounded-xl shadow p-6">

        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
          ← Voltar ao início
        </Link>

        <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-4">
          Retorno de Loja
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Loja</label>
            <select
              className="w-full border rounded p-2"
              value={lojaId}
              onChange={(e) => setLojaId(e.target.value)}
              required
            >
              <option value="">Selecione a loja</option>
              {lojas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Tipo de Palete</label>
            <select
              className="w-full border rounded p-2"
              value={tipoPalete}
              onChange={(e) => setTipoPalete(e.target.value)}
            >
              <option value="PBR">PBR</option>
              <option value="CHEP">CHEP</option>
              <option value="DESCARTAVEL">DESCARTÁVEL</option>
              <option value="GAIOLA">GAIOLA</option>
            </select>
          </div>

          <div>
            <label>Quantidade</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded p-2"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold"
          >
            Registrar Retorno
          </button>
        </form>
      </div>
    </main>
  );
}
