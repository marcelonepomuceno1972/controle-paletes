type Movimentacao = {
  origem: string | null;
  destino: string | null;
  tipoPalete: string;
  quantidade: number;
};

function norm(s: string | null) {
  return String(s ?? "").trim().toLowerCase();
}

/**
 * REGRA ÚNICA E DEFINITIVA DE SALDO
 */
export function calcularSaldo(
  movimentacoes: Movimentacao[],
  area: string,
  tipoPalete: string
) {
  const areaNorm = norm(area);
  const tipoNorm = norm(tipoPalete);

  return movimentacoes.reduce((saldo, m) => {
    if (norm(m.tipoPalete) !== tipoNorm) return saldo;

    // ✅ ENTRADA: origem null → soma no destino
    if (!m.origem && norm(m.destino) === areaNorm) {
      saldo += m.quantidade;
      return saldo;
    }

    // ➕ movimentação que chega
    if (norm(m.destino) === areaNorm) {
      saldo += m.quantidade;
    }

    // ➖ movimentação que sai
    if (norm(m.origem) === areaNorm) {
      saldo -= m.quantidade;
    }

    return saldo;
  }, 0);
}
