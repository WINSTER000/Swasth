import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  GitBranch,
  HeartPulse,
  Hospital,
  Bot,
  AlertOctagon,
  ChevronRight,
  Video,
  Plus,
  MapPin,
  Activity,
} from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['patient', 'common']);
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptsRes, refRes, folRes, facRes, recRes] = await Promise.all([
          axios.get('/api/patients/me/appointments'),
          axios.get('/api/patients/me/referrals'),
          axios.get('/api/patients/me/followups'),
          axios.get('/api/facilities/nearby'),
          axios.get('/api/patients/me/records'),
        ]);

        setAppointments(apptsRes.data || []);
        setReferrals(refRes.data || []);
        setFollowups(folRes.data || []);
        setNearbyFacilities((facRes.data || []).slice(0, 3));
        setRecords(recRes.data || null);
      } catch (err) {
        console.error('Failed to load patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextAppt = appointments.find((a) => a.status === 'CONFIRMED' || a.status === 'IN_QUEUE');
  const activeReferral = referrals.find((r) => r.status !== 'CLOSED' && r.status !== 'COMPLETED');
  const upcomingFollowup = followups.find((f) => f.status === 'PENDING');

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading patient dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vesper Style Page Header */}
      <PageHeader
        title={`Welcome ${user?.name || 'Patient'}`}
        subtitle="Manage your health appointments, live queue tokens, referrals, and medical records here."
        badge={
          <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800 uppercase tracking-wider">
            Patient Portal
          </span>
        }
        action={
          <div className="flex items-center space-x-2">
            <Link to="/patient/appointments/book">
              <Button variant="primary" size="sm" icon={Plus}>
                Book Appointment
              </Button>
            </Link>
            <Link to="/patient/teleconsult">
              <Button variant="secondary" size="sm" icon={Video}>
                Teleconsult
              </Button>
            </Link>
          </div>
        }
      />

      {/* Vesper Metric Cards (StatCards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Appointment"
          value={nextAppt ? `#${nextAppt.tokenNumber}` : '0'}
          change={nextAppt ? `${nextAppt.facility?.name}` : 'No upcoming token'}
          icon={Calendar}
          color="brand"
        />
        <StatCard
          title="Queue Wait Time"
          value={nextAppt?.status === 'IN_QUEUE' ? 'In Queue' : 'Normal'}
          change={nextAppt ? `Est. wait: ~20 mins` : 'Live Queue status'}
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Active Referrals"
          value={activeReferral ? activeReferral.status : '0 Active'}
          change={activeReferral ? `${activeReferral.referringFacility?.name} ➔ ${activeReferral.receivingFacility?.name}` : 'Care continuum clear'}
          icon={GitBranch}
          color="amber"
        />
        <StatCard
          title="Follow-up Reminders"
          value={upcomingFollowup ? new Date(upcomingFollowup.date).toLocaleDateString() : '0 Pending'}
          change={upcomingFollowup ? upcomingFollowup.reason : 'Up to date'}
          icon={HeartPulse}
          color="rose"
        />
      </div>

      {/* Main Content Sections Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Active Widgets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointment Card */}
          <Card
            title="Next Confirmed Appointment"
            action={
              <Link to="/patient/appointments" className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center">
                View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            }
          >
            {nextAppt ? (
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="info">Token #{nextAppt.tokenNumber}</Badge>
                    <Badge variant="success">{nextAppt.appointmentType}</Badge>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-2">{nextAppt.facility?.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dept: {nextAppt.department} • Doctor: {nextAppt.healthWorker?.name || 'Assigned Officer'}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">Reason: {nextAppt.reason}</p>
                </div>
                <Link to="/patient/queue">
                  <Button variant="primary" size="sm" icon={Clock}>
                    Track Queue Live
                  </Button>
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No Upcoming Appointments"
                description="Book an OPD consultation token at any Rural PHC, CHC, or District Hospital."
                actionLabel="Book Appointment"
                onAction={() => window.location.href = '/patient/appointments/book'}
                actionIcon={Plus}
              />
            )}
          </Card>

          {/* Active Referral Card */}
          <Card title="Active Specialist Referral">
            {activeReferral ? (
              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="warning">Urgency: {activeReferral.urgency}</Badge>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">{activeReferral.status}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {activeReferral.referringFacility?.name} ➔ {activeReferral.receivingFacility?.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{activeReferral.clinicalSummary}</p>
                <div className="mt-3 text-right">
                  <Link to="/patient/referrals">
                    <Button variant="outline" size="sm" icon={GitBranch}>View Referral Details</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={GitBranch}
                title="No Active Referrals"
                description="Medical records and care continuity are up to date."
              />
            )}
          </Card>

          {/* Recent Health Records */}
          <Card title="Recent Clinical Encounters">
            {records?.encounters?.length > 0 ? (
              <div className="space-y-3">
                {records.encounters.slice(0, 3).map((enc) => (
                  <div key={enc._id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
                      <span>{enc.facility?.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{new Date(enc.encounterDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      Diagnosis: {enc.diagnoses?.map((d) => d.condition).join(', ') || 'Routine OPD'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="No Medical Encounters Yet"
                description="Your longitudinal health records will appear here after clinical consultations."
              />
            )}
          </Card>
        </div>

        {/* Right Col: Nearby PHCs & AI Assistant CTA */}
        <div className="space-y-6">
          <Card
            title="Nearby Healthcare Facilities"
            action={
              <Link to="/patient/facilities" className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">
                View Map
              </Link>
            }
          >
            <div className="space-y-3">
              {nearbyFacilities.map((fac) => (
                <div key={fac._id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">{fac.name}</h5>
                    <p className="text-[11px] text-slate-500">{fac.district} • {fac.distanceKm || 2.4} km</p>
                    <span className="inline-block mt-0.5 text-[10px] text-emerald-600 font-bold">
                      Queue: {fac.queueStatus} ({fac.averageWaitTimeMinutes}m wait)
                    </span>
                  </div>
                  <Link to={`/patient/facilities/${fac._id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Guidance Box */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
            <Bot className="w-7 h-7 text-brand-400 mb-2" />
            <h4 className="font-bold text-sm">Need Health Guidance?</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Ask SWASTH AI Assistant in English, Hindi (हिन्दी), or Marathi (मराठी).
            </p>
            <Link to="/patient/ai" className="mt-3 block">
              <Button variant="primary" size="sm" className="w-full">
                Open AI Health Assistant
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
