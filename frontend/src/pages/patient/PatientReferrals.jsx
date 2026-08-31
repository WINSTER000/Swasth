import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  GitBranch,
  ArrowRight,
  Hospital,
  Calendar,
  CheckCircle2,
  Plus,
  Printer,
  ExternalLink,
  ShieldCheck,
  Clock,
  Building2,
  Stethoscope,
  X,
} from 'lucide-react';

export const PatientReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Request Referral Form State
  const [formData, setFormData] = useState({
    referringFacilityId: '',
    receivingFacilityId: '',
    department: 'Cardiology & Critical Care',
    reason: '',
    urgency: 'ROUTINE',
    clinicalSummary: '',
  });

  const fetchData = async () => {
    try {
      const [refRes, facRes] = await Promise.all([
        axios.get('/api/patients/me/referrals'),
        axios.get('/api/facilities'),
      ]);
      setReferrals(refRes.data || []);
      setFacilities(facRes.data || []);
      if (facRes.data && facRes.data.length > 1) {
        setFormData((prev) => ({
          ...prev,
          referringFacilityId: facRes.data[0]._id,
          receivingFacilityId: facRes.data[1]._id,
        }));
      }
    } catch (e) {
      console.error('Failed to load referrals data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestReferral = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/referrals', formData);
      await fetchData();
      setShowRequestModal(false);
      setFormData((prev) => ({
        ...prev,
        reason: '',
        clinicalSummary: '',
      }));
    } catch (err) {
      console.error('Failed to request referral:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading medical referrals continuum...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Medical Referrals Continuum
            </h2>
            <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800 flex items-center">
              <GitBranch className="w-3 h-3 mr-1" /> Multi-Tier Healthcare
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track and manage hospital referrals from Primary Health Centres (PHCs) to Secondary and Tertiary District Hospitals.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowRequestModal(true)}
            className="text-xs shadow-xs cursor-pointer"
          >
            Request Specialist Referral
          </Button>
        </div>
      </div>

      {/* Referrals List */}
      <div className="space-y-4">
        {referrals.length === 0 ? (
          <Card className="text-center py-10 space-y-3">
            <GitBranch className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">No medical referrals recorded on file.</p>
            <Button size="sm" variant="outline" onClick={() => setShowRequestModal(true)}>
              Request Secondary Referral
            </Button>
          </Card>
        ) : (
          referrals.map((ref) => (
            <div
              key={ref._id}
              className="bg-white dark:bg-slate-800/95 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4 hover:border-brand-500/50 transition-all"
            >
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={ref.urgency === 'URGENT' ? 'danger' : ref.urgency === 'EMERGENCY' ? 'danger' : 'warning'}>
                    Urgency: {ref.urgency || 'ROUTINE'}
                  </Badge>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Dept: {ref.department || 'General Medicine'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-800">
                    STATUS: {ref.status || 'SENT'}
                  </span>
                </div>
              </div>

              {/* Multi-Tier Flow Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-extrabold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Hospital className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">From (Primary Care)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ref.referringFacility?.name || 'Local PHC'}</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center justify-center text-slate-400">
                  <ArrowRight className="w-5 h-5 text-brand-500" />
                </div>

                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">To (Tertiary / Specialist)</span>
                    <span className="text-xs font-bold text-brand-700 dark:text-brand-300">{ref.receivingFacility?.name || 'District General Hospital'}</span>
                  </div>
                </div>
              </div>

              {/* Details & Clinical Summary */}
              <div className="text-xs space-y-1.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Reason for Referral: <span className="font-normal text-slate-700 dark:text-slate-300">{ref.reason}</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-800 dark:text-slate-200">Clinical Summary:</strong> {ref.clinicalSummary}
                </p>
                {ref.referringHealthWorker?.name && (
                  <p className="text-[11px] text-slate-400">
                    Referred by: <strong>{ref.referringHealthWorker.name}</strong> • Date: {new Date(ref.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Referral Slip</span>
                </button>

                <div className="flex items-center space-x-2">
                  {ref.receivingFacility?._id && (
                    <Link to={`/patient/facilities/${ref.receivingFacility._id}`}>
                      <Button variant="outline" size="sm" icon={ExternalLink} className="text-xs">
                        View Hospital Info
                      </Button>
                    </Link>
                  )}

                  {ref.receivingFacility?._id && (
                    <Link
                      to={`/patient/appointments/book?facilityId=${ref.receivingFacility._id}&department=${encodeURIComponent(
                        ref.department || 'General Medicine'
                      )}&reason=${encodeURIComponent('Referral: ' + ref.reason)}`}
                    >
                      <Button variant="primary" size="sm" icon={ArrowRight} className="text-xs">
                        Book Token at Referred Hospital
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Specialist Referral Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Request Specialist Referral</h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestReferral} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Referring Primary Facility (PHC/Clinic) *
                </label>
                <select
                  value={formData.referringFacilityId}
                  onChange={(e) => setFormData({ ...formData, referringFacilityId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                  required
                >
                  {facilities.map((fac) => (
                    <option key={fac._id} value={fac._id}>
                      {fac.name} ({fac.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Receiving Hospital (Secondary/Tertiary) *
                </label>
                <select
                  value={formData.receivingFacilityId}
                  onChange={(e) => setFormData({ ...formData, receivingFacilityId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                  required
                >
                  {facilities.map((fac) => (
                    <option key={fac._id} value={fac._id}>
                      {fac.name} ({fac.district || 'District Centre'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Department Specialty *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="Cardiology & Critical Care">Cardiology</option>
                    <option value="General Medicine & OPD">General Medicine</option>
                    <option value="Maternal & Child Health">Maternal & Child Health</option>
                    <option value="Orthopedics & Trauma">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Urgency Level *
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="PRIORITY">Priority</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Reason for Referral *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cardiac evaluation and 2D Echo review"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Clinical Summary & Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Clinical observations, prior vitals, current medication regimen..."
                  value={formData.clinicalSummary}
                  onChange={(e) => setFormData({ ...formData, clinicalSummary: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRequestModal(false)}
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
                  Submit Referral Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

