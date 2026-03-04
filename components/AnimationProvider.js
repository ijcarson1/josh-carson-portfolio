"use client";

import { useEffect } from "react";

export default function AnimationProvider() {
  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Sidebar items - staggered fade in on load
    const sidebarItems = document.querySelectorAll(".animate-in");
    sidebarItems.forEach((el) => {
      const delay = parseFloat(getComputedStyle(el).getPropertyValue("--delay") || "0");
      setTimeout(() => {
        el.classList.add("visible");
      }, delay * 1000);
    });

    // Cards - scroll-triggered reveal
    const cards = document.querySelectorAll(".animate-in-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, 150);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
