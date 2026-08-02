import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  shape?: 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '',
  shape = 'rect' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={`
        bg-muted/20 
        ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
        ${className}
      `}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
