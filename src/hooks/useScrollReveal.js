import { useEffect } from 'react';

export const useScrollReveal = () => {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    // Inject delay styles
    const extraStyle = document.createElement('style');
    extraStyle.textContent = '.js-rd1{transition-delay:.07s}.js-rd2{transition-delay:.14s}.js-rd3{transition-delay:.21s}.js-rd4{transition-delay:.28s}';
    document.head.appendChild(extraStyle);

    els.forEach(el => {
      ['reveal-d1', 'reveal-d2', 'reveal-d3', 'reveal-d4'].forEach((d, i) => {
        if (el.classList.contains(d)) el.classList.add('js-rd' + (i + 1));
      });
      el.classList.add('js-reveal');
    });

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    const timeoutId = setTimeout(() => {
      els.forEach(el => obs.observe(el));
    }, 120);

    return () => {
      clearTimeout(timeoutId);
      els.forEach(el => obs.unobserve(el));
      obs.disconnect();
      if (extraStyle.parentNode) {
        extraStyle.parentNode.removeChild(extraStyle);
      }
    };
  }, []);
};
