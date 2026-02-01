import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ano = Number(searchParams.get("ano"));

    if (!ano) {
      return NextResponse.json(
        { error: "Ano obrigatório" },
        { status: 400 }
      );
    }

    const resultado: { mes: number; saldo: number }[] = [];

    for (let mes = 1; mes <= 12; mes++) {
      const inicio = new Date(ano, mes - 1, 1);
      const fim = new Date(ano, mes, 1);

      const lista = await prisma.movimentacao.findMany({
        where: { createdAt: { gte: inicio, lt: fim } },
        select: { origem: true, destino: true, quantidade: true },
      });

      let saldo = 0;
      for (const m of lista) {
        if (m.destino) saldo += m.quantidade;
        if (m.origem) saldo -= m.quantidade;
      }

      resultado.push({ mes, saldo });
    }

    return NextResponse.json(resultado);
  } catch (e) {
    console.error("ERRO COMPARATIVO:", e);
    return NextResponse.json(
      { error: "Erro ao gerar comparativo mensal" },
      { status: 500 }
    );
  }
}
