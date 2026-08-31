import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Activity,
  Edit2,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Save,
} from 'lucide-react';

export const DiagnosticManager = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editHours, setEditHours] = useState(2);
  const [editStatus, setEditStatus] = useState('AVAILABLE');
  const [saving, setSaving] = useState(false);

  // 1. Fetch available facilities
  useEffect(() => {
    axios
      .get('/api/facilities')
      .then((res) => {
        const facs = res.data || [];
        setFacilities(facs);
        const savedFac = localStorage.getItem('admin_selected_facility');
        if (savedFac && facs.some((f) => f._id === savedFac)) {
          setSelectedFacilityId(savedFac);
        } else if (facs.length > 0) {
          setSelectedFacilityId(facs[0]._id);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // 2. Fetch Diagnostics for selected facility
  useEffect(() => {
    if (!selectedFacilityId) return;
    localStorage.setItem('admin_selected_facility', selectedFacilityId);
    fetchDiagnostics(selectedFacilityId);
  }, [selectedFacilityId]);

  const fetchDiagnostics = async (facId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/diagnostics/facility/${facId}`);
      setDiagnostics(res.data || []);
    } catch (e) {
      console.error('Error loading diagnostics:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus, testName) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'LIMITED' : currentStatus === 'LIMITED' ? 'UNAVAILABLE' : 'AVAILABLE';
    try {
      await axios.patch(`/api/diagnostics/facility-diagnostic/${id}`, { availabilityStatus: nextStatus });
      setToast(`${testName || 'Diagnostic test'} status updated to ${nextStatus}!`);
      setTimeout(() => setToast(''), 3500);
      fetchDiagnostics(selectedFacilityId);
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleSaveEdit = async (id, testName) => {
    setSaving(true);
    try {
      await axios.patch(`/api/diagnostics/facility-diagnostic/${id}`, {
        availabilityStatus: editStatus,
        estimatedReportTimeHours: parseFloat(editHours) || 2,
      });
      setToast(`Updated diagnostic details for ${testName}!`);
      setTimeout(() => setToast(''), 3500);
      setEditItem(null);
      fetchDiagnostics(selectedFacilityId);
    } catch (e) {
      alert('Failed to update diagnostic');
    } finally {
      setSaving(false);
    }
  };

  const totalTests = diagnostics.length;
  const availableCount = diagnostics.filter((d) => d.availabilityStatus === 'AVAILABLE').length;
  const limitedCount = diagnostics.filter((d) => d.availabilityStatus === 'LIMITED').length;
  const unavailableCount = diagnostics.filter((d) => d.availabilityStatus === 'UNAVAILABLE').length;

  const filteredDiagnostics = diagnostics.filter((diag) => {
    const name = diag.diagnosticService?.name?.toLowerCase() || '';
    const code = diag.diagnosticService?.code?.toLowerCase() || '';
    const cat = diag.diagnosticService?.category?.toLowerCase() || '';
    const q = searchTerm.toLowerCase();
    return name.includes(q) || code.includes(q) || cat.includes(q);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header with Facility Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Diagnostic Services Manager
            </h2>
            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center">
              <Activity className="w-3 h-3 mr-1" /> Lab & Imaging Live Status
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage CBC, X-Ray, ECG, ultrasound and pathology test availability and turnaround times for patients.
          </p>
        </div>

        {/* Facility Dropdown */}
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-xs">
          <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            {facilities.map((fac) => (
              <option key={fac._id} value={fac._id} className="dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                {fac.name} ({fac.type || 'Facility'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="p-4 bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast('')} className="text-white hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Diagnostic Tests"
          value={`${totalTests} Services`}
          change="Facility diagnostics menu"
          icon={Activity}
          color="brand"
        />
        <StatCard
          title="Fully Available"
          value={`${availableCount} Ready`}
          change="Fast turnaround"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Limited Reagents"
          value={`${limitedCount} Partial`}
          change="Supply constraint"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Down / Offline"
          value={`${unavailableCount} Unavailable`}
          change="Equipment maintenance"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search diagnostic test name, test code, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium dark:text-slate-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Diagnostics List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium">Loading facility diagnostic services...</div>
      ) : filteredDiagnostics.length === 0 ? (
        <Card className="text-center py-12">
          <Activity className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="font-bold text-slate-700 dark:text-slate-300">No diagnostic services found</p>
        </Card>
      ) : (
        <div className="space-y-3 text-xs">
          {filteredDiagnostics.map((diag) => {
            const isEditing = editItem === diag._id;
            const isAvailable = diag.availabilityStatus === 'AVAILABLE';
            const isLimited = diag.availabilityStatus === 'LIMITED';

            return (
              <Card key={diag._id} className="transition-all hover:border-slate-300 dark:hover:border-slate-600">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {diag.diagnosticService?.name || 'Diagnostic Test'}
                      </span>
                      <Badge variant={isAvailable ? 'success' : isLimited ? 'warning' : 'danger'}>
                        {diag.availabilityStatus}
                      </Badge>
                      {diag.diagnosticService?.category && (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold">
                          {diag.diagnosticService.category}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Code: <strong>{diag.diagnosticService?.code || 'PATH-01'}</strong> • Estimated Turnaround: <strong>~{diag.estimatedReportTimeHours} hours</strong>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Pricing: {diag.priceInINR > 0 ? `₹${diag.priceInINR}` : 'Free Government Scheme (PM-JAY / NHM)'}
                    </p>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold dark:text-slate-100"
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="LIMITED">LIMITED</option>
                          <option value="UNAVAILABLE">UNAVAILABLE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Turnaround (Hours)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={editHours}
                          onChange={(e) => setEditHours(e.target.value)}
                          className="w-20 p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold dark:text-slate-100"
                        />
                      </div>
                      <div className="flex items-center space-x-1 pt-4">
                        <Button
                          size="sm"
                          variant="success"
                          icon={Save}
                          loading={saving}
                          onClick={() => handleSaveEdit(diag._id, diag.diagnosticService?.name)}
                          className="rounded-xl font-bold text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditItem(null)}
                          className="rounded-xl text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={isAvailable ? 'warning' : 'success'}
                        onClick={() => toggleStatus(diag._id, diag.availabilityStatus, diag.diagnosticService?.name)}
                        className="rounded-xl text-xs font-bold"
                      >
                        {isAvailable ? 'Mark Limited' : 'Mark Available'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Edit2}
                        onClick={() => {
                          setEditItem(diag._id);
                          setEditStatus(diag.availabilityStatus);
                          setEditHours(diag.estimatedReportTimeHours);
                        }}
                        className="rounded-xl text-xs font-bold"
                      >
                        Edit Details
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

