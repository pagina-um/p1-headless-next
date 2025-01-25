"use client";

import React, { useEffect, useState } from 'react';
import { Handshake, Mail, X } from 'lucide-react';
import { Logo } from '../ui/Logo';
import Link from 'next/link';
import { 
  getCookie, 
  getArticleCount, 
  incrementArticleCount, 
  getLastModalShow, 
  setLastModalShow 
} from '@/utils/cookies';

const ARTICLES_THRESHOLD = 5;

export function ArticleSupportModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolledPastThreshold, setHasScrolledPastThreshold] = useState(false);

  useEffect(() => {
    const cookiesAccepted = getCookie('cookieConsent') === 'accepted';
    
    if (cookiesAccepted) {
      const articleCount = incrementArticleCount();
      const lastModalShow = getLastModalShow();
      const today = new Date().toISOString().split('T')[0];
      
      // Don't show if already shown today
      if (lastModalShow === today) {
        return;
      }

      // Don't show if haven't reached article threshold
      if (articleCount < ARTICLES_THRESHOLD) {
        return;
      }
    }

    // Add scroll listener
    const handleScrollCheck = () => {
      if (hasScrolledPastThreshold) return;

      const articleElement = document.querySelector('article');
      if (!articleElement) return;

      const articleHeight = articleElement.scrollHeight;
      const scrollPosition = window.scrollY + window.innerHeight;
      const oneThirdHeight = articleHeight / 3;

      if (scrollPosition > oneThirdHeight) {
        setHasScrolledPastThreshold(true);
        setIsVisible(true);
        
        // Only set cookie if consent was given
        if (getCookie('cookieConsent') === 'accepted') {
          setLastModalShow();
        }
      }
    };

    window.addEventListener('scroll', handleScrollCheck);
    return () => window.removeEventListener('scroll', handleScrollCheck);
  }, [hasScrolledPastThreshold]);

  const handleClose = () => {
    setIsVisible(false);
    
    // If cookies accepted, update last show time when manually closed
    if (getCookie('cookieConsent') === 'accepted') {
      setLastModalShow();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-2xl bg-slate-800 rounded-lg shadow-xl">
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {/* Logo and Tagline */}
          <div className="space-y-4 mb-8">
            <div className="w-48">
              <Logo white />
            </div>
            <p className="font-serif text-lg text-white">
              O jornalismo independente (só) depende dos leitores.
            </p>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-lg text-white">
              Não dependemos de grupos económicos nem do Estado. Não fazemos
              fretes. Fazemos jornalismo para os leitores,{" "}
              <strong>
                mas só sobreviveremos com o seu apoio financeiro.
              </strong>
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="https://lp.paginaum.pt/donativos/"
              className="group bg-primary hover:bg-primary-dark transition-all duration-300 rounded-lg p-4 text-center flex items-center justify-center space-x-3"
            >
              <Handshake className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 stroke-white" />
              <span className="text-xl font-bold text-white">Contribuir</span>
            </Link>
            <Link
              href="https://pagina-um.kit.com/53291313d7"
              className="group bg-primary hover:bg-primary-dark transition-all duration-300 rounded-lg p-4 text-center flex items-center justify-center space-x-3"
            >
              <Mail className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 stroke-white" />
              <span className="text-xl font-bold text-white">
                Subscrever a newsletter
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}