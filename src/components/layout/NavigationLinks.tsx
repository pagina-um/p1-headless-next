import React from 'react';
import { NavigationItem } from './NavigationItem';
import { useNavigation } from '../../hooks/useNavigation';

interface NavigationLinksProps {
  orientation?: 'horizontal' | 'vertical';
  onItemClick?: () => void;
}

export function NavigationLinks({ orientation = 'horizontal', onItemClick }: NavigationLinksProps) {
  const { links } = useNavigation();

  return (
    <ul 
      className={`
        flex gap-6 text-sm font-light
        ${orientation === 'vertical' ? 'flex-col' : 'items-center'}
      `}
    >
      {links.map(link => (
        <NavigationItem
          key={link.label}
          {...link}
          orientation={orientation}
          onClick={onItemClick}
        />
      ))}
    </ul>
  );
}