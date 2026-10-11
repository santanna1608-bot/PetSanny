import { useEffect } from 'react';

/** Animate visible content once; never hide content while waiting for JavaScript. */
export function MotionFoundation() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.getElementById('root');
    if (!root || !('IntersectionObserver' in window)) return;
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (!preference.matches) entry.target.classList.add('motion-enter');
      }
    }, { threshold: 0.08 });
    const selector = 'main h1, main h2, main article, main .grid > .rounded-2xl, main .grid > .rounded-3xl, [data-motion-card]';
    const scan = (node: Element) => {
      const targets = [...node.querySelectorAll(selector)];
      if (node.matches(selector)) targets.unshift(node);
      for (const target of targets) {
        if (seen.has(target)) continue;
        seen.add(target);
        const siblings = target.parentElement?.children;
        const index = siblings ? Array.from(siblings).indexOf(target) : 0;
        (target as HTMLElement).style.setProperty('--motion-delay', `${Math.min(index, 3) * 65}ms`);
        observer.observe(target);
      }
    };
    scan(root);
    const mutations = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node instanceof Element) scan(node);
      }
    });
    mutations.observe(root, { childList: true, subtree: true });
    const revealOnFocus = (event: FocusEvent) => {
      if (event.target instanceof Element) event.target.closest('.motion-enter')?.classList.remove('motion-enter');
    };
    root.addEventListener('focusin', revealOnFocus);
    return () => { observer.disconnect(); mutations.disconnect(); root.removeEventListener('focusin', revealOnFocus); };
  }, []);
  return null;
}
