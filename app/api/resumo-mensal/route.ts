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
      where: {
        createdAt: { gte: inicio, lt: fim },
      },
      select: {
        origem: true,
        destino: true,
        quantidade: true,
      },
    });

    const resumo: Record<
      string,
      { entradas: number; saidas: number; saldo: number }
    > = {};

    for (const m of lista) {
      if (m.destino) {
        resumo[m.destino] ??= { entradas: 0, saidas: 0, saldo: 0 };
        resumo[m.destino].entradas += m.quantidade;
        resumo[m.destino].saldo += m.quantidade;
      }

      if (m.origem) {
        resumo[m.origem] ??= { entradas: 0, saidas: 0, saldo: 0 };
        resumo[m.origem].saidas += m.quantidade;
        resumo[m.origem].saldo -= m.quantidade;
      }
    }

    return NextResponse.json(resumo);
  } catch (error) {
    console.error("ERRO API RESUMO MENSAL:", error);
    return NextResponse.json(
      { error: "Erro ao gerar resumo mensal" },
      { status: 500 }
    );
  }
}
