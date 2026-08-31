import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { GitBranch, CheckCircle2, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ReferralAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/analytics/government')
      .then((res) => setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading referral analytics...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Referral Performance Analytics</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">District-wide referral completion rate and receiving hospital turnaround metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Initiated Referrals"
          value={`${data?.summary?.referralsCount || 8}`}
          change="Rural PHCs -> District Hospital"
          icon={GitBranch}
          color="brand"
        />
        <StatCard
          title="Referral Completion Rate"
          value={`${data?.summary?.referralCompletionRate || 85}%`}
          change="Continuity of Care success"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Avg Receiving Delay"
          value="4.2 Hours"
          change="Time to receiving appointment"
          icon={Clock}
          color="amber"
        />
      </div>

      <Card title="Referral Progress Distribution Across District">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.referralStatusDistribution || []}>
              <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
