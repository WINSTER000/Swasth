import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { GitBranch, CheckCircle2, ArrowRight } from 'lucide-react';

export const WorkerReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const acceptReferral = async (id) => {
    try {
      await axios.patch(`/api/referrals/${id}/status`, {
        status: 'ACCEPTED',
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      alert('Referral accepted & appointment scheduled at receiving hospital!');
      fetchReferrals();
    } catch (e) {
      alert('Failed to accept referral');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading referrals...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Referrals Manager</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Incoming & outgoing specialist referrals for facility continuity of care.</p>
      </div>

      <div className="space-y-3 text-xs">
        {referrals.map((ref) => (
          <Card key={ref._id}>
            <div className="flex items-center justify-between mb-2">
              <Badge variant={ref.urgency === 'URGENT' ? 'danger' : 'warning'}>Urgency: {ref.urgency}</Badge>
              <Badge variant={ref.status === 'COMPLETED' ? 'success' : 'info'}>{ref.status}</Badge>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <p className="font-bold text-slate-900 dark:text-slate-100">Patient: {ref.patient?.name}</p>
              <p className="text-slate-600 dark:text-slate-400">
                {ref.referringFacility?.name} ➔ {ref.receivingFacility?.name}
              </p>
              <p className="text-slate-700 dark:text-slate-300 font-medium">Reason: {ref.reason}</p>
            </div>

            {ref.status === 'SENT' && (
              <div className="mt-3 text-right">
                <Button size="sm" variant="success" icon={CheckCircle2} onClick={() => acceptReferral(ref._id)}>
                  Accept Referral & Schedule Receiving Appt
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
