import React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description = 'This feature is currently under development.',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-h2 text-foreground mb-2">{title}</h2>
      <p className="text-body text-muted max-w-md mb-6">{description}</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
        <span className="w-2 h-2 bg-accent rounded-full animate-pulse-soft" />
        Coming soon
      </div>
    </motion.div>
  );
};

export default PlaceholderPage;
