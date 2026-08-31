import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { WebRTCCallModal } from '../../components/teleconsult/WebRTCCallModal';
import {
  HeartPulse,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Phone,
  Building2,
  Plus,
  Video,
  Stethoscope,
  Sparkles,
  AlertTriangle,
  X,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkerFollowups = () => {
  const [followups, setFollowups] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED' | 'URGENT'
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // WebRTC Teleconsult state
  const [teleconsultPatient, setTeleconsultPatient] = useState(null);

  // New Follow-up Form state
  const [formData, setFormData] = useState({
    patientId: '',
    facilityId: '',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: '',
    priority: 'PRIORITY',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [folRes, patRes, facRes] = await Promise.all([
        axios.get('/api/followups'),
        axios.get('/api/patients/search?query=').catch(() => ({ data: [] })),
        axios.get('/api/facilities').catch(() => ({ data: [] })),
      ]);

      const fols = folRes.data || [];
      const pats = patRes.data || [];
      const facs = facRes.data || [];

      setFollowups(fols);
      setPatientsList(pats);
      setFacilities(facs);

      if (pats.length > 0) {
        setFormData((prev) => ({
          ...prev,
          patientId: pats[0].user?._id || pats[0]._id,
          facilityId: facs[0]?._id || '',
        }));
      }
    } catch (e) {
      console.error('Failed to load followups:', e);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id, patientName) => {
    try {
      await axios.patch(`/api/followups/${id}`, { status: 'COMPLETED' });
      setFeedback(`Follow-up for ${patientName || 'patient'} marked as COMPLETED!`);
      setTimeout(() => setFeedback(''), 4000);
      const res = await axios.get('/api/followups');
      setFollowups(res.data || []);
    } catch (e) {
      alert('Failed to update follow-up status');
    }
  };

  const handleCreateFollowup = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      alert('Please enter a clinical reason for the follow-up.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('/api/followups', formData);
      setFeedback('New clinical follow-up scheduled & patient notified!');
      setTimeout(() => setFeedback(''), 4000);
      setShowScheduleModal(false);
      setFormData((prev) => ({
        ...prev,
        reason: '',
        notes: '',
      }));
      const res = await axios.get('/api/followups');
      setFollowups(res.data || []);
    } catch (err) {
      alert('Failed to schedule follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = followups.filter((f) => f.status === 'PENDING').length;
  const completedCount = followups.filter((f) => f.status === 'COMPLETED').length;
  const urgentCount = followups.filter((f) => f.priority === 'URGENT' || f.priority === 'PRIORITY').length;

  const filteredFollowups = followups.filter((f) => {
    if (activeTab === 'PENDING') return f.status === 'PENDING';
    if (activeTab === 'COMPLETED') return f.status === 'COMPLETED';
    if (activeTab === 'URGENT') return f.priority === 'URGENT' || f.priority === 'PRIORITY';
    return true;
  });

  if (loading && followups.length === 0) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading clinical follow-up surveillance tracker...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Health Worker Follow-up Tracker
            </h2>
            <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800 flex items-center">
              <HeartPulse className="w-3 h-3 mr-1" /> Active Surveillance
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor high-risk patient surveillance dates, post-consultation recovery, and medication reviews.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setShowScheduleModal(true)}
          className="rounded-2xl text-xs font-bold shadow-xs"
        >
          Schedule New Follow-up
        </Button>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div className="p-4 bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-white hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Follow-ups"
          value={`${followups.length} Registered`}
          change="Surveillance schedule"
          icon={HeartPulse}
          color="brand"
        />
        <StatCard
          title="Pending Reviews"
          value={`${pendingCount} Pending`}
          change="Action required"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="High Priority"
          value={`${urgentCount} Urgent`}
          change="Targeted monitoring"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Completed"
          value={`${completedCount} Closed`}
          change="Care finalized"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 w-full sm:w-max">
        {[
          { id: 'ALL', label: `All Follow-ups (${followups.length})` },
          { id: 'PENDING', label: `Pending (${pendingCount})` },
          { id: 'URGENT', label: `High Priority (${urgentCount})` },
          { id: 'COMPLETED', label: `Completed (${completedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Follow-up List */}
      <div className="space-y-4">
        {filteredFollowups.length === 0 ? (
          <Card className="text-center py-12 space-y-3">
            <HeartPulse className="w-10 h-10 mx-auto text-slate-400" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Follow-ups in this view</p>
            <Button size="sm" variant="outline" onClick={() => setShowScheduleModal(true)}>
              Schedule a Follow-up
            </Button>
          </Card>
        ) : (
          filteredFollowups.map((fol) => {
            const isDone = fol.status === 'COMPLETED';
            const patientUser = fol.patient || {};
            const patientId = patientUser._id || patientUser;

            return (
              <div
                key={fol._id}
                className={`p-5 rounded-3xl border shadow-xs space-y-4 transition-all ${
                  isDone
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={fol.priority === 'URGENT' ? 'danger' : fol.priority === 'PRIORITY' ? 'warning' : 'info'}>
                      {fol.priority}
                    </Badge>
                    <Badge variant={isDone ? 'success' : 'warning'}>
                      {isDone ? 'COMPLETED' : 'PENDING SURVEILLANCE'}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>Target Date: {new Date(fol.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Patient & Facility Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-extrabold flex items-center justify-center">
                      {patientUser.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        {patientUser.name || 'Patient'}
                      </p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        {patientUser.phone && (
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-0.5" /> {patientUser.phone}
                          </span>
                        )}
                        {patientUser.district && <span>• {patientUser.district}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                    <Building2 className="w-4 h-4 text-brand-600" />
                    <span>{fol.facility?.name || 'Primary Health Centre'}</span>
                  </div>
                </div>

                {/* Reason & Notes */}
                <div className="text-xs space-y-1">
                  <p className="text-slate-800 dark:text-slate-200">
                    <strong>Surveillance Reason:</strong> {fol.reason}
                  </p>
                  {fol.notes && (
                    <p className="text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong>Clinical Notes:</strong> {fol.notes}
                    </p>
                  )}
                </div>

                {/* Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Link to={`/worker/patients/${patientId}`}>
                      <Button size="xs" variant="outline" icon={Stethoscope} className="rounded-xl text-[11px] font-bold">
                        Consultation Workspace
                      </Button>
                    </Link>
                    <Button
                      size="xs"
                      variant="outline"
                      icon={Video}
                      onClick={() =>
                        setTeleconsultPatient({
                          id: patientId,
                          name: patientUser.name || 'Patient',
                        })
                      }
                      className="rounded-xl text-[11px]"
                    >
                      Teleconsult
                    </Button>
                  </div>

                  {!isDone ? (
                    <Button
                      size="sm"
                      variant="success"
                      icon={CheckCircle2}
                      onClick={() => markComplete(fol._id, patientUser.name)}
                      className="rounded-xl text-xs font-bold shadow-xs"
                    >
                      Mark Completed
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Surveillance Finalized</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Follow-up Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8 animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Schedule Health Follow-up
                </h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowup} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Select Registered Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                  required
                >
                  {patientsList.map((p) => {
                    const u = p.user || p;
                    const uId = u._id || p._id;
                    return (
                      <option key={uId} value={uId}>
                        {u.name} — {u.phone || 'Patient'} ({p.address?.district || 'Satara'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Assigned Healthcare Facility *
                </label>
                <select
                  value={formData.facilityId}
                  onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                  required
                >
                  {facilities.map((fac) => (
                    <option key={fac._id} value={fac._id}>
                      {fac.name} ({fac.type || 'Hospital'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Follow-up Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="ROUTINE">Routine Monitoring</option>
                    <option value="PRIORITY">Priority Surveillance</option>
                    <option value="URGENT">Urgent Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Surveillance Reason *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-discharge BP titration and lipid panel follow-up"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Instructions & Clinical Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Specific patient instructions, dietary advice, target thresholds..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  icon={Plus}
                >
                  Schedule Follow-up
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WebRTC Teleconsult Call Modal */}
      {teleconsultPatient && (
        <WebRTCCallModal
          isOpen={!!teleconsultPatient}
          onClose={() => setTeleconsultPatient(null)}
          roomId={teleconsultPatient.id}
          participantName={teleconsultPatient.name}
        />
      )}
    </div>
  );
};

