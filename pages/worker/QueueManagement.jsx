import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Clock, PhoneCall, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QueueManagement = () => {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const facilityId = '66d1f0000000000000000001';

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await axios.get(`/api/queues/${facilityId}`);
      setQueue(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const callNext = async () => {
    try {
      const res = await axios.post(`/api/queues/${facilityId}/next`);
      fetchQueue();
    } catch (e) {
      alert(e.response?.data?.message || 'Error calling next patient');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading OPD Queue...</div>;

  const currentToken = queue?.currentToken || 0;
  const items = queue?.items || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Live OPD Queue Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Control active patient tokens and call next in line for consultation.</p>
        </div>
        <Button variant="primary" icon={PhoneCall} onClick={callNext}>
          Call Next Patient Token
        </Button>
      </div>

      <Card title={`Current Active Token: #${currentToken || 'None'}`}>
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No patients checked into queue today.</p>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                  item.tokenNumber === currentToken
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm ${
                    item.tokenNumber === currentToken ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}>
                    #{item.tokenNumber}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{item.patient?.name || `Patient Token #${item.tokenNumber}`}</p>
                    <p className="text-[10px] text-slate-400">Checked in: {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant={item.priority === 'URGENT' ? 'danger' : 'info'}>{item.priority}</Badge>
                  <Badge variant={item.status === 'IN_CONSULTATION' ? 'success' : item.status === 'COMPLETED' ? 'neutral' : 'warning'}>
                    {item.status}
                  </Badge>
                  <Link to={`/worker/patients/${item.patient?._id || item.patient}`}>
                    <Button size="sm" variant="outline">Consultation Workspace</Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
