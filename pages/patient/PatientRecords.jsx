import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { FileText, Activity, Pill, FlaskConical, AlertTriangle, ShieldCheck } from 'lucide-react';

export const PatientRecords = () => {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/patients/me/records')
      .then((res) => setRecord(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading medical records...</div>;

  const encounters = record?.encounters || [];
  const prescriptions = record?.prescriptions || [];
  const labReports = record?.labReports || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Digital Longitudinal Health Records</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your complete clinical history across all PHCs, CHCs, and District Hospitals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Encounters Timeline */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-brand-600" /> Clinical Encounters & Consultations
          </h3>

          {encounters.length === 0 ? (
            <Card className="text-center py-6 text-xs text-slate-500">No encounters recorded yet.</Card>
          ) : (
            encounters.map((enc) => (
              <Card key={enc._id} title={enc.facility?.name || 'Healthcare Centre'} subtitle={new Date(enc.encounterDate).toLocaleDateString()}>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Vitals Recorded:</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      BP: {enc.vitals?.bp || 'N/A'} • Pulse: {enc.vitals?.pulse || 'N/A'} bpm • SpO2: {enc.vitals?.spo2 || 'N/A'}% • Temp: {enc.vitals?.temp || 'N/A'}°F
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Diagnoses:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {enc.diagnoses?.map((d, i) => (
                        <Badge key={i} variant="warning">{d.condition} ({d.severity})</Badge>
                      ))}
                    </div>
                  </div>

                  {enc.aiSummary && (
                    <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-800">
                      <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 uppercase block">AI Clinical Summary</span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">{enc.aiSummary}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Prescriptions & Lab Reports Side Panels */}
        <div className="space-y-6">
          <Card title="Active Prescriptions" subtitle={`${prescriptions.length} Records`}>
            <div className="space-y-3">
              {prescriptions.map((p) => (
                <div key={p._id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{p.facility?.name}</p>
                  <p className="text-[10px] text-slate-400">{new Date(p.date || p.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2 space-y-1">
                    {p.medications?.map((m, idx) => (
                      <div key={idx} className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                        <span className="font-semibold text-brand-600 dark:text-brand-400 block">{m.medicineName}</span>
                        <span className="text-[10px] text-slate-500">{m.dosage} — {m.frequency} ({m.duration})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Laboratory Test Reports" subtitle={`${labReports.length} Tests`}>
            <div className="space-y-2 text-xs">
              {labReports.map((lab) => (
                <div key={lab._id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{lab.testName}</span>
                    <span className="text-[10px] text-slate-400 block">{lab.result}</span>
                  </div>
                  <Badge variant={lab.status === 'COMPLETED' ? 'success' : 'warning'}>{lab.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
