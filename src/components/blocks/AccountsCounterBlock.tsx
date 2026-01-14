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
