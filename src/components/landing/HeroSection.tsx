import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui';
import FloatingParticles from './FloatingParticles';
import CartridgeIllustration from './CartridgeIllustration';

export const HeroSection: React.FC = () => {
  const scrollToTech = () => {
    document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden" id="hero">
      {/* ── Gradient background ── */}
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(15,118,110,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(6,182,212,0.06) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 50% 80%, rgba(37,99,235,0.04) 0%, transparent 50%)',
        }}
      />

      {/* ── Floating particles ── */}
      <FloatingParticles />

      {/* ── Grid pattern overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,118,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,118,110,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/10 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-sm font-medium text-primary">
                AI-Powered Maternal Health Screening
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="mb-2">
              <span className="block text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-extrabold leading-[0.9] tracking-[-0.04em] text-foreground">
                FEM
              </span>
              <span className="block text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-extrabold leading-[0.9] tracking-[-0.04em] gradient-text">
                FLOU
              </span>
            </h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-xl sm:text-2xl font-semibold text-foreground/80 mt-4 mb-6 max-w-lg"
            >
              Empowering Every Pregnancy Through Intelligent Screening.
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-body-lg text-muted leading-relaxed max-w-xl mb-10"
            >
              FEMFLOU combines microfluidics, fluorescence sensing, computer vision,
              and AI to screen maternal health from a single urine sample via smartphone —
              delivering lab-grade insights in minutes, anywhere.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
            >
              <Link to="/login">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Analysis
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="secondary" size="lg">
                  View Demo
                </Button>
              </Link>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              onClick={scrollToTech}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600 transition-colors group"
            >
              Learn Technology
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Right: Cartridge Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <CartridgeIllustration className="scale-90 sm:scale-100" />
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary/20 flex items-start justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary/40"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
