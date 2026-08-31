import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Activity, Edit2 } from 'lucide-react';

export const DiagnosticManager = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const facilityId = '66d1f0000000000000000001';

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    try {
      const res = await axios.get(`/api/diagnostics/facility/${facilityId}`);
      setDiagnostics(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'LIMITED' : 'AVAILABLE';
    try {
      await axios.patch(`/api/diagnostics/facility-diagnostic/${id}`, { availabilityStatus: nextStatus });
      fetchDiagnostics();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading diagnostic services...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Diagnostic Services Manager</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage CBC, X-Ray, ECG, ultrasound diagnostic availability for patients.</p>
      </div>

      <div className="space-y-3 text-xs">
        {diagnostics.map((diag) => (
          <Card key={diag._id}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{diag.diagnosticService?.name}</span>
                <p className="text-slate-500">Report turn-around time: ~{diag.estimatedReportTimeHours}h</p>
                <div className="mt-1">
                  <Badge variant={diag.availabilityStatus === 'AVAILABLE' ? 'success' : 'danger'}>
                    {diag.availabilityStatus}
                  </Badge>
                </div>
              </div>

              <Button size="sm" variant="outline" icon={Edit2} onClick={() => toggleStatus(diag._id, diag.availabilityStatus)}>
                Toggle Availability Status
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
