import React, { useRef } from 'react';

export default function InteractiveCard({ children, style, maxTilt = 4, ...props }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  const handleMouseMove = (e) => {
    if (typeof window === 'undefined' || !cardRef.current) return;

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width - 0.5) * 2; // -1 to 1
    const normY = (y / rect.height - 0.5) * 2; // -1 to 1

    const rotX = -normY * maxTilt;
    const rotY = normX * maxTilt;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.008, 1.008, 1.008)`;
    cardRef.current.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease-out';
    cardRef.current.style.boxShadow = '0 12px 28px -6px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(22, 163, 74, 0.08)';

    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(34, 197, 94, 0.07), transparent 80%)`;
      glowRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    cardRef.current.style.transition = 'transform 0.4s ease-out, box-shadow 0.4s ease-out';
    cardRef.current.style.boxShadow = 'none';

    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        borderRadius: 16,
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        ...style,
      }}
      {...props}
    >
      {/* Radial Cursor Spotlight Overlay */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 16,
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          zIndex: 2,
        }}
      />

      {children}
    </div>
  );
}
