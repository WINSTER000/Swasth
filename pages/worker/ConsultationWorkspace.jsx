import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { WebRTCCallModal } from '../../components/teleconsult/WebRTCCallModal';
import {
  Stethoscope,
  Activity,
  Bot,
  ShieldAlert,
  GitBranch,
  Pill,
  Save,
  CheckCircle2,
  Video,
} from 'lucide-react';

export const ConsultationWorkspace = () => {
  const { id } = useParams(); // patient user id or 'active'
  const patientId = id === 'active' ? '66d1f0000000000000000004' : id; // default Ramesh Patil
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [vitals, setVitals] = useState({ bp: '145/92', pulse: 92, temp: 101.2, spo2: 95, weight: 68 });
  const [complaints, setComplaints] = useState('High fever for 3 days, dry cough, mild chest tightness');
  const [diagnosisCondition, setDiagnosisCondition] = useState('Acute Febrile Illness');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [aiTriageResult, setAiTriageResult] = useState(null);
  const [aiRiskResult, setAiRiskResult] = useState(null);

  // Prescription builder state
  const [meds, setMeds] = useState([
    { medicineName: 'Paracetamol 500mg', dosage: '500mg', frequency: 'TDS (3 times/day)', duration: '3 days' },
  ]);

  // Referral builder state
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralReason, setReferralReason] = useState('Specialist evaluation for hypertensive spikes');
  const [receivingFacilityId, setReceivingFacilityId] = useState('66d1f0000000000000000003'); // Satara DH

  const [saving, setSaving] = useState(false);
  const [showTeleconsult, setShowTeleconsult] = useState(false);

  useEffect(() => {
    if (patientId) {
      axios
        .get(`/api/patients/${patientId}`)
        .then((res) => setPatientData(res.data))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [patientId]);

  const runAiTriage = async () => {
    try {
      const res = await axios.post('/api/ai/triage', {
        symptoms: complaints.split(','),
        vitals,
      });
      setAiTriageResult(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const runAiRisk = async () => {
    try {
      const res = await axios.post('/api/ai/risk-assessment', {
        patientId,
        vitals,
      });
      setAiRiskResult(res.data.aiDetails);
    } catch (e) {
      console.error(e);
    }
  };

  const generateSummary = async () => {
    try {
      const res = await axios.post('/api/ai/summarize', { patientId });
      setAiSummary(res.data.summary);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConsultation = async () => {
    setSaving(true);
    try {
      // 1. Create Encounter
      const encRes = await axios.post('/api/records/encounters', {
        patientId,
        facilityId: '66d1f0000000000000000001',
        chiefComplaints: complaints.split(','),
        vitals,
        diagnoses: [{ condition: diagnosisCondition, severity: 'MODERATE' }],
        clinicalNotes,
        aiSummary,
      });

      // 2. Create Prescription
      if (meds.length > 0) {
        await axios.post('/api/records/prescriptions', {
          patientId,
          facilityId: '66d1f0000000000000000001',
          medications: meds,
        });
      }

      // 3. Create Referral if requested
      if (showReferralForm) {
        await axios.post('/api/referrals', {
          patientId,
          referringFacilityId: '66d1f0000000000000000001',
          receivingFacilityId,
          reason: referralReason,
          urgency: aiRiskResult?.aiRiskLevel === 'CRITICAL' ? 'EMERGENCY' : 'URGENT',
          clinicalSummary: `Consultation notes: ${clinicalNotes}. AI Triage: ${aiTriageResult?.urgency || 'MEDIUM'}`,
        });
      }

      alert('Consultation saved successfully to patient longitudinal record!');
      navigate('/worker/dashboard');
    } catch (err) {
      alert('Failed to save consultation');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !patientData) return <div className="p-8 text-center text-slate-500">Loading consultation workspace...</div>;

  const { user: patientUser, profile } = patientData;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg flex items-center justify-center">
            {patientUser?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{patientUser?.name}</h2>
            <p className="text-xs text-slate-500">
              Gender: {profile?.gender} • DOB: {new Date(profile?.dateOfBirth).toLocaleDateString()} • Blood Group: {profile?.bloodGroup}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" icon={Video} onClick={() => setShowTeleconsult(true)}>
            Start WebRTC Teleconsult
          </Button>
          <Button variant="primary" size="sm" icon={Save} loading={saving} onClick={handleSaveConsultation}>
            Save Consultation & Complete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Clinical Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vitals Input */}
          <Card title="Patient Vitals">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Blood Pressure</label>
                <input
                  type="text"
                  value={vitals.bp}
                  onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Pulse (bpm)</label>
                <input
                  type="number"
                  value={vitals.pulse}
                  onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Temp (°F)</label>
                <input
                  type="number"
                  value={vitals.temp}
                  onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={vitals.weight}
                  onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg dark:text-slate-100"
                />
              </div>
            </div>
          </Card>

          {/* Symptoms & Diagnosis */}
          <Card title="Chief Complaints & Primary Diagnosis">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chief Complaints</label>
                <textarea
                  rows={2}
                  value={complaints}
                  onChange={(e) => setComplaints(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Diagnosis</label>
                <input
                  type="text"
                  value={diagnosisCondition}
                  onChange={(e) => setDiagnosisCondition(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-slate-100"
                />
              </div>
            </div>
          </Card>

          {/* Prescriptions Builder */}
          <Card title="Medication Prescription Builder">
            <div className="space-y-3 text-xs">
              {meds.map((m, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={m.medicineName}
                    onChange={(e) => {
                      const updated = [...meds];
                      updated[i].medicineName = e.target.value;
                      setMeds(updated);
                    }}
                    placeholder="Medicine Name"
                    className="p-2 border rounded bg-white dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={m.dosage}
                    onChange={(e) => {
                      const updated = [...meds];
                      updated[i].dosage = e.target.value;
                      setMeds(updated);
                    }}
                    placeholder="Dosage"
                    className="p-2 border rounded bg-white dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={m.frequency}
                    onChange={(e) => {
                      const updated = [...meds];
                      updated[i].frequency = e.target.value;
                      setMeds(updated);
                    }}
                    placeholder="Frequency"
                    className="p-2 border rounded bg-white dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={m.duration}
                    onChange={(e) => {
                      const updated = [...meds];
                      updated[i].duration = e.target.value;
                      setMeds(updated);
                    }}
                    placeholder="Duration"
                    className="p-2 border rounded bg-white dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setMeds([...meds, { medicineName: '', dosage: '500mg', frequency: 'BD', duration: '5 days' }])
                }
              >
                + Add Medication
              </Button>
            </div>
          </Card>

          {/* Referral Checkbox & Form */}
          <Card title="Specialist Referral Builder">
            <div className="space-y-3 text-xs">
              <label className="flex items-center space-x-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReferralForm}
                  onChange={(e) => setShowReferralForm(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <span>Initiate Specialist Referral to Higher Centre</span>
              </label>

              {showReferralForm && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Referral Reason</label>
                    <input
                      type="text"
                      value={referralReason}
                      onChange={(e) => setReferralReason(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 border rounded dark:text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: AI Assistants & Record Summary */}
        <div className="space-y-6">
          <Card title="AI Clinical Assistance">
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start" icon={Activity} onClick={runAiTriage}>
                Run AI Digital Triage
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" icon={ShieldAlert} onClick={runAiRisk}>
                Run AI Risk Assessment
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" icon={Bot} onClick={generateSummary}>
                Generate AI Record Summary
              </Button>
            </div>
          </Card>

          {aiTriageResult && (
            <Card title="AI Digital Triage Result">
              <div className="text-xs space-y-2">
                <Badge variant={aiTriageResult.urgency === 'CRITICAL' ? 'danger' : 'warning'}>
                  Urgency: {aiTriageResult.urgency}
                </Badge>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{aiTriageResult.recommendedNextAction}</p>
                <p className="text-[10px] text-slate-400 italic">{aiTriageResult.disclaimer}</p>
              </div>
            </Card>
          )}

          {aiRiskResult && (
            <Card title="AI Early Warning Risk Level">
              <div className="text-xs space-y-2">
                <Badge variant={aiRiskResult.aiRiskLevel === 'HIGH' ? 'danger' : 'warning'}>
                  Risk Level: {aiRiskResult.aiRiskLevel}
                </Badge>
                <p className="text-slate-600 dark:text-slate-400">{aiRiskResult.recommendedAction}</p>
              </div>
            </Card>
          )}

          {aiSummary && (
            <Card title="AI Clinical Record Summary">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-brand-50/50 dark:bg-brand-950/30 p-3 rounded-xl border border-brand-200">
                {aiSummary}
              </p>
            </Card>
          )}
        </div>
      </div>

      <WebRTCCallModal
        isOpen={showTeleconsult}
        onClose={() => setShowTeleconsult(false)}
        roomId={patientId}
        participantName={patientUser?.name || 'Patient'}
      />
    </div>
  );
};
