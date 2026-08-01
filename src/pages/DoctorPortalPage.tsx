import React, { useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Download, ChevronRight, Activity, 
  Calendar, CheckCircle2, MessageSquare, Plus, GitMerge, ArrowLeft
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, Badge, Button } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { mockPatientsList, PatientInfo, Report } from '@/data/mockData';
import { exportToCsv } from '@/utils/exportCsv';
import { BIOMARKERS } from '@/data/biomarkers';

// Helper component: Reusing the Biomarker Card layout roughly for the "Latest Results" review
const MiniBiomarkerCard = ({ bKey, data, reference }: { bKey: string, data: any, reference: any }) => {
  return (
    <div className="bg-white border border-border p-3 rounded-lg flex items-center justify-between">
      <div>
        <div className="text-xs font-bold text-muted uppercase">{reference.name}</div>
        <div className="text-lg font-extrabold text-foreground mt-0.5">
          {data.value} <span className="text-xs font-medium text-muted">{data.unit}</span>
        </div>
      </div>
      <Badge variant={data.status === 'normal' ? 'success' : data.status === 'abnormal' ? 'warning' : 'critical'} className="text-[0.6rem] px-2 py-0.5">
        {data.status}
      </Badge>
    </div>
  );
};

const DoctorPortalPage: React.FC = () => {
  const user = useAppStore((state) => state.user);

  // Router protection
  if (!user || user.role === 'patient') {
    return <Navigate to="/dashboard" replace />;
  }

  const [activeView, setActiveView] = useState<'directory' | 'patient' | 'compare'>('directory');
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  
  // Directory state
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  // Compare state
  const [compareReport1, setCompareReport1] = useState<string>('');
  const [compareReport2, setCompareReport2] = useState<string>('');

  // Local state to handle comments & approvals (mock mutations)
  const [patientsData, setPatientsData] = useState<PatientInfo[]>(mockPatientsList);
  const [newComment, setNewComment] = useState('');

  // ── Directory Logic ──
  const filteredPatients = useMemo(() => {
    return patientsData.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const latestReport = p.reports?.[0];
      const risk = latestReport?.riskLabel || 'Low Risk';
      const matchesRisk = riskFilter === 'All' || risk === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [patientsData, searchTerm, riskFilter]);

  const handleExportDirectory = () => {
    const exportData = filteredPatients.map(p => ({
      ID: p.id,
      Name: p.name,
      Age: p.age,
      GestationalWeek: p.gestationalWeek,
      LatestRiskScore: p.reports?.[0]?.riskScore || 'N/A',
      LatestRiskLabel: p.reports?.[0]?.riskLabel || 'N/A',
      LastVisit: p.lastVisit
    }));
    exportToCsv('femflou_patient_directory.csv', exportData);
  };

  const handleExportPatientHistory = () => {
    if (!selectedPatient || !selectedPatient.reports) return;
    const exportData = selectedPatient.reports.map(r => ({
      ReportID: r.id,
      Date: r.date,
      GestationalWeek: r.gestationalWeek,
      RiskScore: r.riskScore,
      RiskLabel: r.riskLabel,
      Albumin: r.biomarkers.albumin,
      Glucose: r.biomarkers.glucose,
      Ketones: r.biomarkers.ketones,
      Leukocyte: r.biomarkers.leukocyte,
      Nitrite: r.biomarkers.nitrite,
      pH: r.biomarkers.ph,
      Approved: r.approved ? 'Yes' : 'No'
    }));
    exportToCsv(`femflou_history_${selectedPatient.id}.csv`, exportData);
  };

  // ── Mutation Logic (Mock) ──
  const handleApproveReport = (reportId: string) => {
    setPatientsData(prev => prev.map(p => {
      if (p.id !== selectedPatient?.id) return p;
      const updatedReports = p.reports?.map(r => r.id === reportId ? { ...r, approved: true } : r);
      const updatedPatient = { ...p, reports: updatedReports };
      if (selectedPatient?.id === p.id) setSelectedPatient(updatedPatient);
      return updatedPatient;
    }));
  };

  const handleAddComment = (reportId: string) => {
    if (!newComment.trim()) return;
    setPatientsData(prev => prev.map(p => {
      if (p.id !== selectedPatient?.id) return p;
      const updatedReports = p.reports?.map(r => {
        if (r.id === reportId) {
          const comments = r.comments || [];
          return {
            ...r,
            comments: [...comments, { text: newComment, doctor: user.name, date: new Date().toISOString() }]
          };
        }
        return r;
      });
      const updatedPatient = { ...p, reports: updatedReports };
      if (selectedPatient?.id === p.id) setSelectedPatient(updatedPatient);
      return updatedPatient;
    }));
    setNewComment('');
  };

  // ── Compare Logic ──
  const compareData = useMemo(() => {
    if (!selectedPatient || !compareReport1 || !compareReport2) return [];
    const r1 = selectedPatient.reports?.find(r => r.id === compareReport1);
    const r2 = selectedPatient.reports?.find(r => r.id === compareReport2);
    if (!r1 || !r2) return [];

    return Object.keys(r1.biomarkers).map(key => {
      const bKey = key as keyof typeof r1.biomarkers;
      const val1 = r1.biomarkers[bKey];
      const val2 = r2.biomarkers[bKey];
      // Calculate delta percentage for visual flair
      const delta = val1 === 0 ? 0 : ((val2 - val1) / val1) * 100;
      
      return {
        name: BIOMARKERS[bKey].name,
        [r1.date]: val1,
        [r2.date]: val2,
        delta: delta.toFixed(1) + '%'
      };
    });
  }, [selectedPatient, compareReport1, compareReport2]);


  // ================= RENDER DIRECTORY =================
  if (activeView === 'directory') {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-h2 text-foreground mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Patient Directory
            </h1>
            <p className="text-body text-muted">Manage patients, review latest screening reports, and approve clinical data.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search patient name or ID..."
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
              <option value="Critical">Critical</option>
            </select>
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportDirectory}>
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-border/50 text-muted uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">Patient</th>
                  <th className="px-6 py-4 font-bold">Gestational Wk</th>
                  <th className="px-6 py-4 font-bold">Latest Report</th>
                  <th className="px-6 py-4 font-bold">Risk Status</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredPatients.map(patient => {
                  const latestReport = patient.reports?.[0];
                  const needsReview = latestReport && !latestReport.approved;
                  
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground text-base">{patient.name}</div>
                        <div className="text-xs text-muted font-mono mt-0.5">{patient.id} • Age {patient.age}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">Week {patient.gestationalWeek}</td>
                      <td className="px-6 py-4">
                        <div className="text-foreground">{latestReport?.date || 'No reports'}</div>
                        {needsReview && <span className="text-[0.65rem] font-bold text-warning uppercase bg-warning/10 px-2 py-0.5 rounded mt-1 inline-block">Needs Review</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={latestReport?.riskScore && latestReport.riskScore > 85 ? 'success' : latestReport?.riskScore && latestReport.riskScore > 70 ? 'warning' : latestReport?.riskScore ? 'critical' : 'secondary'}>
                          {latestReport?.riskLabel || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                          onClick={() => {
                            setSelectedPatient(patient);
                            setActiveView('patient');
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPatients.length === 0 && (
              <div className="p-8 text-center text-muted">No patients found matching your search.</div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ================= RENDER PATIENT DETAIL =================
  if (activeView === 'patient' && selectedPatient) {
    const latestReport = selectedPatient.reports?.[0];

    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        <button 
          onClick={() => setActiveView('directory')}
          className="flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold border border-primary/20">
              {selectedPatient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-h2 text-foreground">{selectedPatient.name}</h1>
              <p className="text-sm text-muted font-mono">{selectedPatient.id} • {selectedPatient.age} y/o • G.W. {selectedPatient.gestationalWeek}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              leftIcon={<GitMerge className="w-4 h-4" />}
              onClick={() => {
                if (selectedPatient.reports && selectedPatient.reports.length >= 2) {
                  setCompareReport1(selectedPatient.reports[0].id);
                  setCompareReport2(selectedPatient.reports[1].id);
                  setActiveView('compare');
                } else {
                  alert("Not enough reports to compare.");
                }
              }}
            >
              Compare Visits
            </Button>
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportPatientHistory}>
              Export History
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Latest Report Review Panel */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-t-4 border-t-primary">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Latest Report Review</h2>
                  <p className="text-sm text-muted">ID: {latestReport?.id} • {latestReport?.date}</p>
                </div>
                {latestReport?.approved ? (
                  <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>
                ) : (
                  <Badge variant="warning" className="animate-pulse">Needs Review</Badge>
                )}
              </div>

              {latestReport && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {Object.entries(latestReport.biomarkers).map(([key, value]) => {
                       const bConfig = BIOMARKERS[key as keyof typeof BIOMARKERS];
                       // Simple mock status derivation just for the mini card display
                       let status = 'normal';
                       if (key === 'glucose' && value > 100) status = 'abnormal';
                       if (key === 'albumin' && value > 20) status = 'abnormal';
                       return <MiniBiomarkerCard key={key} bKey={key} data={{ value, unit: bConfig.unit, status }} reference={bConfig} />;
                    })}
                  </div>

                  {/* Actions & Comments */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-border/50">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-secondary" /> Clinical Comments
                    </h3>
                    
                    <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
                      {latestReport.comments?.map((c, i) => (
                        <div key={i} className="bg-white p-3 rounded-lg border border-border/40 text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-foreground text-xs">{c.doctor}</span>
                            <span className="text-[0.65rem] text-muted">{new Date(c.date).toLocaleString()}</span>
                          </div>
                          <p className="text-foreground/80">{c.text}</p>
                        </div>
                      ))}
                      {(!latestReport.comments || latestReport.comments.length === 0) && (
                        <div className="text-xs text-muted text-center py-2">No comments recorded.</div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add an observation..." 
                        className="flex-1 text-sm rounded-lg border border-border px-3 focus:outline-none focus:border-primary"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddComment(latestReport.id)}
                      />
                      <Button size="sm" onClick={() => handleAddComment(latestReport.id)}>Add</Button>
                    </div>

                    {!latestReport.approved && (
                      <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                        <Button variant="primary" onClick={() => handleApproveReport(latestReport.id)}>
                          Approve Report
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Timeline View */}
          <div className="lg:col-span-5">
            <Card className="h-full bg-gray-50/50">
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Screening History
              </h2>
              
              <div className="relative pl-6 border-l-2 border-border/60 space-y-6 py-2">
                {selectedPatient.reports?.map((report, idx) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                      report.riskScore > 85 ? 'bg-success' : report.riskScore > 70 ? 'bg-warning' : 'bg-critical'
                    }`} />
                    
                    <div className="bg-white rounded-xl p-3 border border-border/50 hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-bold text-muted tracking-wider uppercase">Week {report.gestationalWeek}</span>
                          <h3 className="font-bold text-foreground text-sm mt-0.5">{report.date}</h3>
                        </div>
                        <Badge variant={report.riskScore > 85 ? 'success' : report.riskScore > 70 ? 'warning' : 'critical'} className="text-[0.65rem] px-2 py-0">
                          {report.riskLabel}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-medium text-muted">ID: {report.id}</span>
                        {report.approved ? (
                           <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                           <span className="text-[0.65rem] font-bold text-warning uppercase">Pending</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER COMPARE =================
  if (activeView === 'compare' && selectedPatient) {
    const r1 = selectedPatient.reports?.find(r => r.id === compareReport1);
    const r2 = selectedPatient.reports?.find(r => r.id === compareReport2);

    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        <button 
          onClick={() => setActiveView('patient')}
          className="flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Profile
        </button>

        <div>
          <h1 className="text-h2 text-foreground mb-2 flex items-center gap-3">
            <GitMerge className="w-8 h-8 text-secondary" />
            Compare Visits: {selectedPatient.name}
          </h1>
          <p className="text-body text-muted">Select two historical reports to analyze longitudinal biomarker deltas.</p>
        </div>

        <Card className="bg-gradient-to-br from-gray-50 to-white">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-8 p-4 bg-white rounded-xl border border-border/50 shadow-sm">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-muted uppercase tracking-widest mb-1 block">Baseline Report</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={compareReport1}
                onChange={(e) => setCompareReport1(e.target.value)}
              >
                {selectedPatient.reports?.map(r => <option key={r.id} value={r.id}>{r.date} (Wk {r.gestationalWeek})</option>)}
              </select>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-muted font-bold mt-4 md:mt-0">VS</div>
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-muted uppercase tracking-widest mb-1 block">Comparison Report</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={compareReport2}
                onChange={(e) => setCompareReport2(e.target.value)}
              >
                {selectedPatient.reports?.map(r => <option key={r.id} value={r.id}>{r.date} (Wk {r.gestationalWeek})</option>)}
              </select>
            </div>
          </div>

          {r1 && r2 && (
            <div className="h-[400px] w-full mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compareData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey={r1.date} name={`Baseline (${r1.date})`} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={r2.date} name={`Comparison (${r2.date})`} fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Delta Data Table */}
          <div className="mt-8 overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-y border-border/50 text-muted uppercase text-[0.65rem] tracking-widest">
                  <tr>
                    <th className="px-4 py-3 font-bold">Biomarker</th>
                    <th className="px-4 py-3 font-bold">Baseline ({r1?.date})</th>
                    <th className="px-4 py-3 font-bold">Comparison ({r2?.date})</th>
                    <th className="px-4 py-3 font-bold text-right">Delta (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {compareData.map((d, i) => {
                    const isPositive = parseFloat(d.delta) > 0;
                    const isZero = parseFloat(d.delta) === 0;
                    return (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-foreground">{d.name}</td>
                        <td className="px-4 py-3 text-muted">{d[r1!.date]}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{d[r2!.date]}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            isZero ? 'bg-gray-100 text-gray-500' : 
                            isPositive ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                          }`}>
                            {isPositive ? '+' : ''}{d.delta}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
             </table>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default DoctorPortalPage;
