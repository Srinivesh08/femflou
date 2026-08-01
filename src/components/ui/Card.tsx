import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glass = false,
  hover = false,
  padding = 'md',
  onClick,
}) => {
  const baseClasses = `
    rounded-2xl transition-all duration-300 ease-out
    ${paddingClasses[padding]}
    ${glass
      ? 'glass'
      : 'bg-surface border border-border/60 shadow-soft'
    }
    ${hover ? 'hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={baseClasses}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;
