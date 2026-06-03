import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import Dashboard from "./Dashboard";

export const metadata: Metadata = {
  title: "Saúde em Números — Demo | Página UM",
  description:
    "Dashboard interativo de demonstração com dados fictícios de saúde: hospitalizações, altas e despesa.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SaudeTestePage() {
  return (
    <>
      <Header />
      <Dashboard />
    </>
  );
}
