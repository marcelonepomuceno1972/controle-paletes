import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// FUNÇÃO PARA PADRONIZAR TEXTO
function padronizarNome(nome) {
  return nome
    .toLowerCase()
    .split(" ")
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

async function main() {
  await prisma.loja.deleteMany();

  await prisma.loja.createMany({
    data: [
      { digito: 1, nome: padronizarNome("Carolina") },
      { digito: 2, nome: padronizarNome("Ponte preta") },
      { digito: 3, nome: padronizarNome("Bonfim") },
      { digito: 5, nome: padronizarNome("Amoreiras") },
      { digito: 6, nome: padronizarNome("Americana 1") },
      { digito: 9, nome: padronizarNome("Tatuapé") },
      { digito: 10, nome: padronizarNome("Sorocaba 1") },
      { digito: 11, nome: padronizarNome("Butantã") },
      { digito: 12, nome: padronizarNome("Ibitirama") },
      { digito: 13, nome: padronizarNome("Moema") },
      { digito: 14, nome: padronizarNome("Penha") },
      { digito: 15, nome: padronizarNome("Santana Pujol") },
      { digito: 16, nome: padronizarNome("Taquaral") },
      { digito: 17, nome: padronizarNome("Termal") },
      { digito: 19, nome: padronizarNome("Morumbi") },
      { digito: 21, nome: padronizarNome("Centro") },
      { digito: 23, nome: padronizarNome("Cambuí") },
      { digito: 24, nome: padronizarNome("Santana Ataliba") },
      { digito: 25, nome: padronizarNome("Santana tolle") },
      { digito: 26, nome: padronizarNome("Sorocaba 2") },
      { digito: 29, nome: padronizarNome("Mooca") },
      { digito: 30, nome: padronizarNome("Piracicaba") },
      { digito: 31, nome: padronizarNome("Sousas") },
      { digito: 32, nome: padronizarNome("Vila mariana") },
      { digito: 33, nome: padronizarNome("Galleria") },
      { digito: 34, nome: padronizarNome("Anália franco") },
      { digito: 35, nome: padronizarNome("São josé") },
      { digito: 36, nome: padronizarNome("Angelica") },
      { digito: 37, nome: padronizarNome("Teodoro sampaio") },
      { digito: 38, nome: padronizarNome("Ribeirão preto") },
      { digito: 39, nome: padronizarNome("Interlargos") },
      { digito: 40, nome: padronizarNome("Market place") },
      { digito: 41, nome: padronizarNome("Leopoldina") },
      { digito: 42, nome: padronizarNome("Santo andré") },
      { digito: 43, nome: padronizarNome("Perdizes") },
      { digito: 55, nome: padronizarNome("Campo Belo") },
      { digito: 56, nome: padronizarNome("Vila Mascote") },
      { digito: 57, nome: padronizarNome("Jundiai farm") },
      { digito: 62, nome: padronizarNome("Shop piracicaba") },
      { digito: 63, nome: padronizarNome("Shop jundiai") },
      { digito: 64, nome: padronizarNome("Alphaville barueri") },
      { digito: 65, nome: padronizarNome("Ribeirao 2") },
      { digito: 67, nome: padronizarNome("São Bernardo") },
      { digito: 69, nome: padronizarNome("Alphaville") },
      { digito: 70, nome: padronizarNome("Frigorifico") },
      { digito: 71, nome: padronizarNome("Apucarana") },
      { digito: 72, nome: padronizarNome("Shop Tatuapé") },
      { digito: 73, nome: padronizarNome("Cambui 2") },
      { digito: 74, nome: padronizarNome("Itaim") },
      { digito: 75, nome: padronizarNome("Nova campinas") },
      { digito: 76, nome: padronizarNome("Santos") },
      { digito: 79, nome: padronizarNome("Sorocaba 3") },
      { digito: 80, nome: padronizarNome("Itu") },
      { digito: 81, nome: padronizarNome("Pamplona") },
      { digito: 84, nome: padronizarNome("Tatuapé 3") },
      { digito: 86, nome: padronizarNome("São Jose Do Rio Preto") },
      { digito: 87, nome: padronizarNome("Itatiba") },
      { digito: 88, nome: padronizarNome("Cotia") },
      { digito: 92, nome: padronizarNome("Restaurante") },
      { digito: 97, nome: padronizarNome("Cd Sumaré") },
      { digito: 99, nome: padronizarNome("Produção") },
      { digito: 100, nome: padronizarNome("Cd Brasília") },
      { digito: 104, nome: padronizarNome("Indaiatuba") },
      { digito: 107, nome: padronizarNome("Americana 2") },
      { digito: 108, nome: padronizarNome("Limeira") },
      { digito: 120, nome: padronizarNome("Ouro verde") },
      { digito: 121, nome: padronizarNome("Arborais") },
      { digito: 122, nome: padronizarNome("Bauru") },
      { digito: 123, nome: padronizarNome("Nova Cantareira") },
      { digito: 127, nome: padronizarNome("Franca") },
      { digito: 134, nome: padronizarNome("Damha") },
      { digito: 135, nome: padronizarNome("Vila Mariana 2") },
    ],
  });

  console.log("✔ Lojas importadas padronizadas");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
