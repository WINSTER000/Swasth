import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Clock,
  Users,
  RefreshCw,
  CheckCircle,
  Hospital,
  ArrowRight,
  Sparkles,
  Calendar,
  Activity,
  AlertTriangle,
  Building2,
  Filter,
} from 'lucide-react';

export const QueueTracker = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [facilities, setFacilities] = useState([]);
  const [allMyAppts, setAllMyAppts] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(searchParams.get('facilityId') || null);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  // Initial load: fetch all facilities and user's appointments
  useEffect(() => {
    const initData = async () => {
      try {
        const [facRes, apptsRes] = await Promise.all([
          axios.get('/api/facilities'),
          axios.get('/api/patients/me/appointments'),
        ]);

        const facList = facRes.data || [];
        const apptsList = apptsRes.data || [];

        setFacilities(facList);
        setAllMyAppts(apptsList);

        // Determine default facility ID
        const paramFacId = searchParams.get('facilityId');
        if (paramFacId) {
          setSelectedFacilityId(paramFacId);
        } else {
          // Find first active appointment's facility
          const active = apptsList.find(
            (a) => a.status === 'CONFIRMED' || a.status === 'IN_QUEUE' || a.status === 'IN_CONSULTATION'
          );
          if (active && active.facility?._id) {
            setSelectedFacilityId(active.facility._id);
          } else if (facList.length > 0) {
            setSelectedFacilityId(facList[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load queue initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Fetch queue state for the selected facility
  const fetchFacilityQueue = async (facilityId) => {
    if (!facilityId) return;
    try {
      const qRes = await axios.get(`/api/queues/${facilityId}`);
      setQueue(qRes.data);
    } catch (e) {
      console.error('Queue state error:', e);
    }
  };

  useEffect(() => {
    if (selectedFacilityId) {
      fetchFacilityQueue(selectedFacilityId);
    }
  }, [selectedFacilityId]);

  // Handle facility selection change
  const handleFacilityChange = (facId) => {
    setSelectedFacilityId(facId);
    setSearchParams({ facilityId: facId });
  };

  // Socket.IO real-time queue listener for the active facility
  useEffect(() => {
    if (socket && selectedFacilityId) {
      socket.emit('join-facility-room', selectedFacilityId);

      const handleQueueUpdate = (data) => {
        if (data.facilityId === selectedFacilityId) {
          setQueue((prev) => ({
            ...prev,
            currentToken: data.currentToken,
            items: data.queueItems,
          }));
        }
      };

      socket.on('queue-updated', handleQueueUpdate);

      return () => {
        socket.off('queue-updated', handleQueueUpdate);
      };
    }
  }, [socket, selectedFacilityId]);

  // Check if current user has an active appointment at the selected facility
  const myApptAtFacility = allMyAppts.find(
    (a) =>
      a.facility?._id === selectedFacilityId &&
      (a.status === 'CONFIRMED' || a.status === 'IN_QUEUE' || a.status === 'IN_CONSULTATION')
  );

  const selectedFacility = facilities.find((f) => f._id === selectedFacilityId) || queue?.facility;

  const handleManualCheckIn = async () => {
    if (!myApptAtFacility || !selectedFacilityId) return;
    setCheckingIn(true);
    try {
      await axios.post(`/api/queues/${selectedFacilityId}/check-in`, {
        appointmentId: myApptAtFacility._id,
        priority: 'ROUTINE',
      });
      await fetchFacilityQueue(selectedFacilityId);
      // Re-fetch appointments to update status
      const apptsRes = await axios.get('/api/patients/me/appointments');
      setAllMyAppts(apptsRes.data || []);
    } catch (e) {
      console.error('Check in failed:', e);
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Synchronizing live queue broadcasts...</p>
      </div>
    );
  }

  const currentToken = queue?.currentToken || (myApptAtFacility ? Math.max(100, myApptAtFacility.tokenNumber - 1) : 100);
  const myToken = myApptAtFacility?.tokenNumber || null;
  const queueItems = queue?.items || [];

  // Sort queue items: IN_CONSULTATION first, then WAITING by tokenNumber ascending
  const sortedItems = [...queueItems].sort((a, b) => {
    if (a.status === 'IN_CONSULTATION') return -1;
    if (b.status === 'IN_CONSULTATION') return 1;
    return a.tokenNumber - b.tokenNumber;
  });

  const peopleAhead = myToken
    ? queueItems.filter(
        (i) => (i.status === 'WAITING' || i.status === 'IN_CONSULTATION') && i.tokenNumber < myToken
      ).length
    : 0;

  const estWaitMins = myToken ? Math.max(5, peopleAhead * 10) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Live Patient Queue Tracker
            </h2>
            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1"></span> Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time Socket.IO broadcasts for OPD consultation queue positions.
          </p>
        </div>

        <button
          onClick={() => fetchFacilityQueue(selectedFacilityId)}
          className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Facility Switcher & Selector */}
      <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800">
            <Hospital className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tracking Hospital</p>
              {myApptAtFacility && (
                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
                  Booked Token #{myApptAtFacility.tokenNumber}
                </span>
              )}
            </div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
              {selectedFacility?.name || 'Select Healthcare Facility'}
            </p>
          </div>
        </div>

        {/* Change Facility Dropdown */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex-shrink-0 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Change Facility:
          </label>
          <select
            value={selectedFacilityId || ''}
            onChange={(e) => handleFacilityChange(e.target.value)}
            className="w-full md:w-72 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          >
            {facilities.map((fac) => {
              const hasAppt = allMyAppts.some((a) => a.facility?._id === fac._id);
              return (
                <option key={fac._id} value={fac._id}>
                  {hasAppt ? '★ ' : ''}{fac.name} {hasAppt ? '(Your Appointment)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Currently Serving Token"
          value={`#${currentToken}`}
          change={selectedFacility?.name || 'Healthcare Desk'}
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Your Token Number"
          value={myToken ? `#${myToken}` : 'Not Registered'}
          change={myApptAtFacility ? `Status: ${myApptAtFacility.status}` : 'No active token at this hospital'}
          icon={Users}
          color={myToken ? 'brand' : 'amber'}
        />
        <StatCard
          title="Patients Ahead of You"
          value={myToken ? `${peopleAhead} ${peopleAhead === 1 ? 'Patient' : 'Patients'}` : 'N/A'}
          change={myToken ? `Est. Wait Time: ~${estWaitMins} mins` : 'Select booked facility to view wait'}
          icon={Activity}
          color="amber"
        />
      </div>

      {/* Notice if not registered at this facility */}
      {!myApptAtFacility && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-2.5 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">You do not have a booked appointment at {selectedFacility?.name || 'this facility'}.</p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5">
                You are viewing the live general OPD queue roster. You can book an appointment to join this queue.
              </p>
            </div>
          </div>
          <Link to={`/patient/appointments/book?facilityId=${selectedFacilityId || ''}`}>
            <Button variant="primary" size="sm" icon={ArrowRight} className="flex-shrink-0 text-xs">
              Book Token Here
            </Button>
          </Link>
        </div>
      )}

      {/* Live Queue Table & Roster */}
      <Card
        title="Live OPD Queue Roster"
        subtitle={`Facility: ${selectedFacility?.name || 'Healthcare Centre'} • ${myApptAtFacility?.department || 'General Medicine'}`}
        action={
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {sortedItems.length} Patient(s) In Queue
          </span>
        }
      >
        <div className="space-y-3">
          {sortedItems.length > 0 ? (
            sortedItems.map((item) => {
              const isMe =
                (item.patient?._id && user?._id && item.patient._id.toString() === user._id.toString()) ||
                (item.patient && user?._id && item.patient.toString() === user._id.toString()) ||
                (myToken && item.tokenNumber === myToken);

              const isCurrent = item.tokenNumber === currentToken || item.status === 'IN_CONSULTATION';

              // Display real patient name
              const patientDisplayName =
                item.patient?.name || (isMe ? user?.name : `Patient Token #${item.tokenNumber}`);

              return (
                <div
                  key={item._id || item.tokenNumber}
                  className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : isMe
                      ? 'bg-brand-50/90 dark:bg-brand-950/40 border-brand-500 ring-1 ring-brand-500/30'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl font-extrabold flex items-center justify-center text-sm shadow-xs ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : isMe
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      #{item.tokenNumber}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                          {patientDisplayName}
                        </p>
                        {isMe && (
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                            Your Token
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Priority: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.priority || 'ROUTINE'}</span> • Checked in at{' '}
                        {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:30 AM'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        isCurrent
                          ? 'success'
                          : item.status === 'WAITING'
                          ? 'warning'
                          : item.status === 'COMPLETED'
                          ? 'neutral'
                          : 'info'
                      }
                    >
                      {isCurrent ? 'IN CONSULTATION NOW' : item.status}
                    </Badge>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 space-y-3">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No active patients in queue for {selectedFacility?.name || 'this facility'}.</p>
              {myApptAtFacility && (
                <Button
                  variant="primary"
                  size="sm"
                  loading={checkingIn}
                  onClick={handleManualCheckIn}
                >
                  Check In to Live OPD Queue
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};


