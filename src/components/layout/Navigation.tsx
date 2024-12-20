import React from 'react';

export function Navigation() {
  return (
    <nav className="mt-2 border-t border-gray-100">
      <ul className="flex items-center justify-center gap-6 py-2 text-sm">
        <li>
          <a href="#" className="text-gray-900 hover:text-primary transition-colors">
            Política
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-900 hover:text-primary transition-colors">
            Economia
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-900 hover:text-primary transition-colors">
            Sociedade
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-900 hover:text-primary transition-colors">
            Cultura
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-900 hover:text-primary transition-colors">
            Desporto
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-900 hover:text-primary transition-colors">
            Opinião
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-900 hover:text-primary transition-colors">
            Internacional
          </a>
        </li>
      </ul>
    </nav>
  );
}