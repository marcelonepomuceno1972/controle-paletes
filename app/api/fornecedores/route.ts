import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normNome(nome: string) {
  return String(nome ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * GET /api/fornecedores
 */
export async function GET() {
  try {
    const lista = await prisma.fornecedor.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    });

    return NextResponse.json(lista);
  } catch (error) {
    console.error("ERRO API FORNECEDORES GET:", error);
    return NextResponse.json(
      { error: "Erro ao buscar fornecedores" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fornecedores
 * body: { nome }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nome = String(body?.nome ?? "").trim();

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const nomeNorm = normNome(nome);

    // se já existe, retorna o existente
    const existente = await prisma.fornecedor.findUnique({
      where: { nomeNorm },
      select: { id: true, nome: true },
    });

    if (existente) {
      return NextResponse.json(existente);
    }

    const criado = await prisma.fornecedor.create({
      data: { nome, nomeNorm },
      select: { id: true, nome: true },
    });

    return NextResponse.json(criado);
  } catch (error) {
    console.error("ERRO API FORNECEDORES POST:", error);
    return NextResponse.json(
      { error: "Erro ao salvar fornecedor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/fornecedores
 * body: { id, nome }  OU  { nomeAntigo, nomeNovo }
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const id = body?.id ? String(body.id) : null;
    const nomeNovo = String(body?.nome ?? body?.nomeNovo ?? "").trim();

    if (!nomeNovo) {
      return NextResponse.json(
        { error: "Nome novo é obrigatório" },
        { status: 400 }
      );
    }

    const nomeNovoNorm = normNome(nomeNovo);

    // não deixar duplicar
    const jaExiste = await prisma.fornecedor.findUnique({
      where: { nomeNorm: nomeNovoNorm },
      select: { id: true, nome: true },
    });

    // se já existe e não é o mesmo id, bloqueia
    if (jaExiste && (!id || jaExiste.id !== id)) {
      return NextResponse.json(
        { error: `Já existe fornecedor com esse nome: "${jaExiste.nome}"` },
        { status: 409 }
      );
    }

    // modo 1: por id
    if (id) {
      const atualizado = await prisma.fornecedor.update({
        where: { id },
        data: { nome: nomeNovo, nomeNorm: nomeNovoNorm },
        select: { id: true, nome: true },
      });

      return NextResponse.json(atualizado);
    }

    // modo 2: por nome antigo
    const nomeAntigo = String(body?.nomeAntigo ?? "").trim();
    if (!nomeAntigo) {
      return NextResponse.json(
        { error: "Informe id ou nomeAntigo" },
        { status: 400 }
      );
    }

    const nomeAntigoNorm = normNome(nomeAntigo);

    const existente = await prisma.fornecedor.findUnique({
      where: { nomeNorm: nomeAntigoNorm },
      select: { id: true },
    });

    if (!existente) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado" },
        { status: 404 }
      );
    }

    const atualizado = await prisma.fornecedor.update({
      where: { id: existente.id },
      data: { nome: nomeNovo, nomeNorm: nomeNovoNorm },
      select: { id: true, nome: true },
    });

    return NextResponse.json(atualizado);
  } catch (error) {
    console.error("ERRO API FORNECEDORES PUT:", error);
    return NextResponse.json(
      { error: "Erro ao editar fornecedor" },
      { status: 500 }
    );
  }
}
