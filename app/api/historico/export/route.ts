import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildWhere(params: URLSearchParams) {
  const area = params.get("area");
  const tipoPalete = params.get("tipoPalete");
  const dataIni = params.get("dataIni");
  const dataFim = params.get("dataFim");

  const where: any = {};

  if (tipoPalete) where.tipoPalete = tipoPalete.toUpperCase();

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

  return where;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const formato = searchParams.get("formato") ?? "csv";

    const lista = await prisma.movimentacao.findMany({
      where: buildWhere(searchParams),
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        origem: true,
        destino: true,
        tipoPalete: true,
        quantidade: true,
        fornecedor: true,
        observacao: true,
      },
    });

    const dados = lista.map((m) => ({
      Data: new Date(m.createdAt).toLocaleString("pt-BR"),
      Origem: m.origem ?? "ENTRADA",
      Destino: m.destino,
      Tipo: m.tipoPalete,
      Quantidade: m.quantidade,
      Fornecedor: m.fornecedor ?? "",
      Observacao: m.observacao ?? "",
    }));

    // 📄 CSV
    if (formato === "csv") {
      const header = Object.keys(dados[0] ?? {}).join(";");
      const rows = dados.map((d) =>
        Object.values(d)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(";")
      );
      const csv = [header, ...rows].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=historico.csv",
        },
      });
    }

    // 📊 EXCEL
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historico");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=historico.xlsx",
      },
    });
  } catch (error) {
    console.error("ERRO EXPORT HISTORICO:", error);
    return NextResponse.json(
      { error: "Erro ao exportar histórico" },
      { status: 500 }
    );
  }
}
