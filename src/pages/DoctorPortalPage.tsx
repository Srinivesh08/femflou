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
import { usePatientsList, useApproveReport, useAddComment, useCompareReports } from '@/hooks/queries';
import apiClient from '@/lib/apiClient';
import { BIOMARKERS } from '@/data/biomarkers';

// Helper component: Reusing the Biomarker Card layout roughly for the "Latest Results" review
const MiniBiomarkerCard = ({ bKey, data, reference }: { bKey: string, data: { value: number; unit: string; status: string }, reference: typeof BIOMARKERS[keyof typeof BIOMARKERS] }) => {
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
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  // Directory state
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  // Compare state
  const [compareReport1, setCompareReport1] = useState<string>('');
  const [compareReport2, setCompareReport2] = useState<string>('');

  const [newComment, setNewComment] = useState('');

  // Fetch from API
  const { data: patientsData, isLoading } = usePatientsList(searchTerm, riskFilter, 1, 100);
  const approveMutation = useApproveReport();
  const commentMutation = useAddComment();
  const { data: compareResult } = useCompareReports(compareReport1, compareReport2);

  const filteredPatients = patientsData?.data || [];

  const handleExportDirectory = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (riskFilter !== 'All') params.append('riskLevel', riskFilter);
      params.append('format', 'csv');
      
      const response = await apiClient.get(`/patients/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `femflou_patients.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error('Failed to export CSV', e);
    }
  };

  const handleExportPatientHistory = () => {
    // Basic CSV export for patient history (we could use an API for this too, but we'll do it manually here if needed or omit it).
  };

  // ── Mutation Logic (Mock) ──
  const handleApproveReport = async (reportId: string) => {
    await approveMutation.mutateAsync(reportId);
    // Optimistically update local selectedPatient state if needed, or trigger a re-fetch of the patient details.
    if (selectedPatient) {
      setSelectedPatient({
        ...selectedPatient,
        reports: selectedPatient.reports.map((r: any) => r.id === reportId ? { ...r, reviewedByDoctorId: user.id } : r)
      });
    }
  };

  const handleAddComment = async (reportId: string) => {
    if (!newComment.trim()) return;
    await commentMutation.mutateAsync({ reportId, text: newComment });
    setNewComment('');
    // Optimistically update local
    if (selectedPatient) {
      setSelectedPatient({
        ...selectedPatient,
        reports: selectedPatient.reports.map((r: any) => {
          if (r.id === reportId) {
            return {
              ...r,
              doctorComments: [...(r.doctorComments || []), { text: newComment, doctor: { name: user.name }, createdAt: new Date().toISOString() }]
            };
          }
          return r;
        })
      });
    }
  };

  // ── Compare Logic ──
  const compareData = useMemo(() => {
    if (!compareResult || !compareResult.deltas) return [];
    
    // Transform backend deltas to Recharts expected format
    return Object.entries(compareResult.deltas).map(([biomarker, info]: [string, any]) => {
      return {
        name: biomarker,
        [compareResult.reportA.createdAt]: info.oldValue,
        [compareResult.reportB.createdAt]: info.newValue,
        delta: (info.deltaPercentage).toFixed(1) + '%'
      };
    });
  }, [compareResult]);


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
                {filteredPatients.map((patient: any) => {
                  const latestReport = patient.reports?.[0];
                  const needsReview = latestReport && !latestReport.reviewedByDoctorId;
                  
                  // Compute age from dob
                  let age = '--';
                  if (patient.dateOfBirth) {
                    const diff = Date.now() - new Date(patient.dateOfBirth).getTime();
                    age = Math.abs(new Date(diff).getUTCFullYear() - 1970).toString();
                  }

                  const riskScore = latestReport ? Math.round(latestReport.overallRiskScore) : 0;
                  const riskLabel = riskScore > 66 ? 'CRITICAL' : riskScore > 33 ? 'HIGH' : riskScore > 0 ? 'MILD' : 'NORMAL';

                  return (
                    <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground text-base">{patient.user?.name}</div>
                        <div className="text-xs text-muted font-mono mt-0.5">{patient.id.substring(0, 8)} • Age {age}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">Week {patient.currentGestationalWeek}</td>
                      <td className="px-6 py-4">
                        <div className="text-foreground">{latestReport ? new Date(latestReport.createdAt).toLocaleDateString() : 'No reports'}</div>
                        {needsReview && <span className="text-[0.65rem] font-bold text-warning uppercase bg-warning/10 px-2 py-0.5 rounded mt-1 inline-block">Needs Review</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={riskScore > 66 ? 'critical' : riskScore > 33 ? 'warning' : 'success'}>
                          {latestReport ? riskLabel : 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                          onClick={() => {
                            setSelectedPatient({
                              ...patient,
                              name: patient.user?.name,
                              age,
                              gestationalWeek: patient.currentGestationalWeek
                            });
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
                  <p className="text-sm text-muted">ID: {latestReport?.id?.substring(0, 8)} • {new Date(latestReport?.createdAt || '').toLocaleString()}</p>
                </div>
                {latestReport?.reviewedByDoctorId ? (
                  <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>
                ) : (
                  <Badge variant="warning" className="animate-pulse">Needs Review</Badge>
                )}
              </div>

              {latestReport && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {latestReport.sample?.biomarkerResults?.map((result: any) => {
                       const key = result.biomarkerType.toLowerCase();
                       const bConfig = BIOMARKERS[key as keyof typeof BIOMARKERS] || { name: result.biomarkerType, unit: result.unit };
                       let status = 'normal';
                       if (result.riskStatus === 'MILD') status = 'abnormal';
                       if (result.riskStatus === 'HIGH' || result.riskStatus === 'CRITICAL') status = 'critical';

                       return <MiniBiomarkerCard key={key} bKey={key} data={{ value: result.measuredValue, unit: result.unit, status }} reference={bConfig} />;
                    })}
                  </div>

                  {/* Actions & Comments */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-border/50">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-secondary" /> Clinical Comments
                    </h3>
                    
                    <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
                      {latestReport.doctorComments?.map((c: any, i: number) => (
                        <div key={i} className="bg-white p-3 rounded-lg border border-border/40 text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-foreground text-xs">{c.doctor?.name || 'Doctor'}</span>
                            <span className="text-[0.65rem] text-muted">{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-foreground/80">{c.text}</p>
                        </div>
                      ))}
                      {(!latestReport.doctorComments || latestReport.doctorComments.length === 0) && (
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
                      <Button size="sm" onClick={() => handleAddComment(latestReport.id)} isLoading={commentMutation.isPending}>Add</Button>
                    </div>

                    {!latestReport.reviewedByDoctorId && (
                      <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                        <Button variant="primary" onClick={() => handleApproveReport(latestReport.id)} isLoading={approveMutation.isPending}>
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
                {selectedPatient.reports?.map((report: any, idx: number) => {
                  const riskScore = Math.round(report.overallRiskScore);
                  const riskLabel = riskScore > 66 ? 'CRITICAL' : riskScore > 33 ? 'HIGH' : riskScore > 0 ? 'MILD' : 'NORMAL';

                  return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                      riskScore > 66 ? 'bg-critical' : riskScore > 33 ? 'bg-warning' : 'bg-success'
                    }`} />
                    
                    <div className="bg-white rounded-xl p-3 border border-border/50 hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-bold text-muted tracking-wider uppercase">Week {report.sample?.patient?.currentGestationalWeek || '--'}</span>
                          <h3 className="font-bold text-foreground text-sm mt-0.5">{new Date(report.createdAt).toLocaleDateString()}</h3>
                        </div>
                        <Badge variant={riskScore > 66 ? 'critical' : riskScore > 33 ? 'warning' : 'success'} className="text-[0.65rem] px-2 py-0">
                          {riskLabel}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-medium text-muted">ID: {report.id.substring(0, 8)}</span>
                        {report.reviewedByDoctorId ? (
                           <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                           <span className="text-[0.65rem] font-bold text-warning uppercase">Pending</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )})}
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
                {selectedPatient.reports?.map((r: any) => <option key={r.id} value={r.id}>{new Date(r.createdAt).toLocaleDateString()}</option>)}
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
                {selectedPatient.reports?.map((r: any) => <option key={r.id} value={r.id}>{new Date(r.createdAt).toLocaleDateString()}</option>)}
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
                    <th className="px-4 py-3 font-bold">Baseline ({compareResult?.reportA?.createdAt ? new Date(compareResult.reportA.createdAt).toLocaleDateString() : '?'})</th>
                    <th className="px-4 py-3 font-bold">Comparison ({compareResult?.reportB?.createdAt ? new Date(compareResult.reportB.createdAt).toLocaleDateString() : '?'})</th>
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
                        <td className="px-4 py-3 text-muted">{d[compareResult?.reportA?.createdAt]}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{d[compareResult?.reportB?.createdAt]}</td>
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
