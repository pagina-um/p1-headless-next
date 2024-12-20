'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Settings, ArrowLeft, Menu } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { useScrollHeader } from '@/hooks/useScrollHeader';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isScrolled } = useScrollHeader();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname === '/admin';

  const handleNavigate = () => {
    router.push(isAdmin ? '/' : '/admin');
  };

  return (
    <>
      <header 
        className={`
          bg-white border-b border-gray-200 
          fixed top-0 left-0 right-0 z-40
          transition-all duration-300
          ${isScrolled ? 'shadow-md' : ''}
        `}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div 
            className={`
              flex items-center justify-between gap-8
              transition-all duration-300
              ${isScrolled ? 'h-16' : 'h-24'}
            `}
          >
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 flex flex-col items-center md:items-start">
              <div 
                className={`
                  transition-all duration-300
                  ${isScrolled ? 'w-[160px] md:w-[200px]' : 'w-[200px] md:w-[280px]'}
                `}
              >
                <Logo />
              </div>
              {!isAdmin && (
                <p 
                  className={`
                    hidden md:block text-sm text-gray-500 font-serif italic mt-1
                    transition-all duration-300
                    ${isScrolled ? 'opacity-0 h-0 mt-0' : 'opacity-100'}
                  `}
                >
                  O jornalismo independente depende dos leitores
                </p>
              )}
            </div>

            {!isAdmin && (
              <div className="hidden md:flex flex-1 items-center justify-end">
                <DesktopNav />
              </div>
            )}

            <button
              onClick={handleNavigate}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2"
              title={isAdmin ? 'Back to Site' : 'Admin Panel'}
            >
              {isAdmin ? (
                <>
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600 hidden sm:inline">
                    Back to Site
                  </span>
                </>
              ) : (
                <Settings className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className={`h-24 transition-all duration-300 ${isScrolled ? 'h-16' : 'h-24'}`} />

      <MobileNav 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}