import Link from "next/link";
import { PreviewWrapper } from "./PreviewWrapper";

export default function PreviewPage() {
  return (
    <main className="max-w-7xl mx-auto pb-8">
      <div className="p-4 mb-4 bg-yellow-50 border-l-4 border-yellow-400">
        <p className="text-yellow-700">
          Esta é uma previsão do layout actual (não salvo). Para o publicar,
          volte ao{" "}
          <Link href="/admin" className="underline">
            painel de administração
          </Link>{" "}
          e clique "Guardar Layout".
        </p>
      </div>
      <PreviewWrapper />
    </main>
  );
}
