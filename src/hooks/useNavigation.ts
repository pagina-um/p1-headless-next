import { useMemo } from 'react';

export function useNavigation() {
  const links = useMemo(() => [
    { href: '#', label: 'Política' },
    { href: '#', label: 'Economia' },
    { href: '#', label: 'Sociedade' },
    { href: '#', label: 'Cultura' },
    { href: '#', label: 'Desporto' },
    { href: '#', label: 'Opinião' },
    { href: '#', label: 'Internacional' },
  ], []);

  return { links };
}