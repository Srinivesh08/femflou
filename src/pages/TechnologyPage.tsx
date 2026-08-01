import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowLeft,
  Droplets,
  Eye,
  FlaskRound,
  Microscope,
  Heart,
  Baby,
  ShieldCheck,
  Activity,
  Beaker,
} from 'lucide-react';
import { DisclaimerBanner, Footer } from '@/components/landing';

/* ─── Animated section wrapper ─── */
const Section: React.FC<{
  children: React.ReactNode;
  id?: string;
  className?: string;
}> = ({ children, id, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ─── Beer-Lambert Formula SVG ─── */
const BeerLambertFormula: React.FC = () => (
  <div className="flex flex-col items-center py-8">
    <div className="relative px-10 py-8 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
      <div className="text-center">
        <div className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-2" style={{ fontFamily: 'serif' }}>
          A = ε × c × l
        </div>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm text-muted max-w-xl mx-auto">
          <div className="text-center">
            <span className="block text-lg font-bold text-primary" style={{ fontFamily: 'serif' }}>A</span>
            <span>Absorbance</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-bold text-secondary" style={{ fontFamily: 'serif' }}>ε</span>
            <span>Molar absorptivity</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-bold text-accent" style={{ fontFamily: 'serif' }}>c</span>
            <span>Concentration</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-bold text-purple-600" style={{ fontFamily: 'serif' }}>l</span>
            <span>Path length</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TechnologyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* ─── Page hero ─── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 30% 40%, rgba(15,118,110,0.06) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 70% 60%, rgba(6,182,212,0.05) 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-display text-foreground mb-4"
          >
            Technology &{' '}
            <span className="gradient-text">Science</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-body-lg text-muted max-w-2xl mx-auto"
          >
            The convergence of microfluidics, optics, computer vision, and machine learning
            — engineered to make lab-grade maternal health screening universally accessible.
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-20">
        {/* ─── 1. Mission ─── */}
        <Section id="mission">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-h2 text-foreground mb-1">Our Mission</h2>
              <div className="w-12 h-1 rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>
          </div>
          <div className="pl-0 sm:pl-16 space-y-4 text-body text-muted leading-relaxed">
            <p>
              Maternal mortality remains a critical global health challenge. Approximately
              300,000 women die each year from pregnancy-related complications —
              most of which are preventable with early screening and timely intervention.
            </p>
            <p>
              FEMFLOU's mission is to democratize access to high-quality maternal health
              screening by replacing expensive laboratory infrastructure with an intelligent,
              portable system that works with any smartphone. We believe that geography
              and economics should never determine a mother's health outcomes.
            </p>
            <p>
              By combining disposable microfluidic cartridges with AI-powered image analysis,
              FEMFLOU delivers actionable health insights in minutes — empowering community
              health workers, midwives, and clinicians in any setting.
            </p>
          </div>
        </Section>

        {/* ─── 2. Technology ─── */}
        <Section id="tech-detail">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Microscope className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-h2 text-foreground mb-1">Technology</h2>
              <div className="w-12 h-1 rounded-full bg-gradient-to-r from-secondary to-accent" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Droplets,
                title: 'Microfluidics',
                color: 'text-primary',
                bg: 'bg-primary/10',
                desc: 'Lab-on-a-chip technology using capillary-driven flow to transport urine through precisely designed channels to 6 independent reaction chambers — no pumps, no power, no expertise required.',
              },
              {
                icon: Eye,
                title: 'Computer Vision',
                color: 'text-secondary',
                bg: 'bg-secondary/10',
                desc: 'Our CV pipeline automatically detects the cartridge in any image, applies perspective correction, segments each reaction chamber, and extracts calibrated RGB values for quantitative colorimetric analysis.',
              },
              {
                icon: FlaskRound,
                title: 'AI & Machine Learning',
                color: 'text-accent',
                bg: 'bg-accent/10',
                desc: 'Trained on thousands of calibration images, our models map color intensity to biomarker concentration and calculate composite risk scores with confidence intervals and explainability.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`p-6 rounded-2xl ${item.bg} border border-border/30`}
              >
                <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                <h3 className="text-h4 text-foreground mb-2">{item.title}</h3>
                <p className="text-body-sm text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ─── 3. Scientific Principle ─── */}
        <Section id="science">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Beaker className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-h2 text-foreground mb-1">
                Scientific Principle: Beer-Lambert Law
              </h2>
              <div className="w-12 h-1 rounded-full bg-gradient-to-r from-accent to-primary" />
            </div>
          </div>

          <div className="pl-0 sm:pl-16 space-y-5 text-body text-muted leading-relaxed">
            <p>
              FEMFLOU's quantitative analysis is grounded in the <strong className="text-foreground">Beer-Lambert Law</strong>,
              a foundational principle in analytical chemistry that relates the absorption of light
              to the properties of the material through which the light is travelling.
            </p>

            <BeerLambertFormula />

            <p>
              <strong className="text-foreground">In simple terms:</strong> when light passes through
              a solution, the amount of light absorbed is directly proportional to the concentration of
              the absorbing substance and the distance the light travels through the solution.
            </p>

            <p>
              In FEMFLOU's context, each reaction chamber produces a color whose intensity
              is proportional to the concentration of a specific biomarker (protein, glucose,
              pH, blood, nitrite, or leukocytes). By photographing the cartridge and extracting
              precise RGB values from each chamber, our software applies Beer-Lambert
              calibration curves to convert color intensity into quantitative concentration
              measurements.
            </p>

            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-body-sm text-foreground/80">
                <strong className="text-primary">Key insight:</strong> Because smartphone cameras
                capture in RGB color space, FEMFLOU's calibration pipeline maps each color
                channel's intensity against known analyte concentrations, creating robust
                calibration models that account for variations in lighting, camera sensor,
                and cartridge batch — achieving laboratory-comparable accuracy.
              </p>
            </div>
          </div>
        </Section>

        {/* ─── 4. Clinical Applications ─── */}
        <Section id="clinical">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-success" />
            </div>
            <div>
              <h2 className="text-h2 text-foreground mb-1">Clinical Applications</h2>
              <div className="w-12 h-1 rounded-full bg-gradient-to-r from-success to-primary" />
            </div>
          </div>

          <div className="pl-0 sm:pl-16 grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: ShieldCheck,
                title: 'Preeclampsia Screening',
                desc: 'Early detection of proteinuria — a key indicator of preeclampsia — enabling timely clinical intervention.',
                color: 'text-critical',
                bg: 'bg-critical/5',
              },
              {
                icon: Activity,
                title: 'Gestational Diabetes',
                desc: 'Glucose monitoring throughout pregnancy to identify gestational diabetes risk factors.',
                color: 'text-warning',
                bg: 'bg-warning/5',
              },
              {
                icon: FlaskRound,
                title: 'Urinary Tract Infections',
                desc: 'Nitrite and leukocyte detection for rapid UTI screening — critical for preventing preterm birth.',
                color: 'text-secondary',
                bg: 'bg-secondary/5',
              },
              {
                icon: Baby,
                title: 'General Maternal Wellness',
                desc: 'Comprehensive pH and blood monitoring for ongoing maternal health assessment.',
                color: 'text-primary',
                bg: 'bg-primary/5',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`p-6 rounded-2xl ${item.bg} border border-border/20`}
              >
                <item.icon className={`w-6 h-6 ${item.color} mb-3`} />
                <h4 className="text-base font-semibold text-foreground mb-1.5">{item.title}</h4>
                <p className="text-body-sm text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>
      </div>

      <DisclaimerBanner />
      <Footer />
    </div>
  );
};

export default TechnologyPage;
