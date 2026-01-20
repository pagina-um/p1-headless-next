import lazy from "next/dynamic";
import { Suspense } from "react";

const DateClient = lazy(() =>
  import("../blocks/DateClient").then((mod) => ({ default: mod.DateClient }))
);
export function AccountsCounterBlock() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center gap-4 p-4 bg-primary-dark text-white rounded-md shadow">
      <p className="font-serif text-xl sm:text-2xl font-bold leading-snug">
        <Suspense>
          <DateClient />
        </Suspense>
        <br />
        que a{" "}
        <span className="underline decoration-primary-light">
          Global Notícias
        </span>{" "}
        devia ter as suas contas entregues.
      </p>
      <a
        href="https://paginaum.pt/2025/08/29/global-noticias-a-casa-do-diario-de-noticias-arde-e-o-seu-director-quer-encontrar-rachas-no-pagina-um"
        className="underline"
      >
        <p className="text-base sm:text-lg leading-snug">
          Mas prefere perguntar pelas do{" "}
          <span className="font-bold">PÁGINA UM</span>.
        </p>
      </a>
    </div>
  );
}
