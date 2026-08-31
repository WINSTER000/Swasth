import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { WebRTCCallModal } from '../../components/teleconsult/WebRTCCallModal';
import {
  Video,
  Mic,
  MicOff,
  Camera,
  ShieldCheck,
  Stethoscope,
  User,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  PhoneCall,
  Volume2,
} from 'lucide-react';

export const PatientTeleconsult = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState(null);

  // Pre-call Camera & Mic test state
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [permissionError, setPermissionError] = useState('');
  const [deviceInfo, setDeviceInfo] = useState({ cameraName: '', hasAudio: false });

  const previewVideoRef = useRef(null);
  const previewStreamRef = useRef(null);

  // Function to start live webcam preview & trigger browser permission prompt
  const startCameraPreview = async () => {
    setPermissionError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });

      previewStreamRef.current = stream;
      setCameraActive(true);
      setMicActive(true);

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      setDeviceInfo({
        cameraName: videoTrack?.label || 'Default Camera',
        hasAudio: !!audioTrack,
      });

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('[Camera Preview Error]:', err);
      setCameraActive(false);
      let msg = 'Camera permission was not granted.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Browser blocked camera permission. Please click the camera/lock icon in your address bar and select "Allow".';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No physical webcam or microphone detected on this computer.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is currently locked by another application.';
      }
      setPermissionError(msg);
    }
  };

  const stopCameraPreview = () => {
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch (e) {}
      });
      previewStreamRef.current = null;
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Toggle preview camera
  const togglePreviewCamera = () => {
    if (cameraActive) {
      stopCameraPreview();
    } else {
      startCameraPreview();
    }
  };

  // Toggle preview mic
  const togglePreviewMic = () => {
    if (previewStreamRef.current) {
      previewStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !micActive;
      });
    }
    setMicActive(!micActive);
  };

  // Initial attempt to test camera permission on page load
  useEffect(() => {
    startCameraPreview();
    return () => {
      stopCameraPreview();
    };
  }, []);

  // Fetch Patient's Appointments
  useEffect(() => {
    axios
      .get('/api/patients/me/appointments')
      .then((res) => {
        const teleAppts = (res.data || []).filter(
          (a) => a.appointmentType === 'TELECONSULT' || a.status === 'CONFIRMED' || a.status === 'IN_QUEUE'
        );
        setAppointments(teleAppts);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  // Stop preview before joining a full call so devices aren't locked
  const handleStartCall = (sessionData) => {
    stopCameraPreview();
    setActiveCall(sessionData);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Teleconsultation Hub...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-emerald-500/30 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 text-[10px] px-3 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
              WebRTC Live Video Consultation
            </span>
            <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              24x7 Ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Patient Teleconsultation Hub</h1>
          <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
            Connect directly with Medical Officers and District Hospital Specialists via encrypted peer-to-peer audio and video stream.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={PhoneCall}
          className="shadow-lg py-3 px-5 text-xs sm:text-sm z-10 bg-white text-slate-900 hover:bg-emerald-50"
          onClick={() =>
            handleStartCall({
              _id: 'demo-teleconsult-session',
              healthWorker: { name: 'Dr. Anand Kulkarni (PHC Medical Officer)' },
            })
          }
        >
          Launch Instant Video Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Teleconsult Sessions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <Stethoscope className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" /> Scheduled Teleconsultation Sessions
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{appointments.length} Session(s) Available</span>
          </div>

          {appointments.length === 0 ? (
            <Card className="text-center py-10 space-y-3">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Video className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">No Active Appointments Found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  You can launch an instant test video call to verify your camera and microphone connections.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                icon={Video}
                onClick={() =>
                  handleStartCall({
                    _id: 'instant-demo-session',
                    healthWorker: { name: 'Dr. Anand Kulkarni (PHC MO)' },
                  })
                }
              >
                Test Demo Teleconsult Video Call
              </Button>
            </Card>
          ) : (
            appointments.map((appt) => (
              <div
                key={appt._id}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500/60 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">Teleconsult Ready</Badge>
                    <Badge variant="info">Token #{appt.tokenNumber}</Badge>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1.5">
                    {appt.facility?.name || 'Healthcare Centre'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{new Date(appt.date).toLocaleDateString()} at {appt.time}</span>
                    <span className="mx-2">•</span>
                    <span>Doctor: {appt.healthWorker?.name || 'Medical Officer'}</span>
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium pt-0.5">
                    Reason: {appt.reason}
                  </p>
                </div>

                <Button
                  variant="success"
                  size="sm"
                  icon={Video}
                  className="shadow-sm flex-shrink-0"
                  onClick={() => handleStartCall(appt)}
                >
                  Join Teleconsult Video
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Right Col: Live Camera & Mic Pre-call Test */}
        <div className="space-y-6">
          <Card
            title="Camera & Microphone Test"
            subtitle="Verify your physical webcam and audio feed before starting"
          >
            <div className="space-y-3.5 text-xs">
              {/* Camera Video Screen */}
              <div className="h-44 sm:h-48 bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner">
                <video
                  ref={previewVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />

                {!cameraActive && (
                  <div className="text-center p-4 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <Camera className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-300">Camera Stream Inactive</p>
                    <p className="text-[10px] text-slate-500">Click button below to enable and grant camera access</p>
                  </div>
                )}

                {/* Status Overlays on Video */}
                {cameraActive && (
                  <>
                    <div className="absolute top-2 left-2 bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 backdrop-blur-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Camera Live</span>
                    </div>

                    <div className="absolute bottom-2 right-2 bg-slate-900/80 text-slate-200 text-[10px] px-2 py-0.5 rounded-md font-mono backdrop-blur-xs">
                      {micActive ? '🎙️ Mic Active' : '🔇 Mic Muted'}
                    </div>
                  </>
                )}
              </div>

              {/* Permission Alert if Denied */}
              {permissionError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                  <p className="leading-tight">{permissionError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  size="sm"
                  variant={cameraActive ? 'outline' : 'primary'}
                  onClick={togglePreviewCamera}
                  icon={Camera}
                  className="w-full text-xs"
                >
                  {cameraActive ? 'Stop Camera' : 'Grant & Enable Camera'}
                </Button>

                <Button
                  size="sm"
                  variant={micActive ? 'secondary' : 'danger'}
                  onClick={togglePreviewMic}
                  icon={micActive ? Mic : MicOff}
                  disabled={!cameraActive}
                  className="w-full text-xs"
                >
                  {micActive ? 'Mute Mic' : 'Unmute Mic'}
                </Button>
              </div>

              {/* Diagnostics Summary */}
              {cameraActive && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Webcam Device:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                      {deviceInfo.cameraName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Microphone Status:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {deviceInfo.hasAudio ? 'Ready & Connected' : 'No Mic Input'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Privacy & Encryption Info */}
          <Card title="Encryption & Medical Privacy">
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>End-to-End Encrypted Session</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Teleconsultations utilize Peer-to-Peer WebRTC channels with Socket.IO signaling, keeping audio/video streams completely private and compliant with medical standards.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* WebRTC Video Call Modal */}
      <WebRTCCallModal
        isOpen={!!activeCall}
        onClose={() => {
          setActiveCall(null);
          // Resume preview when call closes
          startCameraPreview();
        }}
        roomId={activeCall?._id || 'demo-room'}
        participantName={activeCall?.healthWorker?.name || 'Dr. Anand Kulkarni (PHC Medical Officer)'}
      />
    </div>
  );
};

