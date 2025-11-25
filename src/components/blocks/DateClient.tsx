"use client";

import { useState, useEffect } from "react";
const REFERENCE_DATE = new Date("2025-07-26T00:00:00+01:00");

export const DateClient = () => {
  interface TimeParts {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }
  const [time, setTime] = useState<TimeParts>(() => diffFromReference());

  useEffect(() => {
    const id = setInterval(() => {
      setTime(diffFromReference());
    }, 1000);
    return () => clearInterval(id);
  }, []);

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
  return (
    <>
      Há <span className=" font-mono">{time.days}</span> dias,{" "}
      <span className=" font-mono">{time.hours}</span> horas,{" "}
      <span className=" font-mono">{time.minutes}</span> minutos,{" "}
      <span className=" font-mono">{time.seconds}</span> segundos
    </>
  );
};
