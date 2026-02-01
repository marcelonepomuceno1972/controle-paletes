import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { calcularSaldo } from "@/app/lib/calcularSaldo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/movimentacoes
 */
export async function GET() {
  try {
    const lista = await prisma.movimentacao.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(lista);
  } catch (error) {
    console.error("ERRO API MOVIMENTACOES GET:", error);
    return NextResponse.json(
      { error: "Erro ao buscar movimentações" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/movimentacoes
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const origem = String(body?.origem ?? "").trim().toUpperCase();
    const destino = String(body?.destino ?? "").trim().toUpperCase();
    const tipoPalete = String(body?.tipoPalete ?? "").trim().toUpperCase();
    const quantidade = Number(body?.quantidade);

    const fornecedor = body?.fornecedor
      ? String(body.fornecedor).trim()
      : null;

    const observacao = body?.observacao
      ? String(body.observacao).trim()
      : null;

    // 🔒 validações básicas
    if (!origem || !destino || !tipoPalete || !Number.isFinite(quantidade)) {
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

    if (origem === destino) {
      return NextResponse.json(
        { error: "Origem e destino não podem ser iguais" },
        { status: 400 }
      );
    }

    // 🔍 busca movimentações do tipo
    const movimentacoes = await prisma.movimentacao.findMany({
      where: { tipoPalete },
      select: {
        origem: true,
        destino: true,
        tipoPalete: true,
        quantidade: true,
      },
    });

    const saldoOrigem = calcularSaldo(
      movimentacoes,
      origem,
      tipoPalete
    );

    // 🚫 trava saldo negativo DEFINITIVAMENTE
    if (saldoOrigem - quantidade < 0) {
      return NextResponse.json(
        {
          error: `Saldo insuficiente na origem (${origem}). Saldo atual: ${saldoOrigem}`,
        },
        { status: 400 }
      );
    }

    // ✅ cria movimentação
    const mov = await prisma.movimentacao.create({
      data: {
        origem,
        destino,
        tipoPalete,
        quantidade: Math.trunc(quantidade),
        fornecedor,
        observacao,
      },
    });

    return NextResponse.json(mov);
  } catch (error) {
    console.error("ERRO API MOVIMENTACOES POST:", error);
    return NextResponse.json(
      { error: "Erro ao salvar movimentação" },
      { status: 500 }
    );
  }
}
