import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { calcularSaldo } from "@/app/lib/calcularSaldo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Áreas fixas do CD
const AREAS_CD = [
  "LOGISTICA REVERSA",
  "PRODUÇÃO",
  "FLV",
  "MERCEARIA",
  "FRIGORIFICO",
  "FRIGO HORTOLÂNDIA",
  "RECEBIMENTO",
];

// Tipos de palete
const TIPOS_PALETE = ["PBR", "CHEP", "DESCARTÁVEL", "GAIOLA"];

/**
 * GET /api/saldos
 * Fonte ÚNICA de verdade do painel
 */
export async function GET() {
  try {
    // 1️⃣ Busca TODAS as movimentações (uma única vez)
    const movimentacoes = await prisma.movimentacao.findMany({
      select: {
        origem: true,
        destino: true,
        tipoPalete: true,
        quantidade: true,
      },
    });

    // 2️⃣ Monta estrutura de saldo por área
    const resultado = AREAS_CD.map((area) => {
      const saldosPorTipo: Record<string, number> = {};

      for (const tipo of TIPOS_PALETE) {
        saldosPorTipo[tipo] = calcularSaldo(
          movimentacoes,
          area,
          tipo
        );
      }

      return {
        area,
        saldos: saldosPorTipo,
      };
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("ERRO API SALDOS:", error);
    return NextResponse.json(
      { error: "Erro ao calcular saldos" },
      { status: 500 }
    );
  }
}


