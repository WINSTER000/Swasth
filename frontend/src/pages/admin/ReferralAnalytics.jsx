import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  GitBranch,
  CheckCircle2,
  Clock,
  Activity,
  AlertTriangle,
  Building2,
  User,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

export const ReferralAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/analytics/government');
      setData(res.data);
    } catch (e) {
      console.error('Error loading referral analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const URGENCY_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const referralsList = data?.referrals || [];
  const filteredReferrals = referralsList.filter((ref) => {
    const patName = ref.patient?.name?.toLowerCase() || '';
    const fromName = ref.referringFacility?.name?.toLowerCase() || '';
    const toName = ref.receivingFacility?.name?.toLowerCase() || '';
    const reason = ref.reason?.toLowerCase() || '';
    const q = searchTerm.toLowerCase();

    const matchesSearch = patName.includes(q) || fromName.includes(q) || toName.includes(q) || reason.includes(q);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && (ref.status === 'SENT' || ref.status === 'PENDING')) ||
      (statusFilter === 'CONFIRMED' && (ref.status === 'CONFIRMED' || ref.status === 'ACCEPTED' || ref.status === 'APPOINTMENT_SCHEDULED')) ||
      (statusFilter === 'IN_CARE' && ref.status === 'IN_CARE') ||
      (statusFilter === 'COMPLETED' && ref.status === 'COMPLETED');

    return matchesSearch && matchesStatus;
  });

  if (loading && !data) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading district referral performance analytics...</div>;
  }

  const totalReferrals = data?.summary?.referralsCount || referralsList.length;
  const completionRate = data?.summary?.referralCompletionRate || 75;
  const emergencyCount = referralsList.filter((r) => r.urgency === 'EMERGENCY' || r.urgency === 'URGENT').length;
  const inProgressCount = referralsList.filter((r) => r.status !== 'COMPLETED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Referral Performance & Continuity Analytics
          </h2>
          <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800 flex items-center">
            <GitBranch className="w-3 h-3 mr-1" /> Multi-Tier Care Continuum
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          District-wide referral completion rate, hospital turnaround times, and bidirectional case transfers across Satara district.
        </p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Initiated Referrals"
          value={`${totalReferrals} Cases`}
          change="Rural PHC -> Specialist"
          icon={GitBranch}
          color="brand"
        />
        <StatCard
          title="Referral Completion Rate"
          value={`${completionRate}%`}
          change="Closed-loop care continuum"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="In-Progress Cases"
          value={`${inProgressCount} Active`}
          change="Awaiting specialist care"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Emergency / Urgent"
          value={`${emergencyCount} High-Priority`}
          change="Immediate clinical review"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Status Breakdown */}
        <Card title="Referral Progress Distribution Across District">
          {data?.referralStatusDistribution?.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.referralStatusDistribution}>
                  <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                    {data.referralStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-12 text-slate-400 text-xs">No referral data recorded</p>
          )}
        </Card>

        {/* Urgency Breakdown */}
        <Card title="Clinical Urgency & Triage Level Breakdown">
          {data?.urgencyDistribution?.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.urgencyDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.urgencyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={URGENCY_COLORS[index % URGENCY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-12 text-slate-400 text-xs">No urgency metrics recorded</p>
          )}
        </Card>
      </div>

      {/* District Referrals Table & Filters */}
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              Live District Referrals Directory ({filteredReferrals.length})
            </span>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'CONFIRMED', label: 'Scheduled' },
                { id: 'IN_CARE', label: 'In Care' },
                { id: 'COMPLETED', label: 'Completed' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === tab.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient name, hospital, department, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {filteredReferrals.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No referrals match the selected filters.</div>
          ) : (
            <div className="space-y-3 text-xs">
              {filteredReferrals.map((ref) => (
                <div
                  key={ref._id}
                  className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 hover:border-brand-400 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        {ref.patient?.name || 'Patient'}
                      </span>
                      <Badge variant={ref.urgency === 'EMERGENCY' ? 'danger' : ref.urgency === 'URGENT' ? 'warning' : 'info'}>
                        {ref.urgency}
                      </Badge>
                      <Badge variant={ref.status === 'COMPLETED' ? 'success' : 'info'}>
                        {ref.status}
                      </Badge>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Transfer Route */}
                  <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <span className="text-brand-600 dark:text-brand-400">{ref.referringFacility?.name || 'Primary PHC'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">{ref.receivingFacility?.name || 'District General Hospital'}</span>
                    <span className="text-slate-400 font-normal">({ref.department || 'General Medicine'})</span>
                  </div>

                  {/* Reason & Notes */}
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Reason:</strong> {ref.reason}
                  </p>
                  {ref.clinicalSummary && (
                    <p className="text-[11px] text-slate-500 italic">
                      Clinical Summary: {ref.clinicalSummary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

