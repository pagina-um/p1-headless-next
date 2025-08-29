"use client";

import { useEffect, useState } from "react";

const REFERENCE_DATE = new Date("2025-07-26T00:00:00+01:00");

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diffFromReference(): TimeParts {
  const now = new Date();
  let diffMs = now.getTime() - REFERENCE_DATE.getTime();
  if (diffMs < 0) diffMs = 0; // Clamp if we're before the reference date
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  diffMs -= days * 1000 * 60 * 60 * 24;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diffMs / (1000 * 60));
  diffMs -= minutes * 1000 * 60;
  const seconds = Math.floor(diffMs / 1000);
  return { days, hours, minutes, seconds };
}

export function AccountsCounterBlock() {
  const [time, setTime] = useState<TimeParts>(() => diffFromReference());

  useEffect(() => {
    const id = setInterval(() => {
      setTime(diffFromReference());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center gap-4 p-4 bg-primary-dark text-white rounded-md shadow">
      <p className="font-serif text-xl sm:text-2xl font-bold leading-snug">
        Há <span className=" font-mono">{time.days}</span> dias,{" "}
        <span className=" font-mono">{time.hours}</span> horas,{" "}
        <span className=" font-mono">{time.minutes}</span> minutos,{" "}
        <span className=" font-mono">{time.seconds}</span> segundos
        <br />
        que a{" "}
        <a href="https://paginaum.pt/2025/08/18/dona-do-diario-de-noticias-esta-em-falencia-tecnica-com-capitais-proprios-negativos-de-quase-20-milhoes">
          {" "}
          <span className="underline decoration-primary-light">
            Global Notícias
          </span>{" "}
        </a>
        devia ter entregue as suas contas.
      </p>
      <a
        href="https://paginaum.pt/2025/08/28/o-director-do-diario-de-noticias-cuja-empresa-em-falencia-tecnica-registou-custos-operacionais-de-473-milhoes-de-euros-quer-saber-como-o-pagina-um-gastou-os-seus-63-mil-euros-de-receitas"
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
