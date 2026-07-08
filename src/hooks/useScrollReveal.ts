import { useEffect, useRef } from 'react';

/**
 * useScrollReveal
 * Hook que observa elementos via IntersectionObserver e adiciona
 * a classe "revealed" quando entram na viewport, ativando as
 * animações CSS definidas em index.css (.reveal-up, .reveal-left, etc.)
 *
 * @param threshold - Proporção visível antes de disparar (padrão: 0.15)
 * @param rootMargin - Margem ao redor do viewport (padrão: '0px 0px -40px 0px')
 */
export function useScrollReveal(
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px'
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respeita a preferência de redução de movimento
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReduced) {
      // Revela todos imediatamente sem animação
      const container = containerRef.current;
      if (!container) return;
      container
        .querySelectorAll<HTMLElement>('.reveal-up, .reveal-left, .reveal-right, .reveal-scale')
        .forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Desconecta após revelar (one-shot) para performance
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>(
      '.reveal-up, .reveal-left, .reveal-right, .reveal-scale'
    );
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return containerRef;
}
