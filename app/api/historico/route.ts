import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/historico?area=&tipoPalete=&dataIni=&dataFim=
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const area = searchParams.get("area");
    const tipoPalete = searchParams.get("tipoPalete");
    const dataIni = searchParams.get("dataIni");
    const dataFim = searchParams.get("dataFim");

    const where: any = {};

    if (tipoPalete) {
      where.tipoPalete = tipoPalete.toUpperCase();
    }

    if (area) {
      where.OR = [
        { origem: area.toUpperCase() },
        { destino: area.toUpperCase() },
      ];
    }

    if (dataIni || dataFim) {
      where.createdAt = {};
      if (dataIni) where.createdAt.gte = new Date(dataIni);
      if (dataFim) where.createdAt.lte = new Date(dataFim);
    }

    const lista = await prisma.movimentacao.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        origem: true,
        destino: true,
        tipoPalete: true,
        quantidade: true,
        fornecedor: true,
        observacao: true,
      },
    });

    return NextResponse.json(lista);
  } catch (error) {
    console.error("ERRO API HISTORICO:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}
