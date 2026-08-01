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
} from 'recharts';
import { Button, Card, Badge } from '@/components/ui';
import {
  mockPatient,
  mockBiomarkers,
  mockAlerts,
  mockTrendData,
  mockReports,
  mockAppointments,
  currentRiskScore,
  currentRiskLabel,
} from '@/data/mockData';

// --- Recharts Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }: any) => {
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
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* ── Header & Primary CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-h2 text-foreground">Overview</h1>
          <p className="text-body text-muted">
            Welcome back, {mockPatient.name.split(' ')[0]}. Here is your latest screening data.
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
          {mockAlerts.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-3">
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${
                    alert.level === 'critical'
                      ? 'bg-critical/5 border-critical/20'
                      : 'bg-warning/5 border-warning/20'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      alert.level === 'critical' ? 'text-critical' : 'text-warning'
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        alert.level === 'critical' ? 'text-critical-600' : 'text-amber-900'
                      }`}
                    >
                      {alert.message}
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
                      {mockPatient.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {mockPatient.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted">
                      <span>Age {mockPatient.age}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="font-medium text-foreground">
                        Gestational Week {mockPatient.gestationalWeek}
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
                <Link to={`/results/${mockReports[0].id}`} className="text-sm font-medium text-primary hover:text-primary-600 flex items-center gap-1">
                  Full Report <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mockBiomarkers.map((marker) => (
                  <div key={marker.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-border/50">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        marker.status === 'normal' ? 'bg-success' :
                        marker.status === 'warning' ? 'bg-warning' : 'bg-critical'
                      }`} />
                      <span className="text-xs font-medium text-foreground truncate max-w-[80px]" title={marker.name}>
                        {marker.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {marker.value} <span className="text-[0.65rem] text-muted font-normal">{marker.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* 5. Trend Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-base font-bold text-foreground mb-6">Health Score Trend</h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
                Upcoming Visits
              </h3>
              {mockAppointments.length > 0 ? (
                <div className="space-y-3">
                  {mockAppointments.map((apt) => (
                    <div key={apt.id} className="p-3 rounded-lg bg-white/60 border border-white/80 shadow-sm">
                      <p className="text-sm font-semibold text-foreground mb-1">{apt.type}</p>
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {apt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {apt.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-2 pt-2 border-t border-border/50">
                        {apt.doctorName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted text-center py-4">No upcoming appointments.</p>
              )}
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
                {mockReports.map((report) => (
                  <Link
                    key={report.id}
                    to={`/results/${report.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-border/50 group"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {report.date}
                      </p>
                      <p className="text-xs text-muted">Week {report.gestationalWeek}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          report.riskScore > 85 ? 'success' :
                          report.riskScore > 70 ? 'warning' : 'critical'
                        }
                      >
                        {report.riskLabel}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
