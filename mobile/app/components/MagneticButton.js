import React, { useRef } from 'react';

export default function MagneticButton({ children, style, strength = 0.25, ...props }) {
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    if (typeof window === 'undefined' || !btnRef.current) return;

    // Check if touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    btnRef.current.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
    btnRef.current.style.transition = 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)';
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    btnRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
    btnRef.current.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  };

  return (
    <div
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'inline-block',
        width: '100%',
        willChange: 'transform',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
