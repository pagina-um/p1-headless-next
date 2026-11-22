"use client";

import { createContext, useContext } from "react";
import type { HistoriaMeta } from "@/historias/meta";

/**
 * Stories written in the repository, as plain data, for the admin grid: the
 * picker lists them and story blocks that point at one render from here
 * instead of querying WordPress. Provided by AdminPanel from the server page.
 */
const HistoriasContext = createContext<HistoriaMeta[]>([]);

export const HistoriasProvider = HistoriasContext.Provider;

export function useHistorias(): HistoriaMeta[] {
  return useContext(HistoriasContext);
}
