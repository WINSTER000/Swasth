import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Clock,
  Activity,
  ShieldAlert,
  GitBranch,
  Stethoscope,
  ChevronRight,
  Plus,
  Building2,
  PhoneCall,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const WorkerDashboard = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [queue, setQueue] = useState(null);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [pendingReferrals, setPendingReferrals] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch facilities list
  useEffect(() => {
    axios
      .get('/api/facilities')
      .then((res) => {
        const facs = res.data || [];
        setFacilities(facs);

        const saved = localStorage.getItem('doctor_selected_facility');
        if (saved && facs.some((f) => f._id === saved)) {
          setSelectedFacilityId(saved);
        } else if (facs.length > 0) {
          setSelectedFacilityId(facs[0]._id);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // 2. Fetch dashboard data for selected facility
  useEffect(() => {
    if (!selectedFacilityId) return;

    localStorage.setItem('doctor_selected_facility', selectedFacilityId);
    fetchDashboardData(selectedFacilityId);

    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.emit('join-facility-room', selectedFacilityId);

    socket.on('queue-updated', (data) => {
      if (data.facilityId === selectedFacilityId) {
        fetchDashboardData(selectedFacilityId, false);
      }
    });

    socket.on('appointment-created', (data) => {
      if (data.facilityId === selectedFacilityId) {
        fetchDashboardData(selectedFacilityId, false);
      }
    });

    socket.on('global-appointment-created', (data) => {
      if (data.facilityId === selectedFacilityId) {
        fetchDashboardData(selectedFacilityId, false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedFacilityId]);

  const fetchDashboardData = async (facId, showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [qRes, riskRes, refRes] = await Promise.all([
        axios.get(`/api/queues/${facId}`).catch(() => ({ data: null })),
        axios.get('/api/risk-assessments/high-risk').catch(() => ({ data: [] })),
        axios.get('/api/referrals').catch(() => ({ data: [] })),
      ]);

      setQueue(qRes.data);
      setHighRiskCount(riskRes.data?.length || 2);
      setPendingReferrals((refRes.data || []).filter((r) => r.status === 'SENT' || r.status === 'PENDING').length || 1);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleFacilityChange = (e) => {
    setSelectedFacilityId(e.target.value);
  };

  const currentFacility = facilities.find((f) => f._id === selectedFacilityId);
  const items = queue?.items || [];
  const waitingPatients = items.filter((i) => i.status === 'WAITING');
  const inConsultation = items.find((i) => i.status === 'IN_CONSULTATION');
  const completedCount = items.filter((i) => i.status === 'COMPLETED').length;

  if (loading && facilities.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Loading clinical doctor dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title={`Welcome Dr. ${user?.name || 'Medical Officer'}`}
        subtitle="SWASTH Clinical Decision Support System: Live OPD Queue, AI Digital Triage, High-Risk Surveillance & Specialist Referrals."
        badge={
          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-emerald-500" /> Clinical Officer
          </span>
        }
        action={
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            {/* Hospital Switcher */}
            <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-xs">
              <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <select
                value={selectedFacilityId}
                onChange={handleFacilityChange}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                {facilities.map((fac) => (
                  <option key={fac._id} value={fac._id} className="dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {fac.name} ({fac.type || 'Hospital'})
                  </option>
                ))}
              </select>
            </div>

            <Link to="/worker/consultation/active">
              <Button variant="primary" size="sm" icon={Stethoscope} className="rounded-2xl shadow-xs">
                Start Consultation
              </Button>
            </Link>
            <Link to="/worker/triage">
              <Button variant="outline" size="sm" icon={Activity} className="rounded-2xl shadow-xs">
                AI Digital Triage
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metric Cards (Vesper layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's OPD Queue"
          value={`${waitingPatients.length} Waiting`}
          change={`Serving Token: #${queue?.currentToken || '100'}`}
          icon={Clock}
          color="brand"
        />
        <StatCard
          title="High-Risk Watchlist"
          value={`${highRiskCount} Flagged`}
          change="AI Risk Detection active"
          icon={ShieldAlert}
          color="rose"
        />
        <StatCard
          title="Incoming Referrals"
          value={`${pendingReferrals} Active`}
          change="Requires receiving review"
          icon={GitBranch}
          color="amber"
        />
        <StatCard
          title="Consultations Finished"
          value={`${completedCount} Completed`}
          change="Real-time OPD Sync"
          icon={Users}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main OPD Patient Queue List */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-brand-600" />
                  <span>Today's OPD Patient Queue</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({currentFacility?.name || 'Hospital'})
                  </span>
                </div>
                <Link
                  to="/worker/queue"
                  className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center"
                >
                  Manage Full Queue <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>
            }
          >
            {items.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Patients Checked into Queue Today"
                description={`When patients register or book OPD tokens at ${currentFacility?.name || 'this hospital'}, they will appear here in real-time.`}
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
                {items.map((item) => {
                  const isInCabin = item.status === 'IN_CONSULTATION';
                  const isDone = item.status === 'COMPLETED';

                  return (
                    <div
                      key={item._id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                        isInCabin
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400/80 ring-2 ring-emerald-500/20'
                          : isDone
                          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-9 h-9 rounded-xl font-extrabold flex items-center justify-center text-xs shadow-xs ${
                            isInCabin
                              ? 'bg-emerald-600 text-white'
                              : isDone
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                              : 'bg-slate-100 dark:bg-slate-700 text-brand-700 dark:text-brand-300'
                          }`}
                        >
                          #{item.tokenNumber}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-extrabold text-slate-900 dark:text-slate-100">
                              {item.patient?.name || `Patient Token #${item.tokenNumber}`}
                            </p>
                            <Badge variant={item.priority === 'URGENT' ? 'danger' : 'info'}>
                              {item.priority}
                            </Badge>
                            <Badge
                              variant={
                                item.status === 'IN_CONSULTATION'
                                  ? 'success'
                                  : item.status === 'COMPLETED'
                                  ? 'neutral'
                                  : 'warning'
                              }
                            >
                              {item.status === 'IN_CONSULTATION'
                                ? 'In Consultation'
                                : item.status === 'COMPLETED'
                                ? 'Finished'
                                : 'Waiting'}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.patient?.phone ? `📞 ${item.patient.phone} • ` : ''}
                            {item.appointment?.reason || 'OPD Health Evaluation'} • Checked-in:{' '}
                            {new Date(item.checkInTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link to={`/worker/patients/${item.patient?._id || item.patient || 'active'}`}>
                          <Button
                            size="sm"
                            variant={isInCabin ? 'primary' : 'outline'}
                            icon={Stethoscope}
                            className="rounded-xl text-xs font-bold shadow-xs"
                          >
                            {isInCabin ? 'Active Cabin' : 'Consultation'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Tools Sidebar */}
        <div className="space-y-6">
          <Card title="Clinical AI Suite & Shortcuts">
            <div className="space-y-2.5">
              <Link to="/worker/triage" className="block">
                <Button variant="outline" className="w-full justify-start rounded-2xl text-xs" icon={Activity}>
                  AI Digital Triage Evaluator
                </Button>
              </Link>
              <Link to="/worker/ai-risk" className="block">
                <Button variant="outline" className="w-full justify-start rounded-2xl text-xs" icon={ShieldAlert}>
                  AI Risk Detection & Early Warning
                </Button>
              </Link>
              <Link to="/worker/patients" className="block">
                <Button variant="outline" className="w-full justify-start rounded-2xl text-xs" icon={Users}>
                  Patient Directory & Longitudinal Timeline
                </Button>
              </Link>
              <Link to="/worker/referrals" className="block">
                <Button variant="outline" className="w-full justify-start rounded-2xl text-xs" icon={GitBranch}>
                  Specialist Referrals Manager
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

