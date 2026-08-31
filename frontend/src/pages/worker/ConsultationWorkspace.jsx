import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  Building2,
  Sparkles,
  HeartPulse,
  Thermometer,
  Gauge,
  Droplets,
  Plus,
  Trash2,
} from 'lucide-react';

export const ConsultationWorkspace = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const queryFacilityId = searchParams.get('facilityId');
  const appointmentId = searchParams.get('appointmentId');
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(queryFacilityId || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingVitals, setSavingVitals] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Form states
  const [vitals, setVitals] = useState({ bp: '120/80', pulse: 74, temp: 98.6, spo2: 98, weight: 68 });
  const [complaints, setComplaints] = useState('');
  const [diagnosisCondition, setDiagnosisCondition] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [aiTriageResult, setAiTriageResult] = useState(null);
  const [aiRiskResult, setAiRiskResult] = useState(null);

  // Prescription builder state
  const [meds, setMeds] = useState([
    { medicineName: '', dosage: '500mg', frequency: 'BD (Twice/day)', duration: '5 days' },
  ]);

  // Referral builder state
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralReason, setReferralReason] = useState('Specialist evaluation');
  const [receivingFacilityId, setReceivingFacilityId] = useState('');

  const [showTeleconsult, setShowTeleconsult] = useState(false);
  const [activeTab, setActiveTab] = useState('CONSULTATION'); // 'CONSULTATION' | 'TIMELINE' | 'PRESCRIPTIONS' | 'LABS'

  // 1. Fetch facilities
  useEffect(() => {
    axios
      .get('/api/facilities')
      .then((res) => {
        const facs = res.data || [];
        setFacilities(facs);
        if (!selectedFacilityId && facs.length > 0) {
          setSelectedFacilityId(facs[0]._id);
        }
        if (facs.length > 1) {
          setReceivingFacilityId(facs[1]._id);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // 2. Fetch Patient Record
  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      try {
        const targetUrl = !id || id === 'active' ? '/api/patients/active' : `/api/patients/${id}`;
        const res = await axios.get(targetUrl);
        const data = res.data;
        setPatientData(data);

        // 1. Pre-fill latest vitals from real previous encounters
        const pastEncounters = data.medicalRecord?.encounters || [];
        const pastAppointments = data.appointments || [];
        const pastPrescriptions = data.medicalRecord?.prescriptions || [];

        if (pastEncounters.length > 0 && pastEncounters[0].vitals) {
          setVitals({
            bp: pastEncounters[0].vitals.bp || '120/80',
            pulse: pastEncounters[0].vitals.pulse || 74,
            temp: pastEncounters[0].vitals.temp || 98.6,
            spo2: pastEncounters[0].vitals.spo2 || 98,
            weight: pastEncounters[0].vitals.weight || 68,
          });
          setDiagnosisCondition(pastEncounters[0].diagnoses?.[0]?.condition || 'Clinical Health Evaluation');
        }

        // 2. Pre-fill chief complaints from latest appointment or encounter
        if (pastAppointments.length > 0 && pastAppointments[0].reason) {
          setComplaints(pastAppointments[0].reason);
        } else if (pastEncounters.length > 0 && pastEncounters[0].chiefComplaints?.length > 0) {
          setComplaints(pastEncounters[0].chiefComplaints.join(', '));
        } else {
          setComplaints('General OPD Checkup & Evaluation');
        }

        // 3. Pre-fill clinical notes
        if (pastEncounters.length > 0 && pastEncounters[0].clinicalNotes) {
          setClinicalNotes(`Follow-up notes: ${pastEncounters[0].clinicalNotes}`);
        } else {
          setClinicalNotes('Patient examined in OPD cabin. Physical evaluation stable.');
        }

        // 4. Pre-fill medications
        if (pastPrescriptions.length > 0 && pastPrescriptions[0].medications?.length > 0) {
          setMeds(pastPrescriptions[0].medications);
        }
      } catch (err) {
        console.error('Failed to load patient:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const realPatientId = patientData?.user?._id || patientData?.user?.id || id;

  // Quick Vitals Save
  const handleQuickSaveVitals = async () => {
    if (!realPatientId) return;
    setSavingVitals(true);
    try {
      await axios.post('/api/records/encounters', {
        patientId: realPatientId,
        facilityId: selectedFacilityId,
        appointmentId: appointmentId || null,
        chiefComplaints: ['Vitals Check & Physical Evaluation'],
        vitals,
        diagnoses: [{ condition: 'Vital Signs Surveillance & Routine Check', severity: 'MILD' }],
        clinicalNotes: `Vitals recorded by doctor: BP ${vitals.bp}, Pulse ${vitals.pulse} bpm, SpO2 ${vitals.spo2}%, Temp ${vitals.temp}°F.`,
        aiSummary: `Updated Vitals: Blood Pressure ${vitals.bp}, Pulse ${vitals.pulse} bpm, Oxygen SpO2 ${vitals.spo2}%, Temp ${vitals.temp}°F.`,
      });

      setSuccessToast('Vitals updated successfully in patient record!');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert('Failed to update vitals');
    } finally {
      setSavingVitals(false);
    }
  };

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
        patientId: realPatientId,
        vitals,
      });
      setAiRiskResult(res.data.aiDetails);
    } catch (e) {
      console.error(e);
    }
  };

  const generateSummary = async () => {
    try {
      const res = await axios.post('/api/ai/summarize', { patientId: realPatientId });
      setAiSummary(res.data.summary);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConsultation = async () => {
    if (!realPatientId) return;
    setSaving(true);
    try {
      // 1. Create Encounter
      await axios.post('/api/records/encounters', {
        patientId: realPatientId,
        facilityId: selectedFacilityId,
        appointmentId: appointmentId || null,
        chiefComplaints: complaints.split(',').map((c) => c.trim()),
        vitals,
        diagnoses: [{ condition: diagnosisCondition, severity: 'MODERATE' }],
        clinicalNotes,
        aiSummary:
          aiSummary ||
          `Clinical Encounter: Vitals BP ${vitals.bp}, SpO2 ${vitals.spo2}%, Pulse ${vitals.pulse} bpm. Condition: ${diagnosisCondition}.`,
      });

      // 2. Create Prescription
      const validMeds = meds.filter((m) => m.medicineName.trim());
      if (validMeds.length > 0) {
        await axios.post('/api/records/prescriptions', {
          patientId: realPatientId,
          facilityId: selectedFacilityId,
          medications: validMeds,
          notes: `Prescribed during OPD consultation.`,
        });
      }

      // 3. Create Referral if requested
      if (showReferralForm) {
        await axios.post('/api/referrals', {
          patientId: realPatientId,
          referringFacilityId: selectedFacilityId,
          receivingFacilityId: receivingFacilityId || facilities[0]?._id,
          reason: referralReason,
          urgency: aiRiskResult?.aiRiskLevel === 'CRITICAL' ? 'EMERGENCY' : 'URGENT',
          clinicalSummary: `Consultation notes: ${clinicalNotes}. AI Triage: ${aiTriageResult?.urgency || 'MEDIUM'}`,
        });
      }

      setSuccessToast('Consultation and vitals saved successfully to patient record!');
      setTimeout(() => {
        navigate('/worker/queue');
      }, 1500);
    } catch (err) {
      alert('Failed to save consultation');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !patientData) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Loading patient clinical consultation workspace & longitudinal records...
      </div>
    );
  }

  const { user: patientUser, profile, medicalRecord, appointments = [], referrals = [] } = patientData;
  const encounters = medicalRecord?.encounters || [];
  const prescriptions = medicalRecord?.prescriptions || [];
  const labReports = medicalRecord?.labReports || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-white hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-brand-500/20">
            {patientUser?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{patientUser?.name}</h2>
              <Badge variant="info">PATIENT</Badge>
              {profile?.bloodGroup && profile.bloodGroup !== 'N/A' && (
                <Badge variant="neutral">Blood: {profile.bloodGroup}</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gender: {profile?.gender || 'MALE'} • DOB: {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '06/14/1975'} • Phone: {patientUser?.phone || 'N/A'} • District: {profile?.address?.district || 'Satara'}
            </p>
          </div>
        </div>

        {/* Facility Selector & Top Actions */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
            <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {facilities.map((fac) => (
                <option key={fac._id} value={fac._id} className="dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {fac.name}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" size="sm" icon={Video} onClick={() => setShowTeleconsult(true)} className="rounded-xl text-xs">
            Start Teleconsult
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Save}
            loading={saving}
            onClick={handleSaveConsultation}
            className="rounded-xl text-xs shadow-xs"
          >
            Save & Complete
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 w-full sm:w-max">
        {[
          { id: 'CONSULTATION', label: 'Consultation & Vitals Form' },
          { id: 'TIMELINE', label: `Encounters Timeline (${encounters.length})` },
          { id: 'PRESCRIPTIONS', label: `Prescriptions (${prescriptions.length})` },
          { id: 'APPOINTMENTS', label: `Appointments (${appointments.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CONSULTATION WORKSPACE */}
      {activeTab === 'CONSULTATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Clinical Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vitals Input Card */}
            <Card
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-rose-500" />
                    <span>Patient Vital Signs</span>
                  </div>
                  <Button
                    size="xs"
                    variant="outline"
                    icon={Save}
                    loading={savingVitals}
                    onClick={handleQuickSaveVitals}
                    className="text-[11px] rounded-lg"
                  >
                    Update Vitals Only
                  </Button>
                </div>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={vitals.bp}
                    onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl dark:text-slate-100 font-bold text-brand-600 dark:text-brand-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={vitals.pulse}
                    onChange={(e) => setVitals({ ...vitals, pulse: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temp}
                    onChange={(e) => setVitals({ ...vitals, temp: parseFloat(e.target.value) || 98.6 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={vitals.spo2}
                    onChange={(e) => setVitals({ ...vitals, spo2: parseInt(e.target.value) || 98 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={vitals.weight}
                    onChange={(e) => setVitals({ ...vitals, weight: parseFloat(e.target.value) || 68 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl dark:text-slate-100 font-bold"
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
                    placeholder="e.g. Headache, fever, chest tightness"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Diagnosis</label>
                  <input
                    type="text"
                    value={diagnosisCondition}
                    onChange={(e) => setDiagnosisCondition(e.target.value)}
                    placeholder="e.g. Acute Febrile Illness"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-slate-100 font-medium"
                  />
                </div>
              </div>
            </Card>

            {/* Prescriptions Builder */}
            <Card
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-emerald-600" />
                    <span>Medication Prescription Builder</span>
                  </div>
                  <Button
                    size="xs"
                    variant="outline"
                    icon={Plus}
                    onClick={() =>
                      setMeds([
                        ...meds,
                        { medicineName: '', dosage: '500mg', frequency: 'BD (Twice/day)', duration: '5 days' },
                      ])
                    }
                    className="text-[11px] rounded-lg"
                  >
                    Add Medicine
                  </Button>
                </div>
              }
            >
              <div className="space-y-2.5 text-xs">
                {meds.map((m, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={m.medicineName}
                      onChange={(e) => {
                        const updated = [...meds];
                        updated[i].medicineName = e.target.value;
                        setMeds(updated);
                      }}
                      placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                      className="p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
                    />
                    <input
                      type="text"
                      value={m.dosage}
                      onChange={(e) => {
                        const updated = [...meds];
                        updated[i].dosage = e.target.value;
                        setMeds(updated);
                      }}
                      placeholder="Dosage (500mg)"
                      className="p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
                    />
                    <input
                      type="text"
                      value={m.frequency}
                      onChange={(e) => {
                        const updated = [...meds];
                        updated[i].frequency = e.target.value;
                        setMeds(updated);
                      }}
                      placeholder="Frequency (TDS / BD / OD)"
                      className="p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
                    />
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={m.duration}
                        onChange={(e) => {
                          const updated = [...meds];
                          updated[i].duration = e.target.value;
                          setMeds(updated);
                        }}
                        placeholder="Duration (3 days)"
                        className="p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-100 font-medium flex-1"
                      />
                      {meds.length > 1 && (
                        <button
                          onClick={() => setMeds(meds.filter((_, mIdx) => mIdx !== i))}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Receiving Higher Facility
                      </label>
                      <select
                        value={receivingFacilityId}
                        onChange={(e) => setReceivingFacilityId(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl dark:text-slate-100 font-medium"
                      >
                        {facilities.map((fac) => (
                          <option key={fac._id} value={fac._id}>
                            {fac.name} ({fac.type || 'Hospital'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Referral Reason</label>
                      <input
                        type="text"
                        value={referralReason}
                        onChange={(e) => setReferralReason(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl dark:text-slate-100 font-medium"
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
              <div className="space-y-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-xl text-xs"
                  icon={Activity}
                  onClick={runAiTriage}
                >
                  Run AI Digital Triage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-xl text-xs"
                  icon={ShieldAlert}
                  onClick={runAiRisk}
                >
                  Run AI Risk Assessment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-xl text-xs"
                  icon={Bot}
                  onClick={generateSummary}
                >
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
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {aiTriageResult.recommendedNextAction}
                  </p>
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
      )}

      {/* TAB 2: LONGITUDINAL ENCOUNTERS TIMELINE */}
      {activeTab === 'TIMELINE' && (
        <div className="space-y-4">
          {encounters.length === 0 ? (
            <Card className="text-center py-12">
              <Activity className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No Prior Encounters</p>
              <p className="text-xs text-slate-400 mt-1">Encounters saved during OPD consultations will appear here.</p>
            </Card>
          ) : (
            encounters.map((enc) => (
              <div
                key={enc._id}
                className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {enc.facility?.name || 'Primary Health Centre'}
                    </span>
                    <Badge variant="info">Doctor Consultation</Badge>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(enc.encounterDate || enc.createdAt).toLocaleDateString()} at{' '}
                    {new Date(enc.encounterDate || enc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Vitals snapshot */}
                {enc.vitals && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold rounded-lg border border-rose-200">
                      BP: {enc.vitals.bp || '120/80'}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg border border-emerald-200">
                      Pulse: {enc.vitals.pulse || 72} bpm
                    </span>
                    <span className="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold rounded-lg border border-cyan-200">
                      SpO2: {enc.vitals.spo2 || 98}%
                    </span>
                    <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold rounded-lg border border-amber-200">
                      Temp: {enc.vitals.temp || 98.6}°F
                    </span>
                  </div>
                )}

                <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-800 dark:text-slate-200 font-bold">
                    Diagnosis: <span className="font-normal">{enc.diagnoses?.[0]?.condition || 'Clinical Evaluation'}</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Doctor Notes:</strong> {enc.clinicalNotes || 'Examination completed.'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PRESCRIPTIONS */}
      {activeTab === 'PRESCRIPTIONS' && (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <Card className="text-center py-12">
              <Pill className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No Prescriptions Recorded</p>
            </Card>
          ) : (
            prescriptions.map((p) => (
              <div key={p._id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Prescribed at {p.facility?.name || 'Healthcare Centre'}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(p.date || p.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {p.medications?.map((m, mIdx) => (
                    <div key={mIdx} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="font-bold text-brand-600 dark:text-brand-400">{m.medicineName}</p>
                      <p className="text-slate-500 text-[11px]">{m.dosage} • {m.frequency} • {m.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: APPOINTMENTS */}
      {activeTab === 'APPOINTMENTS' && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <Card className="text-center py-12">
              <Clock className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No Appointments Recorded</p>
            </Card>
          ) : (
            appointments.map((a) => (
              <div key={a._id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{a.facility?.name || 'Hospital'}</span>
                    <Badge variant="info">Token #{a.tokenNumber}</Badge>
                    <Badge variant={a.status === 'COMPLETED' ? 'success' : 'warning'}>{a.status}</Badge>
                  </div>
                  <p className="text-slate-500 mt-1 font-medium">Reason: {a.reason || 'General Checkup'} • Dept: {a.department}</p>
                  <p className="text-[11px] text-slate-400">Date: {new Date(a.date).toLocaleDateString()} at {a.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <WebRTCCallModal
        isOpen={showTeleconsult}
        onClose={() => setShowTeleconsult(false)}
        roomId={realPatientId}
        participantName={patientUser?.name || 'Patient'}
      />
    </div>
  );
};

