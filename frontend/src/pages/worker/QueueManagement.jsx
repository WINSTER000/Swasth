import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Clock,
  PhoneCall,
  CheckCircle,
  AlertTriangle,
  Users,
  Building2,
  Stethoscope,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Calendar,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const QueueManagement = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'WAITING' | 'COMPLETED'

  // 1. Fetch available facilities
  useEffect(() => {
    axios
      .get('/api/facilities')
      .then((res) => {
        const facs = res.data || [];
        setFacilities(facs);

        // Retrieve cached or default facility
        const savedFacId = localStorage.getItem('doctor_selected_facility');
        if (savedFacId && facs.some((f) => f._id === savedFacId)) {
          setSelectedFacilityId(savedFacId);
        } else if (facs.length > 0) {
          setSelectedFacilityId(facs[0]._id);
        }
      })
      .catch((err) => console.error('Error fetching facilities:', err));
  }, []);

  // 2. Fetch Queue data whenever selected facility changes
  useEffect(() => {
    if (!selectedFacilityId) return;

    localStorage.setItem('doctor_selected_facility', selectedFacilityId);
    fetchQueue(selectedFacilityId);

    // Setup Socket.IO for real-time queue & appointment synchronization
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.emit('join-facility-room', selectedFacilityId);

    socket.on('queue-updated', (data) => {
      if (data.facilityId === selectedFacilityId) {
        fetchQueue(selectedFacilityId, false);
      }
    });

    socket.on('appointment-created', (data) => {
      if (data.facilityId === selectedFacilityId) {
        fetchQueue(selectedFacilityId, false);
      }
    });

    socket.on('global-appointment-created', (data) => {
      if (data.facilityId === selectedFacilityId) {
        fetchQueue(selectedFacilityId, false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedFacilityId]);

  const fetchQueue = async (facId, showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await axios.get(`/api/queues/${facId}`);
      setQueue(res.data);
    } catch (e) {
      console.error('Error loading queue:', e);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleFacilityChange = (e) => {
    const newId = e.target.value;
    setSelectedFacilityId(newId);
  };

  const callNext = async () => {
    if (!selectedFacilityId) return;
    setActionLoading(true);
    try {
      const res = await axios.post(`/api/queues/${selectedFacilityId}/next`);
      await fetchQueue(selectedFacilityId, false);
      if (res.data?.currentItem?.patient?._id) {
        // Optional navigation
      }
    } catch (e) {
      alert(e.response?.data?.message || 'No more waiting patients');
    } finally {
      setActionLoading(false);
    }
  };

  const callSpecificToken = async (tokenNumber) => {
    if (!selectedFacilityId) return;
    setActionLoading(true);
    try {
      await axios.post(`/api/queues/${selectedFacilityId}/call-token`, { tokenNumber });
      await fetchQueue(selectedFacilityId, false);
    } catch (e) {
      alert(e.response?.data?.message || 'Error calling token');
    } finally {
      setActionLoading(false);
    }
  };

  const completeToken = async (tokenNumber) => {
    if (!selectedFacilityId) return;
    setActionLoading(true);
    try {
      await axios.post(`/api/queues/${selectedFacilityId}/complete-token`, { tokenNumber });
      await fetchQueue(selectedFacilityId, false);
    } catch (e) {
      alert(e.response?.data?.message || 'Error completing consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const currentFacility = facilities.find((f) => f._id === selectedFacilityId);
  const currentToken = queue?.currentToken || 0;
  const items = queue?.items || [];

  const inConsultationItem = items.find((i) => i.status === 'IN_CONSULTATION');
  const waitingItems = items.filter((i) => i.status === 'WAITING');
  const completedItems = items.filter((i) => i.status === 'COMPLETED');

  const displayedItems =
    activeTab === 'WAITING'
      ? waitingItems
      : activeTab === 'COMPLETED'
      ? completedItems
      : items;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Facility Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Live OPD Queue Management
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
              LIVE SYNCED
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time patient triage, consultation status, and token advancement workspace.
          </p>
        </div>

        {/* Facility Dropdown Selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5">
            <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <select
              value={selectedFacilityId}
              onChange={handleFacilityChange}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              {facilities.map((fac) => (
                <option key={fac._id} value={fac._id} className="dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {fac.name} ({fac.type || 'Hospital'})
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            icon={PhoneCall}
            onClick={callNext}
            loading={actionLoading}
            className="rounded-2xl shadow-sm text-xs font-bold"
          >
            Call Next Patient
          </Button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Serving Token</p>
          <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">
            #{currentToken || '100'}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Waiting in Line</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">{waitingItems.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Consultation</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {inConsultationItem ? `#${inConsultationItem.tokenNumber}` : 'None'}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Today</p>
          <p className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">
            {completedItems.length}
          </p>
        </div>
      </div>

      {/* CURRENT IN-CONSULTATION PATIENT HERO CARD */}
      {inConsultationItem && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-2 border-emerald-500/50 dark:border-emerald-500/40 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
                #{inConsultationItem.tokenNumber}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                    Currently Inside Cabin
                  </span>
                  <Badge variant={inConsultationItem.priority === 'URGENT' ? 'danger' : 'info'}>
                    {inConsultationItem.priority}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {inConsultationItem.patient?.name || `Patient Token #${inConsultationItem.tokenNumber}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {inConsultationItem.patient?.phone ? `📞 ${inConsultationItem.patient.phone} • ` : ''}
                  {inConsultationItem.appointment?.department || 'General Medicine'} • Checked in{' '}
                  {new Date(inConsultationItem.checkInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => completeToken(inConsultationItem.tokenNumber)}
                className="rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
              >
                Mark Completed
              </Button>
              <Link
                to={`/worker/patients/${inConsultationItem.patient?._id || inConsultationItem.patient || 'active'}`}
              >
                <Button variant="primary" size="sm" icon={Stethoscope} className="rounded-xl shadow-xs">
                  Open Consultation Workspace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FILTER TABS & PATIENT QUEUE LIST */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-brand-600" />
              <span>Today's OPD Queue Register</span>
              <span className="text-xs font-normal text-slate-400">({items.length} Total Registered)</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              {['ALL', 'WAITING', 'COMPLETED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {tab === 'ALL'
                    ? `All (${items.length})`
                    : tab === 'WAITING'
                    ? `Waiting (${waitingItems.length})`
                    : `Completed (${completedItems.length})`}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
            Loading real patient tokens for {currentFacility?.name || 'facility'}...
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <p className="text-sm font-semibold">No patients found in this queue category.</p>
            <p className="text-xs text-slate-400">
              When patients book OPD appointments at {currentFacility?.name || 'this hospital'}, they will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
            {displayedItems.map((item) => {
              const isInCabin = item.status === 'IN_CONSULTATION';
              const isDone = item.status === 'COMPLETED';

              return (
                <div
                  key={item._id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isInCabin
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400/80 ring-2 ring-emerald-500/20'
                      : isDone
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-brand-300'
                  }`}
                >
                  {/* Left: Token & Patient Info */}
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl font-extrabold flex items-center justify-center text-sm flex-shrink-0 ${
                        isInCabin
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                          : isDone
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          : 'bg-slate-100 dark:bg-slate-700 text-brand-700 dark:text-brand-300'
                      }`}
                    >
                      #{item.tokenNumber}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                          {item.patient?.name || `Patient Token #${item.tokenNumber}`}
                        </p>
                        <Badge
                          variant={
                            item.priority === 'URGENT'
                              ? 'danger'
                              : item.priority === 'EMERGENCY'
                              ? 'danger'
                              : 'info'
                          }
                        >
                          {item.priority}
                        </Badge>
                        <Badge
                          variant={
                            item.status === 'IN_CONSULTATION'
                              ? 'success'
                              : item.status === 'COMPLETED'
                              ? 'neutral'
                              : 'warning'
                          }
                        >
                          {item.status === 'IN_CONSULTATION'
                            ? 'In Consultation'
                            : item.status === 'COMPLETED'
                            ? 'Finished'
                            : 'Waiting'}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.patient?.phone && <span>📞 {item.patient.phone} • </span>}
                        <span>{item.appointment?.reason || 'Routine OPD Health Check'}</span>
                        <span className="text-slate-400 text-[11px]">
                          {' '}
                          • Checked-in:{' '}
                          {new Date(item.checkInTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    {item.status === 'WAITING' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={PhoneCall}
                        onClick={() => callSpecificToken(item.tokenNumber)}
                        loading={actionLoading}
                        className="rounded-xl text-xs"
                      >
                        Call Token
                      </Button>
                    )}

                    {item.status === 'IN_CONSULTATION' && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={CheckCircle2}
                        onClick={() => completeToken(item.tokenNumber)}
                        className="rounded-xl text-xs text-emerald-600 border-emerald-300"
                      >
                        Finish
                      </Button>
                    )}

                    <Link
                      to={`/worker/patients/${item.patient?._id || item.patient || 'active'}`}
                    >
                      <Button
                        size="sm"
                        variant={isInCabin ? 'primary' : 'outline'}
                        icon={Stethoscope}
                        className="rounded-xl text-xs font-semibold"
                      >
                        Consultation Workspace
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

