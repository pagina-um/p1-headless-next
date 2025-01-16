"use client";

import { useState, useEffect } from "react";

export function useScrollHeader(threshold = 50) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollState = () => {
      const scrollY = window.scrollY;

      // Only update state if it's actually changing
      if (scrollY > threshold && !isScrolled) {
        setIsScrolled(true);
      } else if (scrollY <= threshold && isScrolled) {
        setIsScrolled(false);
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollState();
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isScrolled, threshold]);

  return { isScrolled };
}
