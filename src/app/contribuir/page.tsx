import { Suspense } from "react";
import { DonationForm } from "@/components/donation/DonationForm";
import { PostFooter } from "@/components/post/PostFooter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribuir - Página UM",
  description:
    "Apoie o jornalismo independente com uma contribuição única ou mensal.",
  openGraph: {
    title: "Contribuir - Página UM",
    description:
      "Apoie o jornalismo independente com uma contribuição única ou mensal.",
  },
};

export default function ContribuirPage() {
  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-6 text-gray-900">
            Apoie o Jornalismo Independente
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            O seu contributo é essencial para manter a qualidade e independência
            do nosso trabalho jornalístico. Escolha como nos quer apoiar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Contribuição Única
            </h2>
            <p className="text-gray-600 mb-6">
              Faça uma doação pontual para apoiar o nosso trabalho.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Sem compromisso mensal</li>
              <li>• Qualquer valor é bem-vindo</li>
              <li>• Pagamento seguro via Easypay</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md border-2 border-blue-200">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Subscrição Mensal
              </h2>
              <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Recomendado
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              Torne-se um apoiante regular com uma contribuição mensal.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Apoio contínuo ao jornalismo</li>
              <li>• Pode cancelar a qualquer momento</li>
              <li>• Ajuda-nos a planear melhor</li>
            </ul>
          </div>
        </div>

        <DonationForm />
      </main>

      <PostFooter />
    </>
  );
}
