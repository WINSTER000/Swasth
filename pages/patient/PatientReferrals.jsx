import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { GitBranch, ArrowRight, Hospital, Calendar, CheckCircle2 } from 'lucide-react';

export const PatientReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/patients/me/referrals')
      .then((res) => setReferrals(res.data || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading referrals...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Medical Referrals Timeline</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Track referrals initiated from primary health centers to secondary and tertiary district hospitals.
        </p>
      </div>

      <div className="space-y-4">
        {referrals.length === 0 ? (
          <Card className="text-center py-8 text-xs text-slate-500">No medical referrals recorded.</Card>
        ) : (
          referrals.map((ref) => (
            <Card key={ref._id}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={ref.urgency === 'URGENT' ? 'danger' : 'warning'}>Urgency: {ref.urgency}</Badge>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">STATUS: {ref.status}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Hospital className="w-5 h-5 text-brand-600" />
                  <span>{ref.referringFacility?.name}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span>{ref.receivingFacility?.name}</span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Reason for Referral: {ref.reason}</p>
                  <p className="text-slate-600 dark:text-slate-400">Clinical Summary: {ref.clinicalSummary}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
