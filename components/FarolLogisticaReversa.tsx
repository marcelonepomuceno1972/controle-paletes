type FarolProps = {
  area: string
  saldo: number
}

export function FarolLogisticaReversa({ area, saldo }: FarolProps) {
  // Farol só existe para Logística Reversa
  if (area !== 'Logística Reversa') {
    return null
  }

  let cor = ''
  let texto = ''

  if (saldo <= 600) {
    cor = 'bg-red-600'
    texto = 'Crítico'
  } else if (saldo <= 1199) {
    cor = 'bg-yellow-400'
    texto = 'Atenção'
  } else {
    cor = 'bg-green-600'
    texto = 'Saudável'
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-4 w-4 rounded-full ${cor}`}
        title={`Status: ${texto} | Saldo: ${saldo} paletes`}
      />
      <span className="text-sm font-medium text-gray-700">
        {texto}
      </span>
    </div>
  )
}
