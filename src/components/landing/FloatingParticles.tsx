import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: 'hexagon' | 'circle' | 'ring' | 'dot';
  opacity: number;
}

const HexagonSVG: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path
      d="M20 2L36.66 11V29L20 38L3.34 29V11L20 2Z"
      stroke="currentColor"
      strokeWidth="1.2"
      opacity={opacity}
      fill="none"
    />
  </svg>
);

const RingSVG: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1" opacity={opacity} />
    <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="0.8" opacity={opacity * 0.6} />
  </svg>
);

const MoleculeSVG: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <circle cx="30" cy="15" r="5" stroke="currentColor" strokeWidth="1" opacity={opacity} />
    <circle cx="15" cy="40" r="5" stroke="currentColor" strokeWidth="1" opacity={opacity} />
    <circle cx="45" cy="40" r="5" stroke="currentColor" strokeWidth="1" opacity={opacity} />
    <line x1="30" y1="20" x2="18" y2="36" stroke="currentColor" strokeWidth="0.8" opacity={opacity * 0.7} />
    <line x1="30" y1="20" x2="42" y2="36" stroke="currentColor" strokeWidth="0.8" opacity={opacity * 0.7} />
    <line x1="20" y1="40" x2="40" y2="40" stroke="currentColor" strokeWidth="0.8" opacity={opacity * 0.7} />
  </svg>
);

export const FloatingParticles: React.FC = () => {
  const particles: Particle[] = useMemo(() => {
    const items: Particle[] = [];
    const types: Particle['type'][] = ['hexagon', 'circle', 'ring', 'dot'];
    for (let i = 0; i < 18; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 20 + Math.random() * 30,
        delay: Math.random() * 4,
        duration: 15 + Math.random() * 20,
        type: types[i % types.length],
        opacity: 0.08 + Math.random() * 0.12,
      });
    }
    return items;
  }, []);

  const renderShape = (p: Particle) => {
    switch (p.type) {
      case 'hexagon':
        return <HexagonSVG size={p.size} opacity={p.opacity} />;
      case 'ring':
        return <RingSVG size={p.size} opacity={p.opacity} />;
      case 'dot':
        return <MoleculeSVG size={p.size * 1.4} opacity={p.opacity} />;
      case 'circle':
      default:
        return (
          <div
            className="rounded-full border border-current"
            style={{
              width: p.size,
              height: p.size,
              opacity: p.opacity,
            }}
          />
        );
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute text-primary/60"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            x: [0, 30 * (p.id % 2 === 0 ? 1 : -1), -20 * (p.id % 3 === 0 ? 1 : -1), 0],
            y: [0, -25 * (p.id % 2 === 0 ? -1 : 1), 15 * (p.id % 3 === 0 ? 1 : -1), 0],
            rotate: [0, 60, -30, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {renderShape(p)}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingParticles;
