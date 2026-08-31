import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ShieldAlert, Phone, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HighRiskPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/risk-assessments/high-risk')
      .then((res) => setPatients(res.data || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading high-risk watchlist...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">High-Risk Patient Watchlist</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Patients professionally confirmed as HIGH or CRITICAL risk requiring priority surveillance.</p>
      </div>

      <div className="space-y-3">
        {patients.length === 0 ? (
          <Card className="text-center py-8 text-xs text-slate-500">No high-risk patients currently flagged.</Card>
        ) : (
          patients.map((p) => (
            <div
              key={p._id}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <Badge variant={p.finalRiskLevel === 'CRITICAL' ? 'danger' : 'warning'}>
                    Risk: {p.finalRiskLevel}
                  </Badge>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{p.patient?.name}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Recommended Action: {p.recommendedAction}</p>
                <p className="text-[10px] text-slate-400">Reviewed By: {p.reviewedBy?.name || 'Medical Officer'}</p>
              </div>

              <Link to={`/worker/patients/${p.patient?._id || p.patient}`}>
                <Button size="sm" variant="outline">View Patient Record</Button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
