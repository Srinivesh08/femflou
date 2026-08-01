import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Droplets,
  TestTube,
  Beaker,
  Thermometer,
  Zap,
  AlertTriangle,
  FileDown,
  Share2,
  Printer,
  ChevronDown,
  ArrowRight,
  Stethoscope,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Button, Card, Badge, ProgressBar } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { BIOMARKERS, generateMockResult } from '@/data/biomarkers';
import { mockPatient } from '@/data/mockData';

// Map specific icons to biomarkers
const getBiomarkerIcon = (key: string) => {
  switch (key) {
    case 'albumin': return <Droplets className="w-5 h-5 text-blue-500" />;
    case 'glucose': return <Zap className="w-5 h-5 text-amber-500" />;
    case 'ketones': return <Activity className="w-5 h-5 text-purple-500" />;
    case 'leukocyte': return <TestTube className="w-5 h-5 text-teal-500" />;
    case 'nitrite': return <Beaker className="w-5 h-5 text-rose-500" />;
    case 'ph': return <Thermometer className="w-5 h-5 text-green-500" />;
    default: return <Activity className="w-5 h-5" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal': return 'bg-success';
    case 'abnormal': return 'bg-warning';
    case 'severe': return 'bg-critical';
    default: return 'bg-gray-300';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'normal': return <Badge variant="success">Normal</Badge>;
    case 'abnormal': return <Badge variant="warning">Abnormal</Badge>;
    case 'severe': return <Badge variant="critical">Critical</Badge>;
    default: return <Badge>Unknown</Badge>;
  }
};

// Mock mini calibration data
const generateCalibrationData = () => {
  return Array.from({ length: 10 }).map((_, i) => ({
    x: i * 10,
    y: i * 10 + (Math.random() * 10 - 5),
  }));
};

const BiomarkerCard = ({ 
  bKey, 
  data, 
  reference 
}: { 
  bKey: string; 
  data: any; 
  reference: any;
}) => {
  const [expanded, setExpanded] = useState(false);
  const trend = Math.random(); // 0-1
  const calData = generateCalibrationData();
  const highlightPoint = [{ x: 50, y: 50 }]; // Mock point for current reading

  let progress = 0;
  if (data.status === 'normal') progress = Math.random() * 30 + 10;
  else if (data.status === 'abnormal') progress = Math.random() * 30 + 60;
  else progress = Math.random() * 10 + 90;

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-elevated transition-shadow">
      <div 
        className="p-5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gray-50 border border-border/50`}>
              {getBiomarkerIcon(bKey)}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base leading-tight">
                {reference.name}
              </h3>
              <span className="text-xs text-muted">Ref: {reference.ranges.normal}</span>
            </div>
          </div>
          {getStatusBadge(data.status)}
        </div>

        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-foreground">{data.value}</span>
            <span className="text-sm text-muted ml-1">{data.unit}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-muted mb-1 flex items-center gap-1">
              {trend > 0.6 ? <TrendingUp className="w-3 h-3 text-warning" /> : trend > 0.3 ? <TrendingDown className="w-3 h-3 text-success" /> : <Minus className="w-3 h-3 text-muted" />}
              {trend > 0.6 ? 'Increasing' : trend > 0.3 ? 'Decreasing' : 'Stable'}
            </span>
            <span className="text-[0.65rem] text-muted font-mono">Conf: {(Math.random() * 5 + 94).toFixed(1)}%</span>
          </div>
        </div>

        <ProgressBar progress={progress} color={getStatusColor(data.status)} />
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs font-medium text-foreground/80 flex-1 truncate pr-2">
            {data.status === 'normal' 
              ? 'Levels are within expected healthy ranges.'
              : data.status === 'abnormal' 
                ? 'Elevated levels detected. Close monitoring advised.'
                : 'Critically out of range. Immediate clinical review required.'}
          </p>
          <ChevronDown className={`w-4 h-4 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/40 bg-gray-50/50"
          >
            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Calibration Curve</h4>
                <div className="h-24 w-full bg-white rounded-lg border border-border/60 p-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <XAxis type="number" dataKey="x" hide />
                      <YAxis type="number" dataKey="y" hide />
                      <ZAxis range={[10, 10]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter data={calData} fill="#94a3b8" />
                      <Scatter data={highlightPoint} fill={data.status === 'normal' ? '#22c55e' : data.status === 'abnormal' ? '#f59e0b' : '#ef4444'} />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <Link 
                    to={`/calibration?biomarker=${bKey}`} 
                    className="absolute bottom-1 right-2 text-[0.65rem] font-medium text-primary hover:underline flex items-center gap-0.5"
                  >
                    View Full <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Clinical Notes</h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {reference.name} is a key indicator. The current reading of {data.value} {data.unit} suggests 
                  {data.status === 'normal' ? ' typical physiological function.' : ' potential metabolic or renal stress requiring further investigation.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const ResultsPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  
  const [result, setResult] = useState<any>(null);
  const [docNote, setDocNote] = useState('');

  useEffect(() => {
    if (location.state && location.state.result) {
      setResult(location.state.result);
    } else {
      setResult(generateMockResult());
    }
  }, [id, location.state]);

  if (!result) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const hasCritical = Object.values(result.biomarkers).some((b: any) => b.status === 'severe');
  const abnormalNames = Object.values(result.biomarkers)
    .filter((b: any) => b.status !== 'normal')
    .map((b: any) => b.name);

  let aiSummary = "Analysis indicates all biomarkers are within expected healthy limits. No immediate physiological stress detected.";
  if (abnormalNames.length > 0) {
    aiSummary = `Analysis indicates abnormal concentrations of ${abnormalNames.join(' and ')}. `;
    if (hasCritical) {
      aiSummary += `This pattern strongly suggests acute clinical risk requiring immediate verification by a healthcare professional. `;
    } else {
      aiSummary += `This pattern suggests potential mild metabolic stress or early-stage indicators requiring closer monitoring. `;
    }
    aiSummary += `Other tested markers remain within expected physiological baselines.`;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full">
      {/* ======================= PRINT ONLY LAYOUT ======================= */}
      <div className="print-only bg-white text-black text-sm p-4 w-[210mm] min-h-[297mm] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-primary pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded bg-primary text-white font-bold flex items-center justify-center text-xs">FF</div>
              <h1 className="text-xl font-bold text-primary tracking-tight">FEMFLOU Clinical Screening Report</h1>
            </div>
            <p className="text-xs text-gray-500">Intelligent Maternal Health Diagnostics</p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p><strong className="text-black">Report ID:</strong> {result.id}</p>
            <p><strong className="text-black">Date:</strong> {new Date(result.date).toLocaleString()}</p>
          </div>
        </div>

        {/* Patient Info & Risk Score */}
        <div className="flex justify-between gap-6 mb-8">
          <div className="flex-1 bg-gray-50 p-4 rounded border border-gray-200">
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-2">Patient Details</h2>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <p><strong>Name:</strong> {mockPatient.name}</p>
              <p><strong>Age:</strong> {mockPatient.age}</p>
              <p><strong>Gestational Wk:</strong> {mockPatient.gestationalWeek}</p>
              <p><strong>ID:</strong> {mockPatient.id}</p>
            </div>
          </div>
          
          <div className="w-48 bg-gray-50 p-4 rounded border border-gray-200 text-center flex flex-col justify-center">
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-1">Composite Risk</h2>
            <div className="text-3xl font-extrabold" style={{ color: result.riskScore > 85 ? '#22c55e' : result.riskScore > 70 ? '#f59e0b' : '#ef4444' }}>
              {result.riskScore}<span className="text-sm text-gray-400">/100</span>
            </div>
            <p className="text-xs font-bold mt-1 uppercase" style={{ color: result.riskScore > 85 ? '#22c55e' : result.riskScore > 70 ? '#f59e0b' : '#ef4444' }}>
              {result.riskLabel}
            </p>
          </div>
        </div>

        {/* Biomarker Table */}
        <div className="mb-8">
          <h2 className="text-sm font-bold border-b border-gray-300 pb-2 mb-3">Biomarker Analysis Panel</h2>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-600">
                <th className="py-2">Analyte</th>
                <th className="py-2">Result</th>
                <th className="py-2">Reference Range</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.biomarkers).map(([key, data]: [string, any]) => (
                <tr key={key} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{data.name}</td>
                  <td className="py-2 font-bold">
                    {data.value} <span className="text-xs text-gray-500 font-normal">{data.unit}</span>
                  </td>
                  <td className="py-2 text-gray-500 text-xs">{BIOMARKERS[key].ranges.normal}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      data.status === 'normal' ? 'bg-green-100 text-green-800' :
                      data.status === 'abnormal' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {data.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Summary & Doctor Notes */}
        <div className="grid grid-cols-2 gap-6 mb-8 break-inside-avoid">
          <div>
            <h2 className="text-sm font-bold border-b border-gray-300 pb-2 mb-3">AI Clinical Summary</h2>
            <p className="text-sm text-gray-700 leading-relaxed bg-blue-50/50 p-3 rounded border border-blue-100">
              {aiSummary}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold border-b border-gray-300 pb-2 mb-3">Clinical Observations</h2>
            <div className="h-24 w-full border border-gray-200 rounded p-3 bg-gray-50 text-gray-600 italic text-sm">
              {docNote || 'No manual clinical observations recorded for this report.'}
            </div>
          </div>
        </div>

        {/* Footer Area: Signature & QR Code */}
        <div className="flex justify-between items-end mt-16 break-inside-avoid">
          <div className="flex items-center gap-4">
            {/* Fake QR Code using inline SVG pattern */}
            <div className="w-20 h-20 bg-white border border-gray-200 p-1">
              <svg width="100%" height="100%" viewBox="0 0 10 10" shapeRendering="crispEdges">
                <rect width="10" height="10" fill="#fff" />
                <path d="M1,1h3v3H1z M2,2h1v1H2z M6,1h3v3H6z M7,2h1v1H7z M1,6h3v3H1z M2,7h1v1H2z" fill="#000" />
                <path d="M5,1h1v1H5z M4,2h1v2H4z M5,4h2v1H5z M8,5h1v1H8z M6,6h1v2H6z M8,7h1v2H8z M4,8h1v1H4z" fill="#000" />
              </svg>
            </div>
            <div className="text-xs text-gray-500 max-w-[150px]">
              Scan QR code to verify report authenticity in FEMFLOU portal.
            </div>
          </div>
          
          <div className="w-64 text-center">
            <div className="border-b border-black mb-2 h-8"></div>
            <p className="text-xs font-bold text-black uppercase">Attending Physician Signature</p>
            <p className="text-xs text-gray-500 mt-1">Date: ____________________</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-4 border-t border-gray-200 text-[0.65rem] text-gray-400 text-justify break-inside-avoid">
          <strong>Medical Disclaimer:</strong> FEMFLOU is an AI-assisted maternal health screening platform intended for preliminary screening and health monitoring. It does not diagnose medical conditions and should not be used as a substitute for professional medical evaluation, diagnosis, or treatment. Always consult a qualified healthcare provider for clinical decisions. Generated automated results must be verified by clinical correlation.
        </div>
      </div>
      {/* ======================= END PRINT ONLY LAYOUT ======================= */}


      {/* ======================= SCREEN ONLY LAYOUT ======================= */}
      <div className="print-hidden max-w-7xl mx-auto space-y-6 pb-20">
        {/* ── Action Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-h2 text-foreground flex items-center gap-2">
              Report: {result.id}
            </h1>
            <p className="text-sm text-muted">
              Generated on {new Date(result.date).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
              Print
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Share2 className="w-4 h-4" />}>
              Share
            </Button>
            {/* Download PDF button also triggers the browser print dialog which has native PDF export */}
            <Button size="sm" onClick={handlePrint} leftIcon={<FileDown className="w-4 h-4" />}>
              Download PDF Report
            </Button>
          </div>
        </div>

        {/* ── Emergency Alert Banner ── */}
        <AnimatePresence>
          {hasCritical && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-critical/10 border border-critical/30 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-critical flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-critical-600">Urgent Medical Attention Required</h3>
                <p className="text-sm text-critical-600/90 mt-1">
                  One or more values have reached critical thresholds. Please contact your healthcare provider immediately for comprehensive clinical evaluation.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ── Left Column: Risk Meter & Summary ── */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Risk Meter */}
            <Card className="flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 pointer-events-none" />
              <h2 className="text-sm font-bold text-muted uppercase tracking-widest mb-6 z-10">
                Composite Risk Score
              </h2>
              
              <div className="relative w-full max-w-[240px] aspect-[2/1] z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: result.riskScore },
                        { value: 100 - result.riskScore },
                      ]}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius="75%"
                      outerRadius="100%"
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={
                         result.riskScore > 85 ? '#22c55e' :
                         result.riskScore > 70 ? '#f59e0b' : '#ef4444'
                      } />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[20%] text-center">
                  <span className="text-[3.5rem] font-extrabold text-foreground leading-none tracking-tighter">
                    {result.riskScore}
                  </span>
                  <span className="text-sm font-medium text-muted block mt-1">/ 100</span>
                </div>
              </div>
              
              <div className="mt-10 z-10">
                <Badge
                  variant={
                    result.riskScore > 85 ? 'success' :
                    result.riskScore > 70 ? 'warning' : 'critical'
                  }
                  className="px-4 py-1.5 text-sm"
                >
                  {result.riskLabel}
                </Badge>
              </div>
            </Card>

            {/* AI Clinical Summary Panel */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground text-base">AI Clinical Summary</h3>
              </div>
              
              <p className="text-sm text-foreground/80 leading-relaxed mb-5">
                {aiSummary}
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-xs font-bold text-muted uppercase mb-2">Recommendations</h4>
                  <ul className="text-sm text-foreground/80 space-y-2 list-disc list-inside">
                    {hasCritical ? (
                      <>
                        <li>Immediate clinical consult required</li>
                        <li>Hold regular diet pending physician review</li>
                      </>
                    ) : abnormalNames.length > 0 ? (
                      <>
                        <li>Increase hydration and monitor symptoms</li>
                        <li>Schedule follow-up screening in 48 hours</li>
                      </>
                    ) : (
                      <>
                        <li>Maintain current prenatal care routine</li>
                        <li>Next routine screening in 2 weeks</li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="bg-white/60 p-3 rounded-lg border border-white/80">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-muted">AI Confidence</span>
                    <span className="text-primary">98.4%</span>
                  </div>
                  <ProgressBar progress={98.4} color="bg-primary" className="mt-1.5" />
                </div>
              </div>
              
              {user?.role === 'patient' && (
                <Button fullWidth variant={hasCritical ? 'primary' : 'outline'} className={hasCritical ? 'bg-critical hover:bg-critical-600 border-none' : ''}>
                  Request Doctor Consultation
                </Button>
              )}
            </Card>

            {/* Doctor Notes */}
            <Card>
              <h3 className="font-bold text-foreground text-base flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-secondary" />
                Physician Notes
              </h3>
              
              {user?.role === 'doctor' || user?.role === 'admin' ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full text-sm p-3 rounded-xl border border-border bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    rows={4}
                    placeholder="Add clinical observations here..."
                    value={docNote}
                    onChange={(e) => setDocNote(e.target.value)}
                  />
                  <Button size="sm" onClick={() => {}} disabled={!docNote}>Save Note</Button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 border border-border/50 text-center">
                  <p className="text-sm text-muted">No physician notes have been added to this report yet.</p>
                </div>
              )}
            </Card>
          </div>

          {/* ── Right Column: Biomarker Cards Grid ── */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold text-foreground">Detailed Biomarker Analysis</h2>
              <span className="text-sm text-muted font-medium">6 Analytes</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(result.biomarkers).map(([key, data]: [string, any], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <BiomarkerCard 
                    bKey={key} 
                    data={data} 
                    reference={BIOMARKERS[key]} 
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ======================= END SCREEN ONLY LAYOUT ======================= */}
    </div>
  );
};

export default ResultsPage;
