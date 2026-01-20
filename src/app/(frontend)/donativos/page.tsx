import { DonationForm } from "@/components/donation/DonationForm";
import { BankTransferModal } from "@/components/donation/BankTransferModal";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const PaymentMethods = dynamic(() =>
  import("@/components/donation/PaymentMethods").then(
    (mod) => mod.PaymentMethods
  )
);

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
      <main className=" mx-auto px-4 py-12 md:flex justify-center items-center gap-4">
        <div className="text-center mb-12 md:max-w-[400px] md:p-4">
          <h1 className="text-4xl font-serif font-bold mb-6 text-gray-900">
            Só depende dos leitores.
          </h1>
          <p className="text-xl text-gray-600 mb-8 md:text-center">
            Os custos desta plataforma são suportados exclusivamente por
            leitores que consideram o nosso trabalho importante e, por isso, o
            viabilizam. Um donativo único ou mensal,{" "}
            <span className="underline">seja qual for o valor</span>, faz
            diferença financeiramente e sinaliza-nos que vale a pena continuar a
            fazer jornalismo sem fretes.
          </p>

          <PaymentMethods />

          <div className="mt-6 text-sm text-gray-600">
            <span>Prefere fazer uma </span>
            <BankTransferModal />
            <span>?</span>
          </div>

          <span className="mt-8 inline-block text-xs italic text-gray-500">
            Se necessitar de factura, envie-nos email para facturas@paginaum.pt.
            Os donativos de empresas têm o limite de 500€ por semestre.
          </span>
        </div>

        <DonationForm />
      </main>
    </>
  );
}
