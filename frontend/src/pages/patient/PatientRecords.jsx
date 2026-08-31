import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  FileText,
  Activity,
  Pill,
  FlaskConical,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Printer,
  Download,
  Calendar,
  Hospital,
  Heart,
  Thermometer,
  Gauge,
  Droplets,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  User,
} from 'lucide-react';

export const PatientRecords = () => {
  const [record, setRecord] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'ENCOUNTERS', 'PRESCRIPTIONS', 'LABS', 'VITALS'
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Add Record Form State
  const [formData, setFormData] = useState({
    facilityId: '',
    facilityName: '',
    chiefComplaints: '',
    bp: '120/80',
    pulse: '74',
    spo2: '98',
    temp: '98.6',
    weight: '68',
    diagnoses: '',
    severity: 'MILD',
    medName: '',
    medDosage: '',
    medFrequency: '',
    medDuration: '',
    labTestName: '',
    labResult: '',
    clinicalNotes: '',
  });

  const fetchRecords = async () => {
    try {
      const [recRes, facRes] = await Promise.all([
        axios.get('/api/patients/me/records'),
        axios.get('/api/facilities'),
      ]);
      setRecord(recRes.data);
      setFacilities(facRes.data || []);
      if (facRes.data && facRes.data.length > 0 && !formData.facilityId) {
        setFormData((prev) => ({ ...prev, facilityId: facRes.data[0]._id, facilityName: facRes.data[0].name }));
      }
    } catch (e) {
      console.error('Failed to load medical records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        facilityId: formData.facilityId,
        facilityName: formData.facilityName,
        chiefComplaints: [formData.chiefComplaints || 'General Clinical Consultation'],
        vitals: {
          bp: formData.bp || '120/80',
          pulse: parseInt(formData.pulse) || 72,
          spo2: parseInt(formData.spo2) || 98,
          temp: parseFloat(formData.temp) || 98.6,
          weight: parseFloat(formData.weight) || 68,
        },
        diagnoses: [
          {
            condition: formData.diagnoses || 'Routine Health Evaluation',
            severity: formData.severity,
            type: 'PRIMARY',
          },
        ],
        medications: formData.medName
          ? [
              {
                medicineName: formData.medName,
                dosage: formData.medDosage || '500mg',
                frequency: formData.medFrequency || 'Twice daily',
                duration: formData.medDuration || '5 days',
              },
            ]
          : [],
        labTestName: formData.labTestName || '',
        labResult: formData.labResult || '',
        clinicalNotes: formData.clinicalNotes || 'Self-recorded clinical consultation entry.',
      };

      await axios.post('/api/records/patient-entry', payload);
      await fetchRecords();
      setShowAddModal(false);
      // Reset form
      setFormData((prev) => ({
        ...prev,
        chiefComplaints: '',
        diagnoses: '',
        medName: '',
        medDosage: '',
        medFrequency: '',
        medDuration: '',
        labTestName: '',
        labResult: '',
        clinicalNotes: '',
      }));
    } catch (err) {
      console.error('Failed to save record entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintSummary = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading comprehensive longitudinal records...</div>;
  }

  const encounters = record?.encounters || [];
  const prescriptions = record?.prescriptions || [];
  const labReports = record?.labReports || [];

  // Latest Vitals from the most recent encounter
  const latestVitals = encounters.length > 0 && encounters[0].vitals ? encounters[0].vitals : { bp: '124/80', pulse: 76, spo2: 98, temp: 98.6 };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Digital Longitudinal Health Records
            </h2>
            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" /> ABHA Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your unified clinical history, consultation encounters, prescriptions, and laboratory diagnostics across all healthcare facilities.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrintSummary}
            className="text-xs shadow-xs cursor-pointer"
          >
            Print Health Summary
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
            className="text-xs shadow-xs cursor-pointer"
          >
            Add / Record Clinical Entry
          </Button>
        </div>
      </div>

      {/* Vitals Summary Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood Pressure</p>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">{latestVitals.bp || '120/80'} <span className="text-[10px] font-normal text-slate-400">mmHg</span></p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pulse Rate</p>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">{latestVitals.pulse || 76} <span className="text-[10px] font-normal text-slate-400">bpm</span></p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center flex-shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Oxygen (SpO2)</p>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">{latestVitals.spo2 || 99}% <span className="text-[10px] font-normal text-slate-400">Normal</span></p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Body Temp</p>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">{latestVitals.temp || 98.6}°F</p>
          </div>
        </div>
      </div>

      {/* Filter Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 w-full sm:w-max">
        {[
          { id: 'ALL', label: 'All Records', count: encounters.length + prescriptions.length + labReports.length },
          { id: 'ENCOUNTERS', label: 'Clinical Encounters', count: encounters.length },
          { id: 'PRESCRIPTIONS', label: 'Active Prescriptions', count: prescriptions.length },
          { id: 'LABS', label: 'Laboratory Diagnostics', count: labReports.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Records Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Clinical Encounters Timeline */}
        {(activeTab === 'ALL' || activeTab === 'ENCOUNTERS') && (
          <div className={`${activeTab === 'ENCOUNTERS' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center">
                <Stethoscope className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                Hospital Encounters & Consultation Timeline
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{encounters.length} Total Visits</span>
            </div>

            {encounters.length === 0 ? (
              <Card className="text-center py-10 space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">No clinical encounters recorded yet.</p>
                <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
                  Add First Record Entry
                </Button>
              </Card>
            ) : (
              encounters.map((enc) => (
                <div
                  key={enc._id}
                  className="bg-white dark:bg-slate-800/95 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4 hover:border-emerald-500/60 transition-all"
                >
                  {/* Encounter Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800">
                        <Hospital className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {enc.facility?.name || 'Healthcare Centre'}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                          <span>Date: {new Date(enc.encounterDate).toLocaleDateString()}</span>
                          {enc.healthWorker?.name && <span>• Doctor: {enc.healthWorker.name}</span>}
                          {enc.facility?.district && <span>• {enc.facility.district}</span>}
                        </p>
                      </div>
                    </div>

                    <Badge variant="success">Verified Clinical Encounter</Badge>
                  </div>

                  {/* Vitals Row */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Vitals Recorded at Visit:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 dark:text-slate-400 font-medium">
                      <span>BP: <strong className="text-slate-900 dark:text-slate-100">{enc.vitals?.bp || '120/80'} mmHg</strong></span>
                      <span>Pulse: <strong className="text-slate-900 dark:text-slate-100">{enc.vitals?.pulse || 76} bpm</strong></span>
                      <span>SpO2: <strong className="text-slate-900 dark:text-slate-100">{enc.vitals?.spo2 || 99}%</strong></span>
                      <span>Temp: <strong className="text-slate-900 dark:text-slate-100">{enc.vitals?.temp || 98.6}°F</strong></span>
                    </div>
                  </div>

                  {/* Diagnoses */}
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block mb-1.5">
                      Clinical Diagnoses & Evaluation:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {enc.diagnoses && enc.diagnoses.length > 0 ? (
                        enc.diagnoses.map((d, i) => (
                          <span
                            key={i}
                            className="bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1"
                          >
                            <span>{d.condition}</span>
                            <span className="text-[9px] uppercase opacity-75">({d.severity})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">Routine physical evaluation</span>
                      )}
                    </div>
                  </div>

                  {/* Clinical Notes & AI Summary */}
                  {enc.clinicalNotes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong>Doctor Notes:</strong> {enc.clinicalNotes}
                    </p>
                  )}

                  {enc.aiSummary && (
                    <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 text-xs space-y-1">
                      <div className="flex items-center space-x-1 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>AI Clinical Summary</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{enc.aiSummary}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Right Col: Prescriptions & Diagnostic Reports */}
        {(activeTab === 'ALL' || activeTab === 'PRESCRIPTIONS' || activeTab === 'LABS') && (
          <div className={`${activeTab === 'ALL' ? 'space-y-6' : 'lg:col-span-3 space-y-6'}`}>
            {/* Prescriptions */}
            {(activeTab === 'ALL' || activeTab === 'PRESCRIPTIONS') && (
              <Card
                title="Active Prescriptions & Medicines"
                subtitle={`${prescriptions.length} Dispensations on Record`}
                action={<Badge variant="info">Hospital Pharmacy</Badge>}
              >
                <div className="space-y-3">
                  {prescriptions.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">No prescriptions recorded yet.</p>
                  ) : (
                    prescriptions.map((p) => (
                      <div
                        key={p._id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-extrabold text-slate-900 dark:text-slate-100">{p.facility?.name || 'Hospital Pharmacy'}</p>
                          <span className="text-[10px] text-slate-400">{new Date(p.date || p.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-1.5">
                          {p.medications?.map((m, idx) => (
                            <div
                              key={idx}
                              className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 block">{m.medicineName}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {m.dosage} • {m.frequency} ({m.duration})
                                </span>
                              </div>
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold">
                                Active
                              </span>
                            </div>
                          ))}
                        </div>

                        {p.notes && <p className="text-[10px] text-slate-500 italic mt-1">{p.notes}</p>}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {/* Diagnostic Lab Reports */}
            {(activeTab === 'ALL' || activeTab === 'LABS') && (
              <Card
                title="Laboratory & Diagnostic Reports"
                subtitle={`${labReports.length} Tests Conducted`}
                action={<Badge variant="success">Diagnostic Lab</Badge>}
              >
                <div className="space-y-2.5 text-xs">
                  {labReports.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">No lab diagnostic reports on record.</p>
                  ) : (
                    labReports.map((lab) => (
                      <div
                        key={lab._id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100">{lab.testName}</span>
                          <Badge variant={lab.status === 'COMPLETED' ? 'success' : 'warning'}>{lab.status}</Badge>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{lab.result}</p>
                        <p className="text-[10px] text-slate-400">
                          {lab.facility?.name || 'Central Pathology'} • {new Date(lab.date || lab.createdAt).toLocaleDateString()}
                          {lab.referenceRange && ` • Ref: ${lab.referenceRange}`}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Add Real Medical Record Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Add Real Medical Record Entry</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Facility Picker */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Healthcare Facility / Hospital *
                </label>
                <select
                  value={formData.facilityId}
                  onChange={(e) => {
                    const sel = facilities.find((f) => f._id === e.target.value);
                    setFormData({ ...formData, facilityId: e.target.value, facilityName: sel?.name || '' });
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {facilities.map((fac) => (
                    <option key={fac._id} value={fac._id}>
                      {fac.name} ({fac.district || 'Rural Center'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chief Complaints */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Symptoms & Chief Complaints *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild headache, fever for 2 days, chest congestion"
                  value={formData.chiefComplaints}
                  onChange={(e) => setFormData({ ...formData, chiefComplaints: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs"
                  required
                />
              </div>

              {/* Vitals Row */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block font-extrabold uppercase tracking-wider text-[10px] text-slate-400">
                  Recorded Clinical Vitals
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">BP (mmHg)</span>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={formData.bp}
                      onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs text-slate-900 dark:text-slate-100 font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Pulse (bpm)</span>
                    <input
                      type="number"
                      placeholder="72"
                      value={formData.pulse}
                      onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs text-slate-900 dark:text-slate-100 font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">SpO2 (%)</span>
                    <input
                      type="number"
                      placeholder="98"
                      value={formData.spo2}
                      onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs text-slate-900 dark:text-slate-100 font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Temp (°F)</span>
                    <input
                      type="text"
                      placeholder="98.6"
                      value={formData.temp}
                      onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs text-slate-900 dark:text-slate-100 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Diagnosis Condition
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acute Viral Bronchitis, Essential Hypertension"
                    value={formData.diagnoses}
                    onChange={(e) => setFormData({ ...formData, diagnoses: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Severity
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs"
                  >
                    <option value="MILD">Mild</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="SEVERE">Severe</option>
                  </select>
                </div>
              </div>

              {/* Prescribed Medicine */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block font-extrabold uppercase tracking-wider text-[10px] text-slate-400">
                  Prescription / Medication (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Medicine Name (e.g. Azithromycin 500mg)"
                    value={formData.medName}
                    onChange={(e) => setFormData({ ...formData, medName: e.target.value })}
                    className="p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500mg Once Daily)"
                    value={formData.medDosage}
                    onChange={(e) => setFormData({ ...formData, medDosage: e.target.value })}
                    className="p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Lab Test Report */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block font-extrabold uppercase tracking-wider text-[10px] text-slate-400">
                  Diagnostic Lab Report (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Test Name (e.g. 12-Lead ECG / Blood Sugar)"
                    value={formData.labTestName}
                    onChange={(e) => setFormData({ ...formData, labTestName: e.target.value })}
                    className="p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Result (e.g. Normal Sinus Rhythm, 95 mg/dL)"
                    value={formData.labResult}
                    onChange={(e) => setFormData({ ...formData, labResult: e.target.value })}
                    className="p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Doctor Notes & Consultation Advice
                </label>
                <textarea
                  rows="2"
                  placeholder="Clinical observations, recovery instructions, diet advice..."
                  value={formData.clinicalNotes}
                  onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  icon={Plus}
                >
                  Save to Health Records
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

