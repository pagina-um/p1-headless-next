import type { Metadata } from "next";
import Infografia from "../_components/Infografia";

export const metadata: Metadata = {
  title: "Património religioso: infografia | PÁGINA UM",
  robots: { index: false, follow: true },
  alternates: { canonical: "/infografias/patrimonio-religioso" },
};

export default function ReligiousHeritageEmbedPage() {
  return (
    <main className="mx-auto w-full max-w-7xl">
      <Infografia presentation="embed" />
    </main>
  );
}
