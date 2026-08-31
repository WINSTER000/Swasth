import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, MapPin, Hospital, Clock, Activity, Package, Phone, Filter, Crosshair } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FacilityMap } from '../../components/maps/FacilityMap';

export const FacilitiesList = () => {
  const [facilities, setFacilities] = useState([]);
  const [userCoords, setUserCoords] = useState({ lat: 17.6868, lng: 74.0000, isReal: false });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showMap, setShowMap] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Detect Patient's Real Device GPS Location
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
          console.warn('[FacilitiesList] Geolocation permission or fallback:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // 2. Fetch Nearby Facilities relative to User's Real Coordinates
  useEffect(() => {
    fetchFacilities();
  }, [typeFilter, userCoords.lat, userCoords.lng]);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/facilities/nearby?lat=${userCoords.lat}&lng=${userCoords.lng}&type=${typeFilter}`
      );
      setFacilities(res.data || []);
      if (res.data.length > 0 && !selectedFacility) {
        setSelectedFacility(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Find Nearby Hospitals</h2>
            {userCoords.isReal && (
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-300">
                📍 Real Live GPS Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive OpenStreetMap displaying hospitals near your real live device GPS location.
          </p>
        </div>
        <Button
          variant={showMap ? 'primary' : 'outline'}
          onClick={() => setShowMap(!showMap)}
          icon={MapPin}
        >
          {showMap ? 'Hide Map View' : 'Show Interactive Leaflet Map'}
        </Button>
      </div>

      {/* Interactive Map Plotting ALL Hospitals Near Real GPS Location */}
      {showMap && (
        <FacilityMap
          facilities={filtered}
          selectedFacility={selectedFacility}
          onSelectFacility={(fac) => setSelectedFacility(fac)}
          userLat={userCoords.lat}
          userLng={userCoords.lng}
        />
      )}

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search facility by name, village, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none dark:text-slate-100"
          >
            <option value="ALL">All Facility Types</option>
            <option value="PHC">Primary Health Centre (PHC)</option>
            <option value="CHC">Community Health Centre (CHC)</option>
            <option value="DISTRICT_HOSPITAL">District Hospital</option>
          </select>
        </div>
      </div>

      {/* Facility Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((fac) => (
          <div
            key={fac._id}
            onClick={() => setSelectedFacility(fac)}
            className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
              selectedFacility?._id === fac._id
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <Badge variant={fac.type === 'PHC' ? 'info' : fac.type === 'CHC' ? 'warning' : 'success'}>
                  {fac.type}
                </Badge>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-0.5" /> {fac.distanceKm || 2.5} km from You
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-2">{fac.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{fac.address}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Queue Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fac.queueStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Est. Wait</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{fac.averageWaitTimeMinutes} mins</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Beds Available</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{fac.availableBeds} / {fac.totalBeds}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Operating Hours</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{fac.operatingHours}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" /> {fac.phone}
              </span>
              <Link to={`/patient/facilities/${fac._id}`}>
                <Button size="sm" variant="primary">
                  View Facility Page
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
