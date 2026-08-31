import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  Search,
  X,
  Hospital,
  User,
  Activity,
  FileText,
  GitBranch,
  Stethoscope,
  ChevronRight,
  Sparkles,
  Loader2,
  Calendar,
  PhoneCall,
  ShieldCheck,
  Building2,
  HeartPulse,
} from 'lucide-react';

export const GlobalSearch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientResults, setPatientResults] = useState({ facilities: [], doctors: [], services: [], departments: [] });
  const [doctorResults, setDoctorResults] = useState({ patients: [], records: [], referrals: [] });

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const isPatient = user?.role === 'PATIENT';

  const placeholderText = isPatient
    ? 'Search facilities, doctors, services…'
    : 'Search patients, records, referrals…';

  // Global hotkey: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'f')) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setPatientResults({ facilities: [], doctors: [], services: [], departments: [] });
      setDoctorResults({ patients: [], records: [], referrals: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (isPatient) {
          const res = await axios.get(`/api/search/patient?q=${encodeURIComponent(query.trim())}`);
          setPatientResults(res.data || { facilities: [], doctors: [], services: [], departments: [] });
        } else {
          const res = await axios.get(`/api/search/doctor?q=${encodeURIComponent(query.trim())}`);
          setDoctorResults(res.data || { patients: [], records: [], referrals: [] });
        }
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isPatient]);

  const handleSelect = (url) => {
    setIsOpen(false);
    setQuery('');
    navigate(url);
  };

  const hasPatientResults =
    patientResults.facilities.length > 0 ||
    patientResults.doctors.length > 0 ||
    patientResults.services.length > 0 ||
    patientResults.departments.length > 0;

  const hasDoctorResults =
    doctorResults.patients.length > 0 ||
    doctorResults.records.length > 0 ||
    doctorResults.referrals.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm hidden sm:block">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholderText}
          className="w-full pl-8 pr-16 py-1.5 bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
        />

        <div className="absolute right-2 top-1.5 flex items-center space-x-1">
          {loading && <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin mr-1" />}
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 pointer-events-none">
              ⌘K
            </span>
          )}
        </div>
      </div>

      {/* Floating Results Popover */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[480px] overflow-y-auto">
          {/* PATIENT SEARCH RESULTS */}
          {isPatient && (
            <div className="p-2 space-y-3">
              {/* Facilities Section */}
              {patientResults.facilities.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                    <Hospital className="w-3 h-3 text-emerald-500" />
                    <span>Healthcare Facilities</span>
                  </div>
                  <div className="space-y-1 mt-0.5">
                    {patientResults.facilities.map((f) => (
                      <div
                        key={f._id}
                        onClick={() => handleSelect(`/patient/facilities/${f._id}`)}
                        className="px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{f.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {f.type} • {f.district || 'Rural Center'} {f.address ? `• ${f.address}` : ''}
                          </p>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                          View Details
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctors & Specialists Section */}
              {patientResults.doctors.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                    <Stethoscope className="w-3 h-3 text-teal-500" />
                    <span>Doctors & Specialists</span>
                  </div>
                  <div className="space-y-1 mt-0.5">
                    {patientResults.doctors.map((doc) => (
                      <div
                        key={doc._id}
                        onClick={() => handleSelect(`/patient/teleconsult`)}
                        className="px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{doc.name}</p>
                          <p className="text-[10px] text-teal-600 dark:text-teal-400">
                            Medical Officer • Available for Teleconsultation
                          </p>
                        </div>
                        <span className="text-[10px] bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold flex-shrink-0 flex items-center">
                          <PhoneCall className="w-2.5 h-2.5 mr-1" /> Teleconsult
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services & Diagnostics */}
              {patientResults.services.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-indigo-500" />
                    <span>Healthcare Services & Diagnostics</span>
                  </div>
                  <div className="space-y-1 mt-0.5">
                    {patientResults.services.map((srv, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelect(srv.link)}
                        className="px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{srv.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{srv.desc}</p>
                        </div>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                          {srv.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Departments */}
              {patientResults.departments.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-amber-500" />
                    <span>Clinical Departments</span>
                  </div>
                  <div className="space-y-1 mt-0.5">
                    {patientResults.departments.map((dept, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelect(dept.link)}
                        className="px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{dept.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{dept.desc}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && !hasPatientResults && (
                <div className="text-center py-6 px-4">
                  <Hospital className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No facilities or services found</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Try searching for "PHC", "Hospital", "Dr. Anand", "ECG", or "General Medicine"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* DOCTOR / HEALTH WORKER SEARCH RESULTS */}
          {!isPatient && (
            <div className="p-2 space-y-3">
              {/* Patients Section */}
              {doctorResults.patients.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                    <User className="w-3 h-3 text-emerald-500" />
                    <span>Authorized Patient Records</span>
                  </div>
                  <div className="space-y-1 mt-0.5">
                    {doctorResults.patients.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => handleSelect(`/worker/patients/${p._id}`)}
                        className="px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {p.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {p.phone || p.email} • {p.district || 'Rural District'} {p.bloodGroup !== 'N/A' ? `• ${p.bloodGroup}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                          Timeline
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Encounters / Clinical Diagnoses */}
              {doctorResults.records.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-brand-500" />
                    <span>Clinical Encounters & Diagnoses</span>
                  </div>
                  <div className="space-y-1 mt-0.5">
                    {doctorResults.records.map((rec) => (
                      <div
                        key={rec._id}
                        onClick={() => handleSelect(`/worker/consultation/${rec.patientId || 'active'}`)}
                        className="px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {rec.patientName} — {rec.diagnoses.join(', ') || rec.complaints.join(', ') || 'Consultation Note'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {rec.facilityName} • {new Date(rec.encounterDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-[10px] bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                          Consult
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referrals Section */}
              {doctorResults.referrals.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                    <GitBranch className="w-3 h-3 text-amber-500" />
                    <span>Care Continuum Referrals</span>
                  </div>
                  <div className="space-y-1 mt-0.5">
                    {doctorResults.referrals.map((ref) => (
                      <div
                        key={ref._id}
                        onClick={() => handleSelect(`/worker/referrals`)}
                        className="px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {ref.patient?.name || 'Patient'}: {ref.reason}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {ref.referringFacility?.name} ➔ {ref.receivingFacility?.name}
                          </p>
                        </div>
                        <span className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                          {ref.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && !hasDoctorResults && (
                <div className="text-center py-6 px-4">
                  <User className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No patient records or referrals found</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Try searching by patient name (e.g. "Ramesh"), diagnosis ("Hypertension"), or referral reason
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
