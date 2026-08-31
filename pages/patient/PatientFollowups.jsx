import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { HeartPulse, Calendar, CheckCircle2, Clock } from 'lucide-react';

export const PatientFollowups = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/patients/me/followups')
      .then((res) => setFollowups(res.data || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading follow-ups...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Health Follow-up Reminders</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled post-consultation and post-referral surveillance dates.</p>
      </div>

      <div className="space-y-3">
        {followups.length === 0 ? (
          <Card className="text-center py-8 text-xs text-slate-500">No scheduled follow-up reminders.</Card>
        ) : (
          followups.map((fol) => (
            <Card key={fol._id}>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={fol.priority === 'URGENT' ? 'danger' : fol.priority === 'PRIORITY' ? 'warning' : 'neutral'}>
                      {fol.priority}
                    </Badge>
                    <Badge variant={fol.status === 'COMPLETED' ? 'success' : 'info'}>{fol.status}</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2">{fol.reason}</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">Facility: {fol.facility?.name} • Doctor: {fol.responsibleHealthWorker?.name}</p>
                  {fol.notes && <p className="text-slate-600 dark:text-slate-300 font-medium mt-1">Notes: {fol.notes}</p>}
                </div>
                <div className="text-right font-bold text-brand-600 dark:text-brand-400">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {new Date(fol.date).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
