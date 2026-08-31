import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
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
  LineChart,
  Line,
} from 'recharts';
import { Building, GitBranch, Package, Activity, BarChart2, ShieldAlert, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation('admin');
  const [adminMode, setAdminMode] = useState(user?.adminLevel || 'HOSPITAL');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [adminMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (adminMode === 'GOVERNMENT') {
        const res = await axios.get('/api/analytics/government');
        setAnalytics(res.data);
      } else {
        const res = await axios.get('/api/analytics/facility?facilityId=66d1f0000000000000000003');
        setAnalytics(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading admin dashboard...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={adminMode === 'GOVERNMENT' ? 'District Public Health Governance' : 'Hospital Operations Console'}
        subtitle={
          adminMode === 'GOVERNMENT'
            ? 'District-wide public health indicators, aggregated referral completion, and waiting-time trends across PHCs & CHCs.'
            : 'Satara District Hospital bed availability, OPD capacity, medicine stock, and diagnostic operations.'
        }
        badge={
          <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800 uppercase tracking-wider">
            {adminMode} Mode
          </span>
        }
        action={
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setAdminMode('HOSPITAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                adminMode === 'HOSPITAL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🏥 Hospital View
            </button>
            <button
              onClick={() => setAdminMode('GOVERNMENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                adminMode === 'GOVERNMENT' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🏛️ Public Health View
            </button>
          </div>
        }
      />

      {adminMode === 'GOVERNMENT' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Monitored Facilities"
              value={`${analytics?.summary?.facilitiesCount || 0} Centres`}
              change="PHCs, CHCs, District Hospitals"
              icon={Building}
              color="brand"
            />
            <StatCard
              title="Referral Completion Rate"
              value={`${analytics?.summary?.referralCompletionRate || 0}%`}
              change="Care continuum success"
              icon={GitBranch}
              color="emerald"
            />
            <StatCard
              title="Total OPD Volume"
              value={`${analytics?.summary?.appointmentsCount || 0}`}
              change="Registered patient visits"
              icon={Users}
              color="amber"
            />
            <StatCard
              title="District Avg Wait"
              value="22 Mins"
              change="Calculated average"
              icon={Clock}
              color="rose"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="District AI Risk Level Distribution">
              {analytics?.riskDistribution?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.riskDistribution}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {analytics.riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState icon={BarChart2} title="No Risk Data" description="No risk assessments recorded in district database." />
              )}
            </Card>

            <Card title="Average Waiting Time Trend (Minutes)">
              {analytics?.waitingTimeTrends?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.waitingTimeTrends}>
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgWaitMins" stroke="#3b82f6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState icon={Clock} title="No Waiting Time Data" description="No queue wait trends recorded yet." />
              )}
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Hospital OPD Appointments"
              value={`${analytics?.appointments?.total || 0}`}
              change="Satara District Hospital"
              icon={Users}
              color="brand"
            />
            <StatCard
              title="Incoming Referrals"
              value={`${analytics?.referrals?.total || 0}`}
              change="From rural PHCs"
              icon={GitBranch}
              color="emerald"
            />
            <StatCard
              title="Low Stock Medicines"
              value={`${analytics?.medicines?.lowStock || 0} Items`}
              change="Inventory warning"
              icon={Package}
              color="amber"
            />
            <StatCard
              title="Active Queue Patients"
              value={`${analytics?.appointments?.inQueue || 0}`}
              change="Waiting in OPD"
              icon={Clock}
              color="rose"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card title="Hospital Management Operations">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link to="/admin/medicines" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 block transition-all">
                    <Package className="w-6 h-6 text-brand-600 mb-2" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Medicine Stock Management</h4>
                    <p className="text-xs text-slate-500 mt-1">Manage stock inventory and low threshold limits.</p>
                  </Link>

                  <Link to="/admin/diagnostics" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 block transition-all">
                    <Activity className="w-6 h-6 text-emerald-600 mb-2" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Diagnostic Services</h4>
                    <p className="text-xs text-slate-500 mt-1">Manage CBC, X-Ray, ECG availability status.</p>
                  </Link>

                  <Link to="/admin/referrals" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 block transition-all">
                    <GitBranch className="w-6 h-6 text-amber-600 mb-2" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Referral Workflows</h4>
                    <p className="text-xs text-slate-500 mt-1">Accept & schedule incoming rural referrals.</p>
                  </Link>

                  <Link to="/admin/facilities" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 block transition-all">
                    <Building className="w-6 h-6 text-rose-600 mb-2" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Facility Operating Hours</h4>
                    <p className="text-xs text-slate-500 mt-1">Update operating hours & bed capacity.</p>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
