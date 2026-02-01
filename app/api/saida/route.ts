import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/saida
 * Registra uma saída de paletes
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fornecedor = String(body?.fornecedor ?? "").trim();
    const tipoPalete = String(body?.tipoPalete ?? "").trim();
    const quantidade = Number(body?.quantidade);
    const area = String(body?.area ?? "").trim();
    const operador = String(body?.operador ?? "").trim();
    const observacao = body?.observacao
      ? String(body.observacao).trim()
      : null;

    if (
      !fornecedor ||
      !tipoPalete ||
      !area ||
      !operador ||
      !quantidade ||
      quantidade <= 0
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes ou inválidos" },
        { status: 400 }
      );
    }

    /**
     * 1️⃣ Registra a saída como MOVIMENTAÇÃO
     * Origem = área
     * Destino = fornecedor / área destino
     */
    const movimentacao = await prisma.movimentacao.create({
      data: {
        origem: area,
        destino: fornecedor,
        tipoPalete,
        quantidade: Math.trunc(quantidade),
        fornecedor,
        observacao,
      },
    });

    return NextResponse.json(movimentacao);
  } catch (error) {
    console.error("ERRO API SAIDA:", error);
    return NextResponse.json(
      { error: "Erro ao registrar saída" },
      { status: 500 }
    );
  }
}
