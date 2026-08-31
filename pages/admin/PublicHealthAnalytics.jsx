import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Building, Users, Clock, ShieldAlert } from 'lucide-react';

export const PublicHealthAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/analytics/government')
      .then((res) => setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading public health analytics...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Government Public Health Monitoring</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">District public health indicators, workload distribution, and high-risk surveillance metrics.</p>
      </div>

      <Card title="Facility Workload & Queue Status">
        <div className="space-y-3 text-xs">
          {(data?.facilityWorkload || []).map((fac) => (
            <div key={fac._id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{fac.name}</p>
                <p className="text-slate-500">Type: {fac.type} • Avg Wait: {fac.averageWaitTimeMinutes} mins</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-600 block">Queue: {fac.queueStatus}</span>
                <span className="text-slate-500 text-[10px]">Beds: {fac.availableBeds} / {fac.totalBeds}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
