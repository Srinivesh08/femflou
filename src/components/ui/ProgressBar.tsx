import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0 – 100
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'critical' | 'accent';
  className?: string;
}

const colorClasses: Record<string, string> = {
  primary: 'from-primary to-accent',
  success: 'from-green-400 to-success',
  warning: 'from-amber-300 to-warning',
  critical: 'from-red-400 to-critical',
  accent: 'from-accent to-secondary',
};

const trackSizes: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-body-sm text-muted font-medium">{label}</span>
          )}
          {showValue && (
            <span className="text-body-sm text-foreground font-semibold">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full bg-gray-100 overflow-hidden ${trackSizes[size]}`}
      >
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
