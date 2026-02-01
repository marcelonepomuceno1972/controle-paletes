import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10 text-center">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-paletes.png"
            alt="Controle de Paletes"
            width={160}
            height={160}
            priority
          />
        </div>

        <h1 className="text-4xl font-bold text-gray-900">
          Controle de Paletes
        </h1>

        <p className="mt-4 text-gray-600 text-lg">
          Sistema para gestão, rastreio e movimentação logística de paletes.
        </p>

        <div className="mt-10 space-y-4">
          <Link
            href="/entrada"
            className="block w-full rounded-xl bg-blue-600 text-white py-4 text-xl font-semibold hover:bg-blue-700"
          >
            Registrar Entrada
          </Link>

          <Link
            href="/saida"
            className="block w-full rounded-xl bg-green-600 text-white py-4 text-xl font-semibold hover:bg-green-700"
          >
            Registrar Saída
          </Link>

          <Link
            href="/retorno-loja"
            className="block w-full rounded-xl bg-purple-600 text-white py-4 text-xl font-semibold hover:bg-purple-700"
          >
            🔁 Retorno de Loja
          </Link>

          <Link
            href="/painel"
            className="block w-full rounded-xl bg-gray-900 text-white py-4 text-xl font-semibold hover:bg-black"
          >
            Dashboard
          </Link>

          <Link
            href="/saldos"
            className="block w-full rounded-xl bg-white text-gray-900 py-4 text-xl font-semibold border hover:bg-gray-50"
          >
            Saldo por Área
          </Link>
        </div>
      </div>
    </main>
  );
}
