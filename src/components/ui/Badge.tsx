import React from 'react';

type BadgeStatus = 'normal' | 'mild' | 'high' | 'critical' | 'default';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  status?: BadgeStatus;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const statusClasses: Record<BadgeStatus, string> = {
  normal: 'bg-success-50 text-success-600 border-success/20',
  mild: 'bg-warning-50 text-warning-600 border-warning/20',
  high: 'bg-orange-50 text-orange-600 border-orange-200',
  critical: 'bg-critical-50 text-critical-600 border-critical/20',
  default: 'bg-gray-100 text-muted border-border',
};

const dotColors: Record<BadgeStatus, string> = {
  normal: 'bg-success',
  mild: 'bg-warning',
  high: 'bg-orange-500',
  critical: 'bg-critical',
  default: 'bg-muted',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-[0.6875rem] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
  status = 'default',
  size = 'md',
  dot = false,
  children,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        transition-colors duration-200
        ${statusClasses[status]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[status]} animate-pulse-soft`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
