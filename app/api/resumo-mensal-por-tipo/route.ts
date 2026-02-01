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
      select: {
        tipoPalete: true,
        origem: true,
        destino: true,
        quantidade: true,
      },
    });

    const resumo: Record<string, { entradas: number; saidas: number; saldo: number }> = {};

    for (const m of lista) {
      resumo[m.tipoPalete] ??= { entradas: 0, saidas: 0, saldo: 0 };
      if (m.destino) {
        resumo[m.tipoPalete].entradas += m.quantidade;
        resumo[m.tipoPalete].saldo += m.quantidade;
      }
      if (m.origem) {
        resumo[m.tipoPalete].saidas += m.quantidade;
        resumo[m.tipoPalete].saldo -= m.quantidade;
      }
    }

    return NextResponse.json(resumo);
  } catch (e) {
    console.error("ERRO RESUMO POR TIPO:", e);
    return NextResponse.json(
      { error: "Erro ao gerar resumo por tipo" },
      { status: 500 }
    );
  }
}
