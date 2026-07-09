import { useEffect } from 'react';

export const useCustomCursor = () => {
  useEffect(() => {
    // Only run on fine pointer devices (desktop/mouse)
    if (!window.matchMedia('(pointer:fine)').matches) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const cRing = document.getElementById('cRing');
    
    if (!dot || !ring || !cRing) return;

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    const handleMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    let animationFrameId;

    const tick = () => {
      // Dot: Instant positioning
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      
      // Ring: Interpolated / eased positioning (lerp)
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;

      animationFrameId = requestAnimationFrame(tick);
    };

    const handleMouseEnter = () => cRing.classList.add('expand');
    const handleMouseLeave = () => cRing.classList.remove('expand');

    // Add listeners to interactive elements
    const interactables = document.querySelectorAll('a, button');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(tick);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);
};
