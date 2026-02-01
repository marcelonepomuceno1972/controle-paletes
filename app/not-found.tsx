import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="text-center bg-white p-10 rounded-xl shadow max-w-md">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>

        <p className="mt-4 text-gray-600">
          Página não encontrada.
        </p>

        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Voltar ao Início
        </Link>
      </div>
    </main>
  );
}
