import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PostFooter } from "@/components/post/PostFooter";
import Infografia from "./_components/Infografia";

export const metadata: Metadata = {
  title: "Património religioso: mapa e cronologia | PÁGINA UM",
  description:
    "Explore os registos documentados de igrejas, património católico e cemitérios entre 2022 e 19 de Novembro de 2026, com mapa, tipologias, datas e fontes.",
  alternates: { canonical: "/infografias/patrimonio-religioso" },
};

export default function ReligiousHeritageInfographicPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
        <Infografia presentation="page" />
      </main>
      <PostFooter />
    </>
  );
}
