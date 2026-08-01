import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Droplets,
  Eye,
  FlaskRound,
  ArrowRight,
} from 'lucide-react';

const techCards = [
  {
    icon: Droplets,
    title: 'Microfluidics',
    description:
      'Precision-engineered microfluidic channels guide urine through multiple reaction chambers, enabling simultaneous detection of 6 critical biomarkers from a single drop.',
    gradient: 'from-primary/10 to-accent/5',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    icon: Eye,
    title: 'Computer Vision & AI',
    description:
      'Advanced algorithms detect the cartridge in any lighting, correct perspective distortion, segment reaction chambers, and extract precise RGB values for quantitative analysis.',
    gradient: 'from-secondary/10 to-purple-500/5',
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/10',
  },
  {
    icon: FlaskRound,
    title: 'Calibration Science',
    description:
      'Built on the Beer-Lambert Law, our calibration pipeline maps fluorescence intensity to analyte concentration with laboratory-grade accuracy across diverse conditions.',
    gradient: 'from-accent/10 to-primary/5',
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
  },
];

export const TechnologyPreview: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-20 md:py-28 bg-surface" id="technology">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold uppercase tracking-wider mb-4">
            Our Technology
          </span>
          <h2 className="text-h1 text-foreground mb-4 text-balance">
            The Science Behind{' '}
            <span className="gradient-text">FEMFLOU</span>
          </h2>
          <p className="text-body-lg text-muted max-w-2xl mx-auto">
            Three converging disciplines — microfluidics, computer vision, and
            calibration science — working in harmony to deliver clinical-grade
            results from a smartphone.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {techCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className={`
                  group relative h-full p-8 rounded-3xl
                  bg-gradient-to-br ${card.gradient}
                  border border-border/40
                  hover:shadow-elevated hover:-translate-y-1
                  transition-all duration-400 ease-out
                `}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center mb-6 
                  group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-7 h-7 ${card.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-h3 text-foreground mb-3">{card.title}</h3>
                <p className="text-body-sm text-muted leading-relaxed mb-6">
                  {card.description}
                </p>

                {/* Link */}
                <Link
                  to="/technology"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-600 transition-colors group/link"
                >
                  Learn Technology
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologyPreview;
