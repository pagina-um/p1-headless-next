import { useMemo } from "react";

export function useNavigation() {
  const links = useMemo(
    () => [
      { href: "/tag/politica", label: "Política" },
      { href: "/tag/sociedade", label: "Sociedade" },
      { href: "/cat/imprensa", label: "Imprensa" },
      { href: "/tag/economia", label: "Economia" },
      { href: "/tag/opiniao", label: "Opinião" },
      { href: "/tag/cronica", label: "Crónica" },
      { href: "/tag/cultura", label: "Cultura" },
    ],
    []
  );

  return { links };
}
