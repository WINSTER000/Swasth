import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  GitBranch,
  CheckCircle2,
  ArrowRight,
  Hospital,
  Building2,
  Calendar,
  Clock,
  User,
  Phone,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const WorkerReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await axios.get('/api/referrals');
      setReferrals(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const acceptReferral = async (id, patientName) => {
    setProcessingId(id);
    try {
      await axios.patch(`/api/referrals/${id}/status`, {
        status: 'ACCEPTED',
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setFeedback(`Referral for ${patientName || 'patient'} confirmed! Token generated & patient notified.`);
      setTimeout(() => setFeedback(''), 5000);
      fetchReferrals();
    } catch (e) {
      alert('Failed to accept referral');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading clinical referrals...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Specialist Referrals Management
            </h2>
            <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
              {referrals.length} Referrals
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review incoming specialist referrals from rural PHCs, confirm receiving consultations, and generate hospital tokens.
          </p>
        </div>
      </div>

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

      <div className="space-y-4">
        {referrals.length === 0 ? (
          <Card className="text-center py-12">
            <GitBranch className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Active Referrals</p>
            <p className="text-xs text-slate-400 mt-1">Specialist referrals submitted across facilities will appear here.</p>
          </Card>
        ) : (
          referrals.map((ref) => {
            const isConfirmed = ref.status === 'ACCEPTED' || ref.status === 'CONFIRMED' || ref.status === 'COMPLETED';

            return (
              <div
                key={ref._id}
                className={`p-5 rounded-3xl border shadow-xs space-y-4 transition-all ${
                  isConfirmed
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    : 'bg-white dark:bg-slate-800 border-brand-300 dark:border-brand-800 ring-2 ring-brand-500/10'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={ref.urgency === 'URGENT' || ref.urgency === 'EMERGENCY' ? 'danger' : 'warning'}>
                      Urgency: {ref.urgency || 'ROUTINE'}
                    </Badge>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Dept: {ref.department || 'General Medicine'}
                    </span>
                  </div>

                  <Badge variant={isConfirmed ? 'success' : 'info'}>
                    {isConfirmed ? 'CONFIRMED & SCHEDULED' : 'PENDING DOCTOR REVIEW'}
                  </Badge>
                </div>

                {/* Patient & Facility flow */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-extrabold flex items-center justify-center">
                      {ref.patient?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        {ref.patient?.name || 'Patient'}
                      </p>
                      {ref.patient?.phone && (
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center">
                          <Phone className="w-3 h-3 mr-1" /> {ref.patient.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 font-semibold text-slate-700 dark:text-slate-300">
                    <span>{ref.referringFacility?.name || 'Primary PHC'}</span>
                    <ArrowRight className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span className="text-brand-600 dark:text-brand-400 font-bold">
                      {ref.receivingFacility?.name || 'Tertiary Hospital'}
                    </span>
                  </div>
                </div>

                {/* Reason & Clinical Notes */}
                <div className="text-xs space-y-1.5">
                  <p className="text-slate-800 dark:text-slate-200">
                    <strong>Reason for Referral:</strong> {ref.reason}
                  </p>
                  {ref.clinicalSummary && (
                    <p className="text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong>Clinical Summary:</strong> {ref.clinicalSummary}
                    </p>
                  )}
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    Created: {new Date(ref.createdAt).toLocaleDateString()}
                  </span>

                  {!isConfirmed ? (
                    <Button
                      size="sm"
                      variant="success"
                      icon={CheckCircle2}
                      loading={processingId === ref._id}
                      onClick={() => acceptReferral(ref._id, ref.patient?.name)}
                      className="rounded-xl text-xs font-bold shadow-xs"
                    >
                      Confirm Referral & Generate Token
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmed & Synced to Patient</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

