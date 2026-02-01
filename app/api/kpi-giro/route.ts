import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ano = Number(searchParams.get("ano"));
    const mes = Number(searchParams.get("mes"));

    if (!ano || !mes) {
      return NextResponse.json(
        { error: "Ano e mês obrigatórios" },
        { status: 400 }
      );
    }

    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 1);

    const lista = await prisma.movimentacao.findMany({
      where: { createdAt: { gte: inicio, lt: fim } },
      select: { origem: true, destino: true, quantidade: true },
    });

    let entradas = 0;
    let saidas = 0;

    for (const m of lista) {
      if (m.destino) entradas += m.quantidade;
      if (m.origem) saidas += m.quantidade;
    }

    const estoqueMedio = Math.max((entradas - saidas + entradas) / 2, 1);
    const giro = Number((saidas / estoqueMedio).toFixed(2));

    return NextResponse.json({
      entradas,
      saidas,
      estoqueMedio: Math.round(estoqueMedio),
      giro,
    });
  } catch (e) {
    console.error("ERRO KPI GIRO:", e);
    return NextResponse.json(
      { error: "Erro ao calcular KPI de giro" },
      { status: 500 }
    );
  }
}
