import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera,
  Droplet,
  Zap,
  LineChart as LineChartIcon,
  Activity,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Area,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from 'recharts';
import { Card } from '@/components/ui';
import { useCalibrationData } from '@/hooks/queries';

const PIPELINE_STEPS = [
  { icon: Camera, label: 'Image Capture' },
  { icon: Droplet, label: 'RGB Extraction' },
  { icon: Zap, label: 'Fluorescence Intensity' },
  { icon: LineChartIcon, label: 'Calibration Curve' },
  { icon: Activity, label: 'Concentration' },
  { icon: CheckCircle2, label: 'Clinical Interpretation' },
];

const BIOMARKER_TABS = [
  { id: 'albumin', label: 'Albumin' },
  { id: 'glucose', label: 'Glucose' },
  { id: 'ketones', label: 'Ketones' },
  { id: 'leukocyte', label: 'Leukocyte' },
  { id: 'nitrite', label: 'Nitrite' },
  { id: 'ph', label: 'pH' },
];

// Custom Tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const isUnknown = payload.some(p => p.dataKey === 'unknownSample');
    return (
      <div className="bg-surface border border-border p-3 rounded-lg shadow-elevated">
        <p className="text-body-sm font-bold text-foreground mb-2">
          {isUnknown ? 'Patient Sample' : 'Standard Solution'}
        </p>
        <p className="text-sm text-muted">
          Intensity: <span className="font-semibold text-foreground">{payload[0].payload.intensity.toFixed(1)}</span>
        </p>
        <p className="text-sm text-muted">
          Concentration: <span className="font-semibold text-foreground">{payload[0].payload.concentration.toFixed(1)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CalibrationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBiomarker = searchParams.get('biomarker') || 'albumin';
  const sampleId = searchParams.get('sampleId');
  const [selectedBiomarker, setSelectedBiomarker] = useState(initialBiomarker);
  const { data: activeData, isLoading } = useCalibrationData(selectedBiomarker, sampleId || undefined);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* ── Header ── */}
      <div>
        <h1 className="text-h2 text-foreground mb-2">Calibration Science</h1>
        <p className="text-body text-muted max-w-3xl">
          FEMFLOU never guesses concentrations. Every biomarker reading is derived from rigorously established 
          calibration curves mapping optical fluorescence intensity to precise molecular concentration.
        </p>
      </div>

      {/* ── Pipeline Explainer Strip ── */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-surface">
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 sm:gap-0">
          {PIPELINE_STEPS.map((step, index) => (
            <React.Fragment key={step.label}>
              <div className={`flex flex-col items-center gap-2 group ${index === 3 ? 'scale-110' : 'opacity-70'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  index === 3 ? 'bg-primary/20 text-primary border border-primary/30 shadow-soft' : 'bg-white border border-border/60 text-muted'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-[0.65rem] font-bold uppercase tracking-wider hidden sm:block ${
                  index === 3 ? 'text-primary' : 'text-muted'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < PIPELINE_STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-border mx-2 sm:mx-6 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* ── Intro & Beer-Lambert Law ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-secondary" />
            <h2 className="text-lg font-bold text-foreground">How It Works</h2>
          </div>
          <p className="text-sm text-muted leading-relaxed mb-4">
            Our microfluidic cartridge reacts with maternal urine samples to produce fluorescent markers. 
            The smartphone camera captures this fluorescence, converting raw RGB pixel data into a unified 
            <strong className="text-foreground"> Intensity</strong> score.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            By plotting this intensity against a standard curve of known concentrations, the AI accurately 
            interpolates the precise biomarker concentration in the patient's sample.
          </p>
        </Card>

        <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 flex flex-col justify-center">
          <h2 className="text-lg font-bold text-foreground mb-4">The Beer-Lambert Law</h2>
          <div className="bg-white/80 rounded-xl p-4 border border-white/60 mb-4 text-center shadow-sm">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-primary">A = ε × c × l</span>
          </div>
          <ul className="space-y-2 text-sm text-muted/90 list-none">
            <li><strong className="text-foreground">A (Absorbance/Intensity):</strong> Measured optical signal</li>
            <li><strong className="text-foreground">ε (Molar Absorptivity):</strong> Analyte-specific constant</li>
            <li><strong className="text-foreground">c (Concentration):</strong> The unknown target value we solve for</li>
            <li><strong className="text-foreground">l (Path Length):</strong> Fixed depth of the microfluidic chamber</li>
          </ul>
        </Card>
      </div>

      {/* ── Interactive Calibration Chart ── */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">Standard Calibration Curve</h2>
            <p className="text-sm text-muted">Select a biomarker to view its regression model and current sample mapping.</p>
          </div>
          
          {/* Biomarker Selector */}
          <div className="flex flex-wrap gap-2 bg-gray-50/80 p-1.5 rounded-xl border border-border/50">
            {BIOMARKER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedBiomarker(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedBiomarker === tab.id
                    ? 'bg-white text-primary shadow-sm border border-black/5'
                    : 'text-muted hover:text-foreground hover:bg-black/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Chart Area */}
          <div className="lg:col-span-3 h-[400px] sm:h-[500px] w-full relative">
            {isLoading || !activeData ? (
              <div className="w-full h-full flex items-center justify-center text-muted">Loading calibration data...</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="intensity" 
                  type="number"
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  label={{ value: 'Fluorescence Intensity (A.U.)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 13 }}
                  domain={['auto', 'auto']}
                />
                <YAxis 
                  dataKey="concentration" 
                  type="number"
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  label={{ value: `Concentration (${activeData.unit})`, angle: -90, position: 'insideLeft', offset: -5, fill: '#64748b', fontSize: 13 }}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />
                
                {/* Confidence Interval Band */}
                <Area 
                  type="monotone" 
                  data={activeData.curvePoints} 
                  dataKey="ciUpper" 
                  stroke="none" 
                  fill="#e2e8f0" 
                  fillOpacity={0.4} 
                  isAnimationActive={true}
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  data={activeData.curvePoints} 
                  dataKey="ciLower" 
                  stroke="none" 
                  fill="#ffffff" 
                  fillOpacity={1} 
                  isAnimationActive={true}
                  animationDuration={1500}
                />

                {/* Regression Line */}
                <Line 
                  type="monotone" 
                  data={activeData.curvePoints} 
                  dataKey="concentration" 
                  stroke="#94a3b8" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={false}
                  isAnimationActive={true}
                  animationDuration={1500}
                />

                {/* Standard Solutions Scatter */}
                <Scatter 
                  name="Standard Solutions" 
                  data={activeData.points} 
                  fill="#cbd5e1"
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationBegin={500}
                />

                {/* Current Unknown Sample Highlight */}
                {activeData.unknownSample && (
                  <>
                    <Scatter 
                      name="Patient Sample" 
                      data={[activeData.unknownSample]} 
                      fill="#0f766e" 
                      shape="circle"
                      r={6}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationBegin={1200}
                    />

                    {/* Dashed projection lines for the unknown sample */}
                    <ReferenceLine 
                      x={activeData.unknownSample.intensity} 
                      stroke="#0f766e" 
                      strokeDasharray="4 4" 
                      segment={[{x: activeData.unknownSample.intensity, y: 0}, {x: activeData.unknownSample.intensity, y: activeData.unknownSample.concentration}]}
                    />
                    <ReferenceLine 
                      y={activeData.unknownSample.concentration} 
                      stroke="#0f766e" 
                      strokeDasharray="4 4"
                      segment={[{x: 0, y: activeData.unknownSample.concentration}, {x: activeData.unknownSample.intensity, y: activeData.unknownSample.concentration}]}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Side Panel: Equation & Legend */}
          <div className="lg:col-span-1 space-y-6 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border/60 pt-6 lg:pt-0 lg:pl-8">
            <div>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Regression Model</h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-border/50">
                <p className="font-mono text-lg font-bold text-foreground mb-1">{activeData?.equation || '--'}</p>
                <p className="text-sm font-medium text-success">R² = {activeData?.rSquared || '--'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Legend</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <div className="w-3 h-3 rounded-full bg-[#cbd5e1]" /> Standard Solutions
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <div className="w-4 h-0.5 bg-[#94a3b8]" /> Fitted Curve
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <div className="w-3 h-3 rounded-sm bg-[#e2e8f0]/60 border border-[#cbd5e1]" /> 95% Confidence Band
                </li>
                {activeData?.unknownSample && (
                  <li className="flex items-center gap-3 text-sm font-bold text-primary">
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-primary relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                    >
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-primary"
                        animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    Patient Sample
                  </li>
                )}
              </ul>
            </div>

            {activeData?.unknownSample && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-primary/5 border border-primary/20 p-4 rounded-xl"
              >
                <h4 className="text-xs font-bold text-primary uppercase mb-1">Interpolated Result</h4>
                <p className="text-sm text-foreground/80 leading-snug">
                  Measured intensity of <strong className="text-foreground">{activeData.unknownSample.intensity.toFixed(1)}</strong> maps to a concentration of <strong className="text-foreground">{activeData.unknownSample.concentration.toFixed(1)} {activeData.unit}</strong>.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalibrationPage;
