import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const lojas = await prisma.loja.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
      },
    });

    return NextResponse.json(lojas);
  } catch (error) {
    console.error("ERRO API LOJAS:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lojas" },
      { status: 500 }
    );
  }
}
