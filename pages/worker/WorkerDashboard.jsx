import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
} from 'lucide-react';

export const WorkerDashboard = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState(null);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [pendingReferrals, setPendingReferrals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    try {
      const facilityId = '66d1f0000000000000000001'; // Shirwal PHC / Satara DH
      const [qRes, riskRes, refRes] = await Promise.all([
        axios.get(`/api/queues/${facilityId}`).catch(() => ({ data: null })),
        axios.get('/api/risk-assessments/high-risk').catch(() => ({ data: [] })),
        axios.get('/api/referrals').catch(() => ({ data: [] })),
      ]);

      setQueue(qRes.data);
      setHighRiskCount(riskRes.data?.length || 0);
      setPendingReferrals((refRes.data || []).filter((r) => r.status === 'SENT').length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const waitingPatients = queue?.items ? queue.items.filter((i) => i.status === 'WAITING') : [];

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading clinical doctor dashboard...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome Dr. ${user?.name || 'Medical Officer'}`}
        subtitle="SWASTH Clinical Decision Support System: Live OPD Queue, AI Digital Triage, High-Risk Surveillance & Specialist Referrals."
        badge={
          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
            Clinical Officer
          </span>
        }
        action={
          <div className="flex items-center space-x-2">
            <Link to="/worker/consultation/active">
              <Button variant="primary" size="sm" icon={Stethoscope}>
                Start Consultation
              </Button>
            </Link>
            <Link to="/worker/triage">
              <Button variant="outline" size="sm" icon={Activity}>
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
          value={`${waitingPatients.length} Patients`}
          change={`Token Serving: #${queue?.currentToken || 0}`}
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
          value={`${pendingReferrals} Pending`}
          change="Requires receiving review"
          icon={GitBranch}
          color="amber"
        />
        <StatCard
          title="Active Consultations"
          value="14 Completed"
          change="Avg consult: 12 mins"
          icon={Users}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main OPD Patient Queue List */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Today's OPD Patient Queue"
            action={
              <Link to="/worker/queue" className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center">
                Manage Queue <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            }
          >
            {waitingPatients.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Patients Waiting in OPD Queue"
                description="Patients checking into the queue will appear here in real-time."
              />
            ) : (
              <div className="space-y-2.5">
                {waitingPatients.map((item) => (
                  <div key={item._id} className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center">
                        #{item.tokenNumber}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{item.patient?.name || `Token #${item.tokenNumber}`}</p>
                        <p className="text-[10px] text-slate-400">Checked in: {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={item.priority === 'URGENT' ? 'danger' : 'info'}>{item.priority}</Badge>
                      <Link to={`/worker/patients/${item.patient?._id || item.patient}`}>
                        <Button size="sm" variant="outline">Consultation Workspace</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Tools Sidebar */}
        <div className="space-y-6">
          <Card title="Clinical AI Tools">
            <div className="space-y-2">
              <Link to="/worker/triage" className="block">
                <Button variant="outline" className="w-full justify-start" icon={Activity}>
                  AI Digital Triage Evaluator
                </Button>
              </Link>
              <Link to="/worker/ai-risk" className="block">
                <Button variant="outline" className="w-full justify-start" icon={ShieldAlert}>
                  AI Risk Detection & Early Warning
                </Button>
              </Link>
              <Link to="/worker/patients" className="block">
                <Button variant="outline" className="w-full justify-start" icon={Users}>
                  Patient Directory & Timeline
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
