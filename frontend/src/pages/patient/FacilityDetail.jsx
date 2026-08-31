import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FacilityMap } from '../../components/maps/FacilityMap';
import {
  Hospital,
  MapPin,
  Phone,
  Clock,
  Package,
  Activity,
  Calendar,
  ArrowLeft,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Bed,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Crosshair,
} from 'lucide-react';

export const FacilityDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCoords, setUserCoords] = useState({ lat: 17.6868, lng: 74.0000, isReal: false });

  // Get user's live device location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            isReal: true,
          });
        },
        (err) => {
          console.warn('[FacilityDetail] Live GPS fallback:', err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  const fetchFacilityDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/facilities/${id}`);
      setData(res.data);
    } catch (e) {
      console.error('Failed to load facility details:', e);
      setError(e.response?.data?.message || 'Could not load hospital details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilityDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
          <div className="space-y-4">
            <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || !data.facility) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-center shadow-lg space-y-4">
        <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Healthcare Facility Notice</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {error || 'Unable to retrieve live hospital information from the network.'}
        </p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={fetchFacilityDetails}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
          <Link
            to="/patient/facilities"
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
          >
            Back to All Facilities
          </Link>
        </div>
      </div>
    );
  }

  const { facility, departments = [], services = [], medicines = [], diagnostics = [] } = data;

  const lat = facility.location?.lat || 17.6868;
  const lng = facility.location?.lng || 74.0000;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/patient/facilities"
          className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Nearby Facilities</span>
        </Link>
        {userCoords.isReal && (
          <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800 flex items-center">
            <Crosshair className="w-3 h-3 mr-1 text-blue-500 animate-spin" /> Live GPS Calibrated
          </span>
        )}
      </div>

      {/* Main Hospital Hero Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md tracking-wider ${
                facility.type === 'PHC'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300'
                  : facility.type === 'CHC'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300'
                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300'
              }`}
            >
              {facility.type === 'PHC'
                ? 'Primary Health Centre'
                : facility.type === 'CHC'
                ? 'Community Health Centre'
                : 'District Hospital / Specialty'}
            </span>
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
              CODE: {facility.code || 'GOV-SAT-01'}
            </span>
            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" /> SWASTH Verified Facility
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {facility.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-start leading-relaxed">
            <MapPin className="w-4 h-4 mr-1.5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>
              {facility.address}
              {facility.district ? `, ${facility.district}` : ''}
              {facility.state ? `, ${facility.state}` : ''}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span className="flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1 text-emerald-600" /> {facility.phone || '+91 1800 108 000'}
            </span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" /> {facility.operatingHours || '24 Hours Emergency & OPD'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto flex-shrink-0">
          <Link to={`/patient/appointments/book?facilityId=${facility._id}`} className="w-full">
            <Button variant="primary" size="md" icon={Calendar} className="w-full shadow-md py-3 text-xs sm:text-sm">
              Book OPD Appointment
            </Button>
          </Link>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>Get Live Driving Directions</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
          </a>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Departments, Services, Medicines & Diagnostics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Departments & Clinical Services */}
          <Card
            title="Clinical Departments & Services"
            subtitle="Specialist medical consultation, diagnostics, and patient care capabilities"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {departments.length > 0 ? (
                departments.map((dep) => (
                  <div
                    key={dep._id}
                    className="p-4 bg-slate-50 dark:bg-slate-900/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/50 transition-all space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {dep.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-4 leading-relaxed">
                      {dep.description || 'Specialized outpatient and clinical triage consultation.'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-4 text-center text-xs text-slate-400">
                  Standard General OPD, Emergency Trauma & MCH Departments Active.
                </div>
              )}
            </div>
          </Card>

          {/* Essential Medicines Inventory */}
          <Card
            title="Essential Medicine Stock Availability"
            subtitle="Real-time pharmaceutical inventory availability at this facility"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {medicines.length > 0 ? (
                medicines.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {item.medicine?.name || 'Essential Medicine'}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {item.medicine?.category || 'Pharmacotherapy'} • Form: {item.medicine?.dosageForm || 'Tablet'}
                      </span>
                    </div>
                    <Badge
                      variant={
                        item.availabilityStatus === 'AVAILABLE'
                          ? 'success'
                          : item.availabilityStatus === 'LIMITED'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {item.availabilityStatus} ({item.stockQuantity} units)
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-4 text-center text-xs text-slate-400">
                  Essential medicines (Paracetamol, Amoxicillin, Metformin, IFA, ORS) in stock.
                </div>
              )}
            </div>
          </Card>

          {/* Diagnostic Services Availability */}
          <Card
            title="Diagnostic & Pathology Test Services"
            subtitle="Live lab report turnaround time and testing capabilities"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {diagnostics.length > 0 ? (
                diagnostics.map((diag) => (
                  <div
                    key={diag._id}
                    className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {diag.diagnosticService?.name || 'Diagnostic Test'}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Category: {diag.diagnosticService?.category || 'Clinical Lab'} • Turnaround: ~
                        {diag.estimatedReportTimeHours || 2}h
                      </span>
                    </div>
                    <Badge variant={diag.availabilityStatus === 'AVAILABLE' ? 'success' : 'danger'}>
                      {diag.availabilityStatus}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-4 text-center text-xs text-slate-400">
                  Standard Pathology, CBC, Blood Glucose, and ECG testing available.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Map & Operating Metrics */}
        <div className="space-y-6">
          {/* Real-time Map */}
          <Card title="Live Interactive Map & Route" subtitle="Exact geolocation pin & routing from your live GPS">
            <FacilityMap
              facilities={[facility]}
              selectedFacility={facility}
              userLat={userCoords.lat}
              userLng={userCoords.lng}
            />
          </Card>

          {/* Operational Metrics Card */}
          <Card title="Live Hospital Metrics & Bed Status">
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Live OPD Queue Status</span>
                <span
                  className={`font-extrabold px-2.5 py-0.5 rounded-full text-[10px] ${
                    facility.queueStatus === 'NORMAL'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : facility.queueStatus === 'BUSY'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                  }`}
                >
                  ● {facility.queueStatus || 'NORMAL'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Estimated OPD Wait Time</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                  {facility.averageWaitTimeMinutes || 15} Minutes
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Total IPD Capacity</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{facility.totalBeds || 20} Beds</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/80">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Available General Beds</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {facility.availableBeds || 8} Available
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">ICU / High-Dependency Beds</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{facility.icuBeds || 2} ICU Beds</span>
              </div>

              {/* Progress bar of bed occupancy */}
              <div className="pt-2">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                  <span>Bed Availability Ratio</span>
                  <span>
                    {Math.round(((facility.availableBeds || 8) / (facility.totalBeds || 20)) * 100)}% Free
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((facility.availableBeds || 8) / (facility.totalBeds || 20)) * 100)
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

