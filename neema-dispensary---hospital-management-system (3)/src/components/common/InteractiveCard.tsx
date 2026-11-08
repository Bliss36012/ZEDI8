import React, { useState, useRef } from 'react';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glowColor?: string;
  tiltIntensity?: number;
  highlightBorder?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  onClick,
  glowColor = 'rgba(20, 184, 166, 0.25)', // teal glow default
  tiltIntensity = 10,
  highlightBorder = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [transformStyle, setTransformStyle] = useState<string>('');
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    setCoords({ x: xPercent, y: yPercent });

    // 3D perspective tilt calculation
    const rotateY = ((x / rect.width) - 0.5) * tiltIntensity;
    const rotateX = (0.5 - (y / rect.height)) * tiltIntensity;
    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)');
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
      }}
      className={`relative group rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border ${
        highlightBorder
          ? 'border-white/40 dark:border-white/10 hover:border-teal-500/50'
          : 'border-neutral-200/80 dark:border-neutral-800/80'
      } shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Radiant Spotlight Cursor Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"
        style={{
          background: `radial-gradient(400px circle at ${coords.x}% ${coords.y}%, ${glowColor}, transparent 65%)`,
        }}
      />

      {/* Subtle Specular Top Sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
