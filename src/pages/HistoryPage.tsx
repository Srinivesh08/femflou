import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  FileText,
  ChevronRight,
  TrendingUp,
  Calendar,
  Activity,
  AlertTriangle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Card, Badge, Input } from '@/components/ui';
import { useReports } from '@/hooks/queries';

// Format YYYY-MM-DD to "Oct 24, 2023"
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const HistoryPage: React.FC = () => {
  const { data: reportsData } = useReports();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  const formattedReports = useMemo(() => {
    if (!reportsData) return [];
    return reportsData.map((r: any) => ({
      id: r.id,
      date: r.createdAt,
      gestationalWeek: r.sample?.patient?.currentGestationalWeek || '--',
      riskScore: Math.round(r.overallRiskScore),
      riskLabel: r.overallRiskScore > 66 ? 'CRITICAL' : r.overallRiskScore > 33 ? 'HIGH' : r.overallRiskScore > 0 ? 'MILD' : 'NORMAL',
      biomarkers: r.sample?.biomarkerResults?.reduce((acc: any, b: any) => {
        acc[b.biomarkerType.toLowerCase()] = b.measuredValue;
        return acc;
      }, {}) || {}
    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reportsData]);

  // Filter Reports
  const filteredReports = useMemo(() => {
    return formattedReports.filter((r: any) => {
      const matchesSearch = r.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'All' || 
                          (riskFilter === 'Low Risk' && r.riskScore > 85) || 
                          (riskFilter === 'Monitor' && r.riskScore > 70 && r.riskScore <= 85) ||
                          (riskFilter === 'Elevated Risk' && r.riskScore <= 70);
      return matchesSearch && matchesRisk;
    });
  }, [searchTerm, riskFilter]);

  // Data for Monthly Bar Chart
  const monthlyData = useMemo(() => {
    const months = [...formattedReports].reverse(); // Oldest first
    const grouped: Record<string, { total: number; count: number }> = {};
    months.forEach((r: any) => {
      const month = new Date(r.date).toLocaleString('default', { month: 'short' });
      if (!grouped[month]) grouped[month] = { total: 0, count: 0 };
      grouped[month].total += r.riskScore;
      grouped[month].count += 1;
    });
    return Object.keys(grouped).map(k => ({
      name: k,
      avgScore: Math.round(grouped[k].total / grouped[k].count)
    }));
  }, []);

  // Data for Trend Line Chart
  const trendData = useMemo(() => {
    return [...formattedReports].reverse().map((r: any) => ({
      name: `Wk ${r.gestationalWeek}`,
      Albumin: r.biomarkers.albumin || 0,
      Glucose: r.biomarkers.glucose || 0,
      pH: (r.biomarkers.ph || 0) * 10, // Scale up for visibility
      Score: r.riskScore,
    }));
  }, []);

  // Data for Radar Chart (Latest vs Previous)
  const radarData = useMemo(() => {
    if (formattedReports.length < 2) return [];
    const latest = formattedReports[0].biomarkers;
    const prev = formattedReports[1].biomarkers;
    
    // Normalize values roughly 0-100 for radar visual comparison
    return [
      { subject: 'Albumin', A: Math.min(100, (latest.albumin || 0) * 2), B: Math.min(100, (prev.albumin || 0) * 2) },
      { subject: 'Glucose', A: Math.min(100, (latest.glucose || 0) * 0.8), B: Math.min(100, (prev.glucose || 0) * 0.8) },
      { subject: 'pH', A: (latest.ph || 0) * 10, B: (prev.ph || 0) * 10 },
      { subject: 'Ketones', A: (latest.ketones || 0) * 30, B: (prev.ketones || 0) * 30 },
      { subject: 'Leukocyte', A: (latest.leukocyte || 0) * 50, B: (prev.leukocyte || 0) * 50 },
    ];
  }, [formattedReports]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-h2 text-foreground mb-2">Screening History</h1>
          <p className="text-body text-muted">Track your maternal health metrics over time.</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search Report ID..."
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="All">All Risk Levels</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Monitor">Monitor</option>
            <option value="Elevated Risk">Elevated Risk</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* ── Left Column: Timeline ── */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="h-full">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Report Timeline
            </h2>
            
            <div className="relative pl-6 border-l-2 border-border/60 space-y-8 py-2">
              {filteredReports.map((report: any, idx: number) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  {/* Timeline Node */}
                  <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                    report.riskScore > 85 ? 'bg-success' : report.riskScore > 70 ? 'bg-warning' : 'bg-critical'
                  }`} />
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-muted tracking-wider uppercase">Week {report.gestationalWeek}</span>
                        <h3 className="font-semibold text-foreground text-base mt-0.5">{formatDate(report.date)}</h3>
                      </div>
                      <Badge variant={report.riskScore > 85 ? 'success' : report.riskScore > 70 ? 'warning' : 'critical'}>
                        {report.riskLabel === 'NORMAL' ? 'Low Risk' : report.riskLabel === 'MILD' ? 'Monitor' : 'Elevated Risk'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                        <Activity className="w-4 h-4 text-primary" /> Score: {report.riskScore}
                      </div>
                      <Link 
                        to={`/results/${report.id}`}
                        className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
                      >
                        View Report <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredReports.length === 0 && (
                <div className="text-center py-12 px-4">
                  <Activity className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium text-muted">No historical reports found.</p>
                  <p className="text-xs text-muted/70 mt-1">Adjust your filters or upload a new sample.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Right Column: Analytics ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {filteredReports.length === 0 ? (
            <div className="h-full min-h-[400px] flex items-center justify-center p-8 bg-gray-50/50 rounded-2xl border border-dashed border-border/80">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-muted mx-auto mb-4 opacity-30" />
                <h3 className="text-base font-bold text-foreground">Analytics Unavailable</h3>
                <p className="text-sm text-muted mt-1 max-w-sm">We need at least two reports to begin generating longitudinal trend data and monthly averages.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Trend Multi-Line Chart */}
              <Card>
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  Biomarker Trends
                </h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="Score" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Glucose" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Albumin" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Radar Comparison */}
                <Card>
                  <h3 className="text-base font-bold text-foreground mb-2">Latest vs Previous</h3>
                  <p className="text-xs text-muted mb-4">Normalized analyte comparison</p>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {radarData.length > 0 ? (
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Latest" dataKey="A" stroke="#0f766e" fill="#0f766e" fillOpacity={0.5} />
                          <Radar name="Previous" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                          <Tooltip />
                        </RadarChart>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted">Need 2+ reports</div>
                      )}
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Monthly Averages */}
                <Card>
                  <h3 className="text-base font-bold text-foreground mb-2">Monthly Risk Avg</h3>
                  <p className="text-xs text-muted mb-4">Higher score indicates lower risk</p>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="avgScore" fill="#0f766e" radius={[4, 4, 0, 0]}>
                          {monthlyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.avgScore > 85 ? '#22c55e' : entry.avgScore > 70 ? '#f59e0b' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
