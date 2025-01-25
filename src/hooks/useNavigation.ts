import { useMemo } from "react";

export function useNavigation() {
  const links = useMemo(
    () => [
      { href: "/cat/politica", label: "Política" },
      { href: "/cat/sociedade", label: "Sociedade" },
      { href: "/cat/imprensa", label: "Imprensa" },
      { href: "/cat/economia", label: "Economia" },
      { href: "/cat/opiniao", label: "Opinião" },
      { href: "/cat/cronica", label: "Crónica" },
      { href: "/cat/cultura", label: "Cultura" },
    ],
    []
  );

  return { links };
}
