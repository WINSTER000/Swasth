import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  HeartPulse,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Hospital,
  AlertCircle,
  Check,
  RotateCcw,
  Bell,
  X,
  Stethoscope,
} from 'lucide-react';

export const PatientFollowups = () => {
  const [followups, setFollowups] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'PENDING', 'COMPLETED'
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Add Follow-up Form State
  const [formData, setFormData] = useState({
    facilityId: '',
    reason: '',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'PRIORITY',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [folRes, facRes] = await Promise.all([
        axios.get('/api/patients/me/followups'),
        axios.get('/api/facilities'),
      ]);
      setFollowups(folRes.data || []);
      setFacilities(facRes.data || []);
      if (facRes.data && facRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, facilityId: facRes.data[0]._id }));
      }
    } catch (e) {
      console.error('Failed to load follow-up reminders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    try {
      await axios.patch(`/api/followups/${id}/toggle`);
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle follow-up status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddFollowup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/followups', formData);
      await fetchData();
      setShowAddModal(false);
      setFormData((prev) => ({
        ...prev,
        reason: '',
        notes: '',
      }));
    } catch (err) {
      console.error('Failed to add follow-up reminder:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading health follow-up reminders...</div>;
  }

  const filteredFollowups = followups.filter((f) => {
    if (activeTab === 'PENDING') return f.status !== 'COMPLETED';
    if (activeTab === 'COMPLETED') return f.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Health Follow-up Reminders
            </h2>
            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center">
              <Bell className="w-3 h-3 mr-1" /> Active Surveillance
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Scheduled post-consultation and post-referral surveillance dates across your primary care network.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
            className="text-xs shadow-xs cursor-pointer"
          >
            Add Follow-up Reminder
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 w-max">
        {[
          { id: 'ALL', label: 'All Reminders', count: followups.length },
          { id: 'PENDING', label: 'Upcoming & Due', count: followups.filter((f) => f.status !== 'COMPLETED').length },
          { id: 'COMPLETED', label: 'Completed', count: followups.filter((f) => f.status === 'COMPLETED').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {filteredFollowups.length === 0 ? (
          <Card className="text-center py-10 space-y-3">
            <HeartPulse className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">No scheduled follow-up reminders in this view.</p>
            <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
              Schedule New Follow-up
            </Button>
          </Card>
        ) : (
          filteredFollowups.map((fol) => {
            const isCompleted = fol.status === 'COMPLETED';
            const dueDate = new Date(fol.date);
            const isOverdue = !isCompleted && dueDate < new Date();

            return (
              <div
                key={fol._id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-80'
                    : isOverdue
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          fol.priority === 'URGENT' ? 'danger' : fol.priority === 'PRIORITY' ? 'warning' : 'neutral'
                        }
                      >
                        {fol.priority} PRIORITY
                      </Badge>
                      <Badge variant={isCompleted ? 'success' : isOverdue ? 'warning' : 'info'}>
                        {isCompleted ? 'COMPLETED' : isOverdue ? 'DUE / OVERDUE' : 'PENDING'}
                      </Badge>
                    </div>

                    <div>
                      <h4
                        className={`font-extrabold text-sm sm:text-base ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {fol.reason}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-2">
                        <span>Facility: <strong>{fol.facility?.name || 'Healthcare Centre'}</strong></span>
                        {fol.responsibleHealthWorker?.name && (
                          <span>• Doctor: {fol.responsibleHealthWorker.name}</span>
                        )}
                      </p>
                    </div>

                    {fol.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <strong>Clinical Notes:</strong> {fol.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Actions & Date */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
                    <div className="flex items-center space-x-1.5 text-xs font-extrabold text-brand-600 dark:text-brand-400">
                      <Calendar className="w-4 h-4" />
                      <span>{dueDate.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Mark Complete Button */}
                      <button
                        onClick={() => handleToggleStatus(fol._id)}
                        disabled={togglingId === fol._id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {isCompleted ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        <span>{isCompleted ? 'Reopen' : 'Mark Done'}</span>
                      </button>

                      {/* Book Appointment for Followup */}
                      {!isCompleted && fol.facility?._id && (
                        <Link
                          to={`/patient/appointments/book?facilityId=${fol.facility._id}&department=General%20Medicine&reason=${encodeURIComponent(
                            'Follow-up: ' + fol.reason
                          )}`}
                        >
                          <Button variant="primary" size="sm" icon={ArrowRight} className="text-xs shadow-xs">
                            Book Token
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Follow-up Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Add Health Follow-up Reminder</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFollowup} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Healthcare Facility / Clinic *
                </label>
                <select
                  value={formData.facilityId}
                  onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                  required
                >
                  {facilities.map((fac) => (
                    <option key={fac._id} value={fac._id}>
                      {fac.name} ({fac.district || 'Rural Center'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Follow-up Purpose / Reason *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-antibiotic fever recheck, BP monitoring review"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Scheduled Date *
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
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="PRIORITY">Priority</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Notes & Surveillance Instructions
                </label>
                <textarea
                  rows="2"
                  placeholder="Review blood test results, recheck BP / blood glucose level..."
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
                  onClick={() => setShowAddModal(false)}
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
                  Save Follow-up Reminder
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

