import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Hospital, Phone, Calendar, CheckCircle2, UserCheck, ArrowRight, Crosshair, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon paths in Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Blue Pin for Patient's Live Location
const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [28, 45],
  iconAnchor: [14, 45],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom Green Hospital Marker Icon
const greenHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom Selected Hospital Marker Icon (Gold pin)
const selectedHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [28, 45],
  iconAnchor: [14, 45],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map View Recenter Component
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
}

export const FacilityMap = ({
  facilities = [],
  selectedFacility = null,
  onSelectFacility = () => {},
  userLat: propLat,
  userLng: propLng,
}) => {
  const navigate = useNavigate();
  const [userCoords, setUserCoords] = useState({
    lat: propLat || 17.6868,
    lng: propLng || 74.0000,
    isReal: false,
  });

  const [allFacilities, setAllFacilities] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('Location Ready');
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');
  const routeCache = useRef({});

  // Trigger Real Device Geolocation
  const requestRealLocation = () => {
    setGpsStatus('Requesting browser location permission...');
    setGpsErrorMsg('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng, isReal: true });
          setGpsStatus(`Real GPS Active: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);

          // Fetch hospitals around real coordinates
          axios
            .get(`/api/facilities/nearby?lat=${lat}&lng=${lng}`)
            .then((res) => setAllFacilities(res.data || []))
            .catch((e) => console.error(e));
        },
        (err) => {
          console.warn('[Geolocation Error]', err);
          let msg = 'Browser blocked GPS permission.';
          if (err.code === 1) msg = 'Location permission denied. Please allow location access in your browser.';
          else if (err.code === 2) msg = 'Location unavailable on this device.';
          else if (err.code === 3) msg = 'GPS request timed out.';
          
          setGpsErrorMsg(msg);
          setGpsStatus('GPS Permission Denied / Fallback');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setGpsErrorMsg('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    requestRealLocation();
  }, []);

  useEffect(() => {
    if (facilities && facilities.length > 0) {
      setAllFacilities(facilities);
    } else {
      axios
        .get(`/api/facilities/nearby?lat=${userCoords.lat}&lng=${userCoords.lng}`)
        .then((res) => setAllFacilities(res.data || []))
        .catch((e) => console.error(e));
    }
  }, [facilities?.length, userCoords.lat, userCoords.lng]);

  const activeFacility = selectedFacility || (allFacilities.length > 0 ? allFacilities[0] : null);
  const activeId = activeFacility?._id;
  const facilityLat = activeFacility?.location?.lat || 17.6950;
  const facilityLng = activeFacility?.location?.lng || 74.0150;

  useEffect(() => {
    if (activeId && activeFacility?.location) {
      const cacheKey = `${userCoords.lat}_${userCoords.lng}_${activeId}`;
      if (routeCache.current[cacheKey]) {
        setRouteInfo(routeCache.current[cacheKey]);
        return;
      }

      axios
        .get(
          `/api/maps/route?originLat=${userCoords.lat}&originLng=${userCoords.lng}&destLat=${facilityLat}&destLng=${facilityLng}`
        )
        .then((res) => {
          routeCache.current[cacheKey] = res.data;
          setRouteInfo(res.data);
        })
        .catch((e) => console.error(e));
    }
  }, [activeId, userCoords.lat, userCoords.lng, facilityLat, facilityLng]);

  const polylineCoords = [
    [userCoords.lat, userCoords.lng],
    [facilityLat, facilityLng],
  ];

  const handleSelectAndGo = (fac) => {
    onSelectFacility(fac);
    navigate(`/patient/facilities/${fac._id}`);
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 overflow-hidden relative shadow-xs space-y-3">
      {/* Prominent Real Location Banner */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl text-white font-bold ${userCoords.isReal ? 'bg-blue-600' : 'bg-amber-500'}`}>
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
              {userCoords.isReal ? '📍 Live GPS Location Active' : '📍 Allow GPS for Real Location'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{gpsStatus}</p>
          </div>
        </div>

        <button
          onClick={requestRealLocation}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Click to Grant & Detect My Live GPS</span>
        </button>
      </div>

      {gpsErrorMsg && (
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>{gpsErrorMsg}</span>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div className="h-72 sm:h-80 w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 relative z-10 shadow-inner">
        <MapContainer center={[userCoords.lat, userCoords.lng]} zoom={12} scrollWheelZoom={false} className="w-full h-full">
          <ChangeView center={[userCoords.lat, userCoords.lng]} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* REAL USER LOCATION MARKER (BLUE PIN) */}
          <Marker position={[userCoords.lat, userCoords.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="text-xs font-extrabold text-blue-700 p-1">
                📍 Your Location ({userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)})
              </div>
            </Popup>
          </Marker>

          {/* HOSPITALS PLOTTED WITH GREEN MARKERS */}
          {allFacilities.map((fac) => {
            const isSelected = activeFacility?._id === fac._id;
            const lat = fac.location?.lat || 17.69;
            const lng = fac.location?.lng || 74.01;

            return (
              <Marker
                key={fac._id}
                position={[lat, lng]}
                icon={isSelected ? selectedHospitalIcon : greenHospitalIcon}
                eventHandlers={{
                  click: () => onSelectFacility(fac),
                }}
              >
                {/* Clickable Popup with Info */}
                <Popup>
                  <div className="p-1.5 space-y-2 min-w-[220px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-extrabold text-xs text-slate-900">{fac.name}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {fac.type}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 flex items-start">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600 flex-shrink-0 mt-0.5" />
                      {fac.address}
                    </p>

                    <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200">
                      <div>
                        <span className="text-slate-400 block font-bold">Distance</span>
                        <span className="font-bold text-emerald-700">{fac.distanceKm || 2.5} km</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Queue Status</span>
                        <span className="font-bold text-slate-800">{fac.queueStatus}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Beds</span>
                        <span className="font-semibold text-slate-700">{fac.availableBeds} / {fac.totalBeds}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Phone</span>
                        <span className="font-semibold text-slate-700">{fac.phone}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectAndGo(fac)}
                      className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <span>Select & View Facility Page</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Polyline Route Line */}
          {activeFacility && <Polyline positions={polylineCoords} color="#059669" weight={4} dashArray="8, 8" />}
        </MapContainer>
      </div>

      {/* Selected Facility Details Card */}
      {activeFacility && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Distance from Your Live GPS ➔ {activeFacility.name}
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{activeFacility.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{activeFacility.address} • Phone: {activeFacility.phone}</p>
            </div>
            {routeInfo && (
              <div className="text-left sm:text-right">
                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {routeInfo.distanceKm} km from You
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{routeInfo.travelTime} drive time</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleSelectAndGo(activeFacility)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center cursor-pointer"
            >
              <span>Open {activeFacility.name} Facility Details Page</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
