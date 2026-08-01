import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Droplets,
  CreditCard,
  GitBranch,
  Sparkles,
  Camera,
  CloudUpload,
  ScanLine,
  Database,
  BrainCircuit,
  LayoutDashboard,
  FileText,
  Stethoscope,
} from 'lucide-react';

interface PipelineStep {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const steps: PipelineStep[] = [
  {
    icon: Droplets,
    title: 'Collect Urine Sample',
    description: 'Non-invasive sample collection with guided instructions.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: CreditCard,
    title: 'Apply to FEMFLOU Cartridge',
    description: 'Apply sample to the microfluidic diagnostic cartridge.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: GitBranch,
    title: 'Microfluidic Flow',
    description: 'Urine flows through precision-engineered microfluidic channels.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Sparkles,
    title: 'Color & Fluorescence Reaction',
    description: 'Reaction chambers develop measurable color and fluorescence signals.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Camera,
    title: 'Smartphone Capture',
    description: 'Patient captures cartridge image using any smartphone camera.',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    icon: CloudUpload,
    title: 'Secure Upload',
    description: 'Image transmitted via encrypted end-to-end secure channel.',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    icon: ScanLine,
    title: 'Computer Vision Analysis',
    description: 'Cartridge detection, perspective correction, chamber segmentation, RGB extraction.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
  },
  {
    icon: Database,
    title: 'Calibration Comparison',
    description: 'Results compared against validated calibration database.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
  },
  {
    icon: BrainCircuit,
    title: 'AI Risk Assessment',
    description: 'Machine learning models generate comprehensive risk scores.',
    color: 'text-critical',
    bgColor: 'bg-critical/10',
  },
  {
    icon: LayoutDashboard,
    title: 'Interactive Dashboard',
    description: 'Results visualized in an intuitive, interactive clinical dashboard.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: FileText,
    title: 'Clinical PDF Report',
    description: 'Detailed PDF report generated for medical records.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: Stethoscope,
    title: 'Doctor Review',
    description: 'Clinician reviews results and makes informed care decisions.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

const StepCard: React.FC<{ step: PipelineStep; index: number; total: number }> = ({
  step,
  index,
  total,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="relative">
      <motion.div
        initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30, y: 10 }}
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: index % 2 === 0 ? -30 : 30, y: 10 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-start gap-4"
      >
        {/* Timeline node */}
        <div className="flex flex-col items-center flex-shrink-0">
          {/* Step number ring */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.4, delay: 0.1, type: 'spring', stiffness: 300 }}
            className={`relative z-10 w-12 h-12 rounded-2xl ${step.bgColor} flex items-center justify-center border border-white/60 shadow-soft`}
          >
            <step.icon className={`w-5 h-5 ${step.color}`} />
          </motion.div>

          {/* Connector line */}
          {index < total - 1 && (
            <motion.div
              className="w-px flex-1 min-h-[2rem]"
              style={{
                background: 'linear-gradient(180deg, rgba(15,118,110,0.2) 0%, rgba(37,99,235,0.1) 50%, rgba(6,182,212,0.2) 100%)',
              }}
              initial={{ scaleY: 0, originY: 0 }}
              animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          )}
        </div>

        {/* Content */}
        <div className="pb-8 pt-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[0.625rem] font-bold text-muted/50 uppercase tracking-widest">
              Step {String(index + 1).padStart(2, '0')}
            </span>
          </div>
          <h4 className="text-base font-semibold text-foreground mb-1">
            {step.title}
          </h4>
          <p className="text-sm text-muted leading-relaxed max-w-sm">
            {step.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export const WorkflowPipeline: React.FC = () => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section className="relative py-20 md:py-28 overflow-hidden" id="workflow">
      {/* Background accent */}
      <div className="absolute inset-0 gradient-primary-soft opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="text-h1 text-foreground mb-4 text-balance">
            From Sample to{' '}
            <span className="gradient-text">Clinical Insight</span>
          </h2>
          <p className="text-body-lg text-muted max-w-2xl mx-auto">
            A seamless 12-step pipeline that transforms a simple urine sample
            into actionable clinical intelligence — in minutes, not days.
          </p>
        </motion.div>

        {/* Pipeline — two-column on desktop */}
        <div className="grid md:grid-cols-2 gap-x-12 lg:gap-x-20">
          {/* Left column: steps 1–6 */}
          <div>
            {steps.slice(0, 6).map((step, i) => (
              <StepCard key={i} step={step} index={i} total={6} />
            ))}
          </div>
          {/* Right column: steps 7–12 */}
          <div className="md:mt-12">
            {steps.slice(6).map((step, i) => (
              <StepCard key={i + 6} step={step} index={i + 6} total={12} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowPipeline;
