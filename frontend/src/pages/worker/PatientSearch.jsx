import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Search,
  User,
  FileText,
  Activity,
  ShieldAlert,
  HeartPulse,
  Users,
  Stethoscope,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientSearch = () => {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialPatients();
  }, []);

  const fetchInitialPatients = async () => {
    setLoading(true);
    try {
      // Fetch patients via search endpoint or directory
      const res = await axios.get('/api/patients/search?query=');
      if (res.data && res.data.length > 0) {
        setPatients(res.data);
      } else {
        // Fallback search with single space or wildcard to retrieve all
        const fallbackRes = await axios.get('/api/patients/search?query=a');
        setPatients(fallbackRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load patient directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`/api/patients/search?query=${encodeURIComponent(query.trim())}`);
      setPatients(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Patient Directory & Longitudinal Timeline
            </h2>
            <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
              {patients.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search authorized patient clinical records, vitals history, and consultation workspaces across all PHCs and District Hospitals.
          </p>
        </div>
      </div>

      {/* Search Bar Card */}
      <Card>
        <form onSubmit={handleSearch} className="flex items-center space-x-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by patient name (e.g. Ramesh Patil), email, phone, or condition..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value === '') fetchInitialPatients();
              }}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100 shadow-xs font-medium"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            icon={Search}
            className="rounded-2xl px-5 text-xs font-bold"
          >
            Search Patients
          </Button>
        </form>
      </Card>

      {/* Patient List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
            Loading registered patient directory...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-sm">No patients found matching "{query}"</p>
            <p className="text-xs text-slate-400 mt-1">Try searching by name (e.g. Ramesh, Sunita) or phone number.</p>
          </div>
        ) : (
          patients.map((profile) => {
            const patientUser = profile.user || profile;
            const patientId = patientUser._id || profile._id;

            return (
              <div
                key={profile._id || patientId}
                className="bg-white dark:bg-slate-800/95 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300 transition-all"
              >
                {/* Left: Patient Profile Info */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-brand-500/20 flex-shrink-0">
                    {patientUser.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                        {patientUser.name || 'Patient'}
                      </h4>
                      <Badge variant="info">PATIENT</Badge>
                      {profile.bloodGroup && profile.bloodGroup !== 'N/A' && (
                        <Badge variant="neutral">Blood: {profile.bloodGroup}</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {patientUser.phone && (
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-slate-400" />
                          {patientUser.phone}
                        </span>
                      )}
                      <span>Gender: {profile.gender || 'MALE'}</span>
                      {profile.dateOfBirth && (
                        <span>DOB: {new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                      )}
                      {profile.address?.district && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                          {profile.address.district}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
                  <Link to={`/worker/patients/${patientId}`}>
                    <Button size="sm" variant="primary" icon={Stethoscope} className="rounded-2xl text-xs font-bold shadow-xs">
                      Open Consultation Workspace
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

