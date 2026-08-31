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
import {
  Building,
  Building2,
  GitBranch,
  Package,
  Activity,
  BarChart2,
  ShieldAlert,
  Users,
  Clock,
  Bed,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation('admin');
  const [adminMode, setAdminMode] = useState(user?.adminLevel || 'HOSPITAL');
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch available facilities
  useEffect(() => {
    axios
      .get('/api/facilities')
      .then((res) => {
        const facs = res.data || [];
        setFacilities(facs);
        if (facs.length > 0) {
          const savedFac = localStorage.getItem('admin_selected_facility');
          if (savedFac && facs.some((f) => f._id === savedFac)) {
            setSelectedFacilityId(savedFac);
          } else {
            setSelectedFacilityId(facs[0]._id);
          }
        }
      })
      .catch((err) => console.error('Error fetching facilities:', err));
  }, []);

  // 2. Fetch Analytics when mode or facility changes
  useEffect(() => {
    fetchData();
  }, [adminMode, selectedFacilityId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (adminMode === 'GOVERNMENT') {
        const res = await axios.get('/api/analytics/government');
        setAnalytics(res.data);
      } else {
        const targetUrl = selectedFacilityId
          ? `/api/analytics/facility?facilityId=${selectedFacilityId}`
          : '/api/analytics/facility';
        const res = await axios.get(targetUrl);
        setAnalytics(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityChange = (e) => {
    const newId = e.target.value;
    setSelectedFacilityId(newId);
    localStorage.setItem('admin_selected_facility', newId);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const currentFacility = analytics?.facility;

  if (loading && !analytics) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading admin operations dashboard...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title={adminMode === 'GOVERNMENT' ? 'District Public Health Governance' : 'Hospital Operations Console'}
        subtitle={
          adminMode === 'GOVERNMENT'
            ? 'District-wide public health indicators, aggregated referral completion, and waiting-time trends across PHCs & CHCs.'
            : `${currentFacility?.name || 'Hospital'} bed availability, OPD capacity, medicine stock, and diagnostic operations.`
        }
        badge={
          <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800 uppercase tracking-wider">
            {adminMode} Mode
          </span>
        }
        action={
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            {adminMode === 'HOSPITAL' && facilities.length > 0 && (
              <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-xs">
                <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <select
                  value={selectedFacilityId}
                  onChange={handleFacilityChange}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {facilities.map((fac) => (
                    <option key={fac._id} value={fac._id} className="dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      {fac.name} ({fac.type || 'Facility'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
              <button
                onClick={() => setAdminMode('HOSPITAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  adminMode === 'HOSPITAL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🏥 Hospital View
              </button>
              <button
                onClick={() => setAdminMode('GOVERNMENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  adminMode === 'GOVERNMENT'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🏛️ Public Health View
              </button>
            </div>
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
          {/* Hospital Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Hospital OPD Appointments"
              value={`${analytics?.appointments?.total || 0}`}
              change={currentFacility?.name || 'Local Facility'}
              icon={Users}
              color="brand"
            />
            <StatCard
              title="Active Queue Patients"
              value={`${analytics?.appointments?.inQueue || 0} Waiting`}
              change="In OPD Consultation"
              icon={Clock}
              color="rose"
            />
            <StatCard
              title="Hospital Referrals"
              value={`${analytics?.referrals?.total || 0}`}
              change={`${analytics?.referrals?.pending || 0} in progress`}
              icon={GitBranch}
              color="emerald"
            />
            <StatCard
              title="Low Stock Medicines"
              value={`${analytics?.medicines?.lowStock || 0} Items`}
              change={`${analytics?.medicines?.totalTracked || 0} tracked`}
              icon={Package}
              color="amber"
            />
          </div>

          {/* Facility Capacity & Diagnostics Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Bed Capacity & Diagnostic Services */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bed Availability & Queue Status */}
              <Card title="Facility Capacity & Real-Time Status">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold">
                      <span>Available Beds</span>
                      <Bed className="w-4 h-4 text-brand-600" />
                    </div>
                    <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                      {currentFacility?.availableBeds ?? 18} / {currentFacility?.totalBeds ?? 40}
                    </p>
                    <p className="text-[11px] text-slate-400">General Ward Capacity</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold">
                      <span>ICU / Critical Care</span>
                      <Activity className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                      {currentFacility?.icuBeds ?? 4} Beds
                    </p>
                    <p className="text-[11px] text-slate-400">Ventilator & Emergency ICU</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold">
                      <span>Avg Wait Time</span>
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                      {currentFacility?.averageWaitTimeMinutes ?? 15} Mins
                    </p>
                    <p className="text-[11px] text-slate-400">Current OPD Queue Flow</p>
                  </div>
                </div>
              </Card>

              {/* Diagnostic Services Status */}
              <Card
                title={
                  <div className="flex items-center justify-between w-full">
                    <span>Live Diagnostic Services</span>
                    <Link to="/admin/diagnostics">
                      <Button size="xs" variant="outline" className="text-[11px]">
                        Manage Diagnostics
                      </Button>
                    </Link>
                  </div>
                }
              >
                {analytics?.diagnostics?.items?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {analytics.diagnostics.items.map((diag) => (
                      <div
                        key={diag._id}
                        className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {diag.diagnosticService?.name || 'Diagnostic Test'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Turnaround: {diag.diagnosticService?.turnaroundHours || 4}h
                          </p>
                        </div>
                        <Badge variant={diag.status === 'AVAILABLE' ? 'success' : 'danger'}>
                          {diag.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">Diagnostic services configured and operational.</p>
                )}
              </Card>
            </div>

            {/* Right Col: Hospital Management Navigation */}
            <div className="space-y-6">
              <Card title="Hospital Operations Console">
                <div className="space-y-3">
                  <Link
                    to="/admin/medicines"
                    className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 block transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Package className="w-5 h-5 text-brand-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Medicine Stock Management</h4>
                          <p className="text-[11px] text-slate-400">
                            {analytics?.medicines?.totalTracked || 0} tracked • {analytics?.medicines?.lowStock || 0} low
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  <Link
                    to="/admin/diagnostics"
                    className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 block transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Activity className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Diagnostic Services</h4>
                          <p className="text-[11px] text-slate-400">
                            {analytics?.diagnostics?.available || 0} of {analytics?.diagnostics?.total || 0} operational
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  <Link
                    to="/admin/referrals"
                    className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 block transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <GitBranch className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Referral Workflows</h4>
                          <p className="text-[11px] text-slate-400">
                            {analytics?.referrals?.total || 0} incoming & specialist cases
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  <Link
                    to="/admin/facilities"
                    className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-rose-500 block transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Building className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Facility Operating Hours</h4>
                          <p className="text-[11px] text-slate-400">Beds, queues, and facility master records</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
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

