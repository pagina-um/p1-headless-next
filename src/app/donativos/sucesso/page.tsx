import Link from "next/link";
import { CheckCircle, Heart, Home, Mail, Clock } from "lucide-react";
import { PostFooter } from "@/components/post/PostFooter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Obrigado pela sua contribuição - Página UM",
  description:
    "A sua contribuição foi processada com sucesso. Obrigado por apoiar o jornalismo independente.",
};

interface SuccessPageProps {
  searchParams: {
    amount?: string;
    type?: string;
    payment_id?: string;
    method?: string;
    entity?: string;
    reference?: string;
  };
}

export default function SucessoPage({ searchParams }: SuccessPageProps) {
  const amount = searchParams.amount;
  const type = searchParams.type;
  const paymentId = searchParams.payment_id;
  const isMultibanco = searchParams.method === "mb";
  const entity = searchParams.entity;
  const reference = searchParams.reference;

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {isMultibanco ? (
                <Clock className="w-24 h-24 text-amber-500" />
              ) : (
                <CheckCircle className="w-24 h-24 text-green-500" />
              )}
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-4xl font-serif font-bold mb-6 text-gray-900">
            {isMultibanco
              ? "Quase lá! Complete o pagamento"
              : "Obrigado pela sua contribuição!"}
          </h1>

          {isMultibanco ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 mb-6">
                Para completar a sua contribuição de{" "}
                {amount ? <strong>{amount}€</strong> : ""}, efetue o pagamento
                num multibanco ou através do homebanking com os seguintes dados:
              </p>

              <div className="bg-white rounded-lg p-4 mb-4 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Entidade:</span>
                  <code className="bg-gray-100 px-3 py-1 rounded text-lg font-mono font-bold">
                    {entity}
                  </code>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Referência:</span>
                  <code className="bg-gray-100 px-3 py-1 rounded text-lg font-mono font-bold">
                    {reference}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor:</span>
                  <code className="bg-gray-100 px-3 py-1 rounded text-lg font-mono font-bold">
                    {amount}€
                  </code>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                O pagamento pode demorar até 72 horas a ser processado. Guarde
                estes dados para referência.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 mb-4">
                {type === "subscription"
                  ? `A sua subscrição mensal de ${amount ? `${amount}€` : ""} foi criada com sucesso.`
                  : `A sua contribuição de ${amount ? `${amount}€` : ""} foi processada com sucesso.`}
              </p>

              {paymentId && (
                <p className="text-sm text-gray-600">
                  Referência do pagamento:{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {paymentId}
                  </code>
                </p>
              )}
            </div>
          )}

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Partilhe a nossa missão
              </h2>
              <p className="text-gray-600 mb-4">
                Ajude-nos a chegar a mais pessoas partilhando o nosso trabalho
                nas redes sociais.
              </p>
              <div className="flex justify-center space-x-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                  Facebook
                </button>
                <button className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors">
                  Twitter
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-bold mb-3 text-gray-900">
              Precisa de ajuda?
            </h3>
            <p className="text-gray-600 mb-3">
              {type === "subscription"
                ? "Para gerir a sua subscrição ou cancelar, entre em contacto connosco:"
                : "Se tiver questões sobre a sua contribuição, entre em contacto:"}
            </p>
            <div className="flex justify-center items-center space-x-2 text-blue-600">
              <Mail className="w-4 h-4" />
              <a href="mailto:geral@paginaum.pt" className="hover:underline">
                geral@paginaum.pt
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao início
            </Link>
            <Link
              href="/donativos"
              className="inline-flex items-center justify-center bg-gray-200 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors"
            >
              <Heart className="w-4 h-4 mr-2" />
              Contribuir novamente
            </Link>
          </div>
        </div>
      </main>

      <PostFooter />
    </>
  );
}
