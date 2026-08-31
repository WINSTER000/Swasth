import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { HeartPulse, CheckCircle2 } from 'lucide-react';

export const WorkerFollowups = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    try {
      const res = await axios.get('/api/followups');
      setFollowups(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id) => {
    try {
      await axios.patch(`/api/followups/${id}`, { status: 'COMPLETED' });
      fetchFollowups();
    } catch (e) {
      alert('Failed to mark complete');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading follow-ups...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Health Worker Follow-up Tracker</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage high-priority patient surveillance dates.</p>
      </div>

      <div className="space-y-3 text-xs">
        {followups.map((fol) => (
          <Card key={fol._id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Badge variant={fol.priority === 'URGENT' ? 'danger' : 'warning'}>{fol.priority}</Badge>
                  <Badge variant={fol.status === 'COMPLETED' ? 'success' : 'info'}>{fol.status}</Badge>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-2">Patient: {fol.patient?.name}</h4>
                <p className="text-slate-600 dark:text-slate-400">Reason: {fol.reason}</p>
                <p className="text-[10px] text-slate-400">Date: {new Date(fol.date).toLocaleDateString()}</p>
              </div>

              {fol.status !== 'COMPLETED' && (
                <Button size="sm" variant="success" icon={CheckCircle2} onClick={() => markComplete(fol._id)}>
                  Mark Completed
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
