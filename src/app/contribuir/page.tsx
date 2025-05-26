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
      <main className=" mx-auto px-4 py-12 md:flex justify-center items-center">
        <div className="text-center mb-12 md:max-w-[400px] md:p-4">
          <h1 className="text-4xl font-serif font-bold mb-6 text-gray-900">
            Só depende dos leitores.
          </h1>
          <p className="text-xl text-gray-600 mb-8 md:text-left">
            Os custos desta plataforma são suportados exclusivamente por
            leitores que consideram o nosso trabalho importante e, por isso, o
            viabilizam. Um donativo único ou mensal,{" "}
            <span className="underline">seja qual for o valor</span>, faz
            diferença financeiramente e sinaliza-nos que vale a pena continuar a
            fazer jornalismo sem fretes.
          </p>
        </div>

        <DonationForm />
      </main>

      <PostFooter />
    </>
  );
}
