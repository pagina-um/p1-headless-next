import { useMemo } from "react";

export function useNavigation() {
  const links = useMemo(
    () => [
      { href: "/cat/politica", label: "Política" },
      { href: "/cat/sociedade", label: "Sociedade" },
      { href: "/cat/saude", label: "Saúde" },
      { href: "/cat/economia", label: "Economia" },
      { href: "/cat/imprensa", label: "Imprensa" },
      { href: "/cat/opiniao", label: "Opinião" },
      { href: "/cat/entrevistas", label: "Entrevistas" },
      { href: "/cat/cronica", label: "Crónica" },
      { href: "/cat/cultura", label: "Cultura" },
    ],
    []
  );

  return { links };
}
