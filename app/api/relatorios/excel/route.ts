import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET(req: Request) {
  try {
    // =========================
    // 📌 Parâmetros (com fallback)
    // =========================
    const { searchParams } = new URL(req.url);

    const mes =
      searchParams.get("mes") ??
      String(new Date().getMonth() + 1).padStart(2, "0");

    const ano =
      searchParams.get("ano") ??
      String(new Date().getFullYear());

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // =========================
    // 🔗 URLs das APIs existentes
    // =========================
    const resumoMensalUrl = `${baseUrl}/api/resumo-mensal?mes=${mes}&ano=${ano}`;
    const resumoPorTipoUrl = `${baseUrl}/api/resumo-mensal-por-tipo?mes=${mes}&ano=${ano}`;

    const [resumoMensalRes, resumoPorTipoRes] = await Promise.all([
      fetch(resumoMensalUrl, { cache: "no-store" }),
      fetch(resumoPorTipoUrl, { cache: "no-store" }),
    ]);

    if (!resumoMensalRes.ok || !resumoPorTipoRes.ok) {
      throw new Error(`Erro ao buscar dados | mes=${mes} ano=${ano}`);
    }

    // =========================
    // 📦 Normalização dos dados
    // =========================
    const resumoMensalRaw = await resumoMensalRes.json();
    const resumoPorTipoRaw = await resumoPorTipoRes.json();

    const resumoMensal = Array.isArray(resumoMensalRaw)
      ? resumoMensalRaw
      : resumoMensalRaw.data || resumoMensalRaw.dados || [];

    const resumoPorTipo = Array.isArray(resumoPorTipoRaw)
      ? resumoPorTipoRaw
      : resumoPorTipoRaw.data || resumoPorTipoRaw.dados || [];

    // ⚠️ IMPORTANTE:
    // NÃO quebramos mais se vier vazio.
    // Relatório deve ser gerado mesmo sem movimentação.

    // =========================
    // 📊 Criação do Workbook
    // =========================
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Controle Logístico de Paletes";
    workbook.created = new Date();

    // ==================================================
    // 🟦 ABA 1 — RESUMO MENSAL (POR ÁREA)
    // ==================================================
    const sheetResumo = workbook.addWorksheet("Resumo Mensal");

    sheetResumo.columns = [
      { header: "Mês/Ano", key: "periodo", width: 15 },
      { header: "Área", key: "area", width: 30 },
      { header: "Entradas", key: "entradas", width: 15 },
      { header: "Saídas", key: "saidas", width: 15 },
      { header: "Saldo Final", key: "saldo", width: 18 },
    ];

    resumoMensal.forEach((item: any) => {
      sheetResumo.addRow({
        periodo: `${mes}/${ano}`,
        area: item.area ?? "",
        entradas: item.entradas ?? 0,
        saidas: item.saidas ?? 0,
        saldo: item.saldo ?? 0,
      });
    });

    sheetResumo.getRow(1).font = { bold: true };

    // ==================================================
    // 🟩 ABA 2 — RESUMO POR TIPO DE PALETE
    // ==================================================
    const sheetTipo = workbook.addWorksheet("Resumo por Tipo");

    sheetTipo.columns = [
      { header: "Mês/Ano", key: "periodo", width: 15 },
      { header: "Tipo de Palete", key: "tipo", width: 25 },
      { header: "Área", key: "area", width: 30 },
      { header: "Quantidade", key: "quantidade", width: 18 },
    ];

    resumoPorTipo.forEach((item: any) => {
      sheetTipo.addRow({
        periodo: `${mes}/${ano}`,
        tipo: item.tipoPalete ?? "",
        area: item.area ?? "",
        quantidade: item.quantidade ?? 0,
      });
    });

    sheetTipo.getRow(1).font = { bold: true };

    // ==================================================
    // 🚦 ABA 3 — FAROL LOGÍSTICA REVERSA
    // ==================================================
    const sheetFarol = workbook.addWorksheet("Farol Reversa");

    sheetFarol.columns = [
      { header: "Área", key: "area", width: 30 },
      { header: "Saldo", key: "saldo", width: 15 },
      { header: "Status", key: "status", width: 20 },
    ];

    const reversa = resumoMensal.filter(
      (item: any) =>
        typeof item.area === "string" &&
        item.area.toLowerCase().includes("reversa")
    );

    reversa.forEach((item: any) => {
      let status = "Saudável";

      if (item.saldo <= 600) status = "Crítico";
      else if (item.saldo <= 1199) status = "Atenção";

      const row = sheetFarol.addRow({
        area: item.area,
        saldo: item.saldo,
        status,
      });

      const color =
        status === "Crítico"
          ? "FFFF4D4D"
          : status === "Atenção"
          ? "FFFFC107"
          : "FF4CAF50";

      row.getCell("status").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: color },
      };
    });

    sheetFarol.getRow(1).font = { bold: true };

    // =========================
    // 📦 Retorno do arquivo
    // =========================
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          `attachment; filename="relatorio-paletes-${mes}-${ano}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("ERRO EXPORTAÇÃO EXCEL:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório Excel" },
      { status: 500 }
    );
  }
}