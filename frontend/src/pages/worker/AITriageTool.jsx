import React, { useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Activity, AlertTriangle, Check, Edit3, X } from 'lucide-react';

export const AITriageTool = () => {
  const [symptoms, setSymptoms] = useState('Chest tightness, shortness of breath, high fever');
  const [bp, setBp] = useState('145/92');
  const [temp, setTemp] = useState('101.5');
  const [spo2, setSpo2] = useState('94');
  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [workerAction, setWorkerAction] = useState(null);

  const handleTriage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setWorkerAction(null);
    try {
      const res = await axios.post('/api/ai/triage', {
        symptoms: symptoms.split(','),
        vitals: { bp, temp: parseFloat(temp), spo2: parseInt(spo2, 10) },
      });
      setTriageResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI-Assisted Digital Triage Tool</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Clinical decision support tool for health workers. Formats vitals & symptoms into structured triage assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <Card title="Input Vitals & Symptoms">
          <form onSubmit={handleTriage} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Observed Symptoms</label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">BP (mmHg)</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Temp (°F)</label>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SpO2 (%)</label>
                <input
                  type="text"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-slate-100"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} icon={Activity} className="w-full py-2.5 font-bold">
              Run AI Triage Evaluation
            </Button>
          </form>
        </Card>

        {/* AI Output Card */}
        <Card title="AI Structured Triage Output">
          {triageResult ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <Badge variant={triageResult.urgency === 'CRITICAL' ? 'danger' : 'warning'}>
                  Urgency: {triageResult.urgency}
                </Badge>
                <span className="text-[10px] text-slate-400 font-semibold">AI Decision Support</span>
              </div>

              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Recommended Action:</span>
                <p className="text-slate-600 dark:text-slate-300 font-medium mt-0.5">{triageResult.recommendedNextAction}</p>
              </div>

              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Clinical Considerations:</span>
                <ul className="list-disc pl-4 text-slate-600 dark:text-slate-400 mt-0.5 space-y-0.5">
                  {triageResult.possibleConsiderations?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                <p className="font-bold text-amber-800 dark:text-amber-300 text-[11px]">⚠️ Disclaimer</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">{triageResult.disclaimer}</p>
              </div>

              {/* Health Worker Review Decision Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-2">Health Worker Action:</p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={workerAction === 'ACCEPTED' ? 'success' : 'outline'}
                    onClick={() => setWorkerAction('ACCEPTED')}
                    icon={Check}
                  >
                    ACCEPT
                  </Button>
                  <Button
                    size="sm"
                    variant={workerAction === 'MODIFIED' ? 'primary' : 'outline'}
                    onClick={() => setWorkerAction('MODIFIED')}
                    icon={Edit3}
                  >
                    MODIFY
                  </Button>
                  <Button
                    size="sm"
                    variant={workerAction === 'IGNORED' ? 'danger' : 'outline'}
                    onClick={() => setWorkerAction('IGNORED')}
                    icon={X}
                  >
                    IGNORE
                  </Button>
                </div>
                {workerAction && (
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                    Action Recorded: Health Worker choice = {workerAction}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-12">Submit vitals to view AI triage assessment.</p>
          )}
        </Card>
      </div>
    </div>
  );
};
