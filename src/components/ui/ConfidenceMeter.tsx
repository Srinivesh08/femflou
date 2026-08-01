import React from 'react';
import { motion } from 'framer-motion';

interface ConfidenceMeterProps {
  value: number; // 0–100
  size?: number; // pixel diameter
  strokeWidth?: number;
  label?: string;
  color?: string;
  className?: string;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  label = 'Confidence',
  color,
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  // Auto color based on value
  const resolvedColor =
    color ||
    (clampedValue >= 75
      ? '#22C55E'
      : clampedValue >= 50
      ? '#F59E0B'
      : clampedValue >= 25
      ? '#F97316'
      : '#EF4444');

  return (
    <div
      className={`inline-flex flex-col items-center gap-2 ${className}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Animated fill arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-h3 font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {Math.round(clampedValue)}%
          </motion.span>
        </div>
      </div>
      {label && (
        <span className="text-caption text-muted font-medium">{label}</span>
      )}
    </div>
  );
};

export default ConfidenceMeter;
