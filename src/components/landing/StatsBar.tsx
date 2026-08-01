import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  FlaskConical,
  Cpu,
  Smartphone,
  Zap,
  ShieldCheck,
} from 'lucide-react';

const stats = [
  { icon: FlaskConical, label: '6 Biomarkers', color: 'text-primary' },
  { icon: Cpu, label: 'AI Powered', color: 'text-secondary' },
  { icon: Smartphone, label: 'Smartphone Compatible', color: 'text-accent' },
  { icon: Zap, label: 'Instant Results', color: 'text-warning' },
  { icon: ShieldCheck, label: 'Secure Reports', color: 'text-success' },
];

export const StatsBar: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="relative py-6 border-y border-border/50 bg-surface/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:gap-x-12 lg:gap-x-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-2.5 group"
            >
              <div className={`p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
