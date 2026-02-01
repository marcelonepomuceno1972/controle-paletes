import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/entrada
 * ENTRADA = MOVIMENTAÇÃO (origem null → destino área)
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const area = String(data?.area ?? "").trim().toUpperCase();
    const tipoPalete = String(data?.tipoPalete ?? "").trim().toUpperCase();
    const quantidade = Number(data?.quantidade);
    const operador = String(data?.operador ?? "").trim();
    const fornecedor = data?.fornecedor
      ? String(data.fornecedor).trim()
      : null;
    const observacao = data?.observacao
      ? String(data.observacao).trim()
      : null;

    if (!area || !tipoPalete || !Number.isFinite(quantidade) || !operador) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    if (quantidade <= 0) {
      return NextResponse.json(
        { error: "Quantidade deve ser maior que 0" },
        { status: 400 }
      );
    }

    const movimentacao = await prisma.movimentacao.create({
      data: {
        origem: null,
        destino: area,
        tipoPalete,
        quantidade: Math.trunc(quantidade),
        fornecedor,
        observacao: observacao
          ? `${observacao} | Operador: ${operador}`
          : `Entrada | Operador: ${operador}`,
      },
    });

    return NextResponse.json(movimentacao);
  } catch (error) {
    console.error("ERRO API ENTRADA:", error);
    return NextResponse.json(
      { error: "Erro ao salvar entrada" },
      { status: 500 }
    );
  }
}
