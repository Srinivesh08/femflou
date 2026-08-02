import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload,
  AlertTriangle,
  Calendar,
  FileText,
  Clock,
  ArrowRight,
  ChevronRight,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TooltipProps
} from 'recharts';
import { Button, Card, Badge } from '@/components/ui';
import { usePatientMe, useReports, useAlerts } from '@/hooks/queries';
import { useAppStore } from '@/store/useAppStore';

// --- Recharts Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border p-3 rounded-lg shadow-elevated">
        <p className="text-body-sm font-medium text-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-primary">
          Score: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// --- Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DashboardPage: React.FC = () => {
  const { user } = useAppStore();
  const { data: patientProfile, isLoading: patientLoading } = usePatientMe();
  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: alerts } = useAlerts();

  if (patientLoading || reportsLoading) {
    return <div className="p-12 text-center text-muted">Loading your dashboard...</div>;
  }

  const patient = patientProfile?.user || user;
  const gestationalWeek = patientProfile?.currentGestationalWeek || '--';
  
  // Calculate Age
  let age = '--';
  if (patientProfile?.dateOfBirth) {
    const diff = Date.now() - new Date(patientProfile.dateOfBirth).getTime();
    age = Math.abs(new Date(diff).getUTCFullYear() - 1970).toString();
  }

  // Reports formatting
  const recentReports = reports ? [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
  const latestReport = recentReports[0];
  
  const currentRiskScore = latestReport ? Math.round(latestReport.overallRiskScore) : 0;
  let currentRiskLabel = 'NORMAL';
  if (currentRiskScore > 66) currentRiskLabel = 'CRITICAL';
  else if (currentRiskScore > 33) currentRiskLabel = 'HIGH';
  else if (currentRiskScore > 0) currentRiskLabel = 'MILD';

  // Format Trend Data
  const trendData = recentReports.map(r => ({
    date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: Math.round(r.overallRiskScore)
  })).reverse();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* ── Header & Primary CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-h2 text-foreground">Overview</h1>
          <p className="text-body text-muted">
            Welcome back, {patient?.name?.split(' ')[0] || 'User'}. Here is your latest screening data.
          </p>
        </div>
        <Link to="/upload">
          <Button size="lg" leftIcon={<Upload className="w-5 h-5" />}>
            Upload New Sample
          </Button>
        </Link>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* ── Left Column (Main Content) ── */}
        <div className="md:col-span-8 space-y-6">
          
          {/* 4. Alerts Panel */}
          {alerts && alerts.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-3">
              {alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border bg-critical/5 border-critical/20`}
                >
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 text-critical`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium text-critical-600`}>
                      {alert.alertMessage || 'Critical anomaly detected in recent screening.'}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 1. Patient Info Card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full flex flex-col justify-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 border border-primary/10">
                    <span className="text-xl font-bold text-primary">
                      {patient?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {patient?.name || 'Loading...'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted">
                      <span>Age {age}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="font-medium text-foreground">
                        Gestational Week {gestationalWeek}
                      </span>
                    </div>
                    <p className="text-xs text-muted/80 mt-2">
                      Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 2. Overall Risk Score Card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full relative overflow-hidden flex flex-col items-center justify-center text-center p-6">
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
                  AI Health Score
                </h3>
                <div className="relative w-40 h-24 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { value: currentRiskScore },
                          { value: 100 - currentRiskScore },
                        ]}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={
                           currentRiskScore > 85 ? '#22c55e' :
                           currentRiskScore > 70 ? '#f59e0b' : '#ef4444'
                        } />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 text-center">
                    <span className="text-3xl font-bold text-foreground leading-none">
                      {currentRiskScore}
                    </span>
                    <span className="text-sm text-muted block mt-1">/ 100</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Badge
                    variant={
                      currentRiskScore > 85 ? 'success' :
                      currentRiskScore > 70 ? 'warning' : 'critical'
                    }
                  >
                    {currentRiskLabel}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* 3. Recent Analysis Summary (Biomarker Chips) */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-foreground">Latest Biomarkers</h3>
                {latestReport && (
                  <Link to={`/results/${latestReport.id}`} className="text-sm font-medium text-primary hover:text-primary-600 flex items-center gap-1">
                    Full Report <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              
              {latestReport?.sample?.biomarkerResults?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {latestReport.sample.biomarkerResults.map((marker: any) => (
                    <div key={marker.biomarkerType} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          marker.riskStatus === 'NORMAL' ? 'bg-success' :
                          marker.riskStatus === 'MILD' ? 'bg-warning' : 'bg-critical'
                        }`} />
                        <span className="text-xs font-medium text-foreground truncate max-w-[80px]" title={marker.biomarkerType}>
                          {marker.biomarkerType}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {marker.measuredValue} <span className="text-[0.65rem] text-muted font-normal">{marker.unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-border">
                  <Activity className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted">No biomarkers recorded yet.</p>
                  <p className="text-xs text-muted/80 mt-1">Upload a sample to see your first analysis.</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* 5. Trend Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-base font-bold text-foreground mb-6">Health Score Trend</h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0f766e"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0f766e', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#0f766e', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── Right Column (Sidebar Widgets) ── */}
        <div className="md:col-span-4 space-y-6">
          
          {/* 7. Upcoming Appointments */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                Your Care Team
              </h3>
              <div className="space-y-3">
                {patientProfile?.assignedDoctor ? (
                  <div className="p-3 rounded-lg bg-white/60 border border-white/80 shadow-sm">
                    <p className="text-sm font-semibold text-foreground mb-1">Assigned Doctor</p>
                    <p className="text-xs text-muted pt-2 border-t border-border/50">
                      {patientProfile.assignedDoctor.name}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted text-center py-4">No doctor assigned yet.</p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* 6. Recent Reports List */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  Recent Reports
                </h3>
                <Link to="/history" className="text-xs font-medium text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {recentReports.length > 0 ? recentReports.slice(0, 5).map((report: any) => {
                  const score = report.overallRiskScore;
                  let label = 'NORMAL';
                  if (score > 66) label = 'CRITICAL';
                  else if (score > 33) label = 'HIGH';
                  else if (score > 0) label = 'MILD';
                  
                  return (
                    <Link
                      key={report.id}
                      to={`/results/${report.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-border/50 group"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            label === 'NORMAL' ? 'success' :
                            label === 'MILD' ? 'warning' : 'critical'
                          }
                        >
                          {label}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  );
                }) : (
                  <div className="py-6 text-center text-muted text-sm">
                    No historical reports available.
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
