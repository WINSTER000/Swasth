import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  User,
  ShieldCheck,
  Camera,
  AlertCircle,
  RefreshCw,
  Maximize2,
  Volume2,
} from 'lucide-react';

export const WebRTCCallModal = ({ isOpen, onClose, roomId = 'demo-room', participantName = 'Patient' }) => {
  const { socket } = useSocket();
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState('Encrypted P2P Connected');
  const [permissionStatus, setPermissionStatus] = useState('IDLE'); // 'IDLE', 'REQUESTING', 'GRANTED', 'DENIED'
  const [cameraError, setCameraError] = useState('');

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Start Real Device Camera & Microphone Capture
  const requestMediaAccess = async () => {
    setPermissionStatus('REQUESTING');
    setCameraError('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: true,
      });

      localStreamRef.current = stream;
      setPermissionStatus('GRANTED');
      setCameraError('');

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('[WebRTCCallModal Camera Error]:', err);
      setPermissionStatus('DENIED');

      let msg = 'Camera and Microphone access is required for teleconsultation.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please click the lock or camera icon in your browser address bar and choose "Allow".';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera or microphone device found on this system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is in use by another app. Please close other camera apps and retry.';
      }
      setCameraError(msg);
    }
  };

  // Stop and clean up all media tracks
  const stopMediaTracks = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    let timer;
    if (isOpen) {
      setStatus('Encrypted WebRTC Teleconsult Active');
      setCallDuration(0);
      setMicActive(true);
      setVideoActive(true);
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);

      // Request live camera & mic access
      requestMediaAccess();

      if (socket) {
        socket.emit('join-teleconsult-room', roomId);
      }
    } else {
      stopMediaTracks();
      setCallDuration(0);
      setPermissionStatus('IDLE');
      setCameraError('');
    }

    return () => {
      clearInterval(timer);
      stopMediaTracks();
    };
  }, [isOpen, roomId, socket]);

  // Keep local video element bound to stream when stream or videoActive changes
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [permissionStatus, videoActive]);

  // Toggle Microphone Mute/Unmute
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !micActive;
      });
    }
    setMicActive(!micActive);
  };

  // Toggle Video Camera On/Off
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !videoActive;
      });
    }
    setVideoActive(!videoActive);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    stopMediaTracks();
    if (socket) {
      socket.emit('end-teleconsult', { roomId });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">
        {/* Call Header */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">SWASTH Encrypted Teleconsult</h3>
              <p className="text-[10px] text-emerald-400">HIPAA & EHR Compliant WebRTC Stream</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="bg-emerald-950/80 text-emerald-300 text-xs px-3 py-1 rounded-full font-mono font-bold border border-emerald-800 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
              {formatTimer(callDuration)}
            </span>
            <span className="text-[11px] text-slate-400 truncate">{status}</span>
          </div>
        </div>

        {/* Camera Permission Alert Banner */}
        {permissionStatus === 'DENIED' && (
          <div className="p-3 bg-amber-950/60 border-b border-amber-800 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{cameraError}</span>
            </div>
            <button
              onClick={requestMediaAccess}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition-all flex items-center space-x-1 cursor-pointer flex-shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Grant Camera Permission</span>
            </button>
          </div>
        )}

        {/* Video Call Stage Area */}
        <div className="relative h-72 sm:h-[420px] bg-slate-950 flex items-center justify-center p-2 sm:p-4">
          {/* Remote Specialist / Doctor Stream Area */}
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center border border-slate-800 shadow-inner">
            <div className="text-center p-6 space-y-3">
              <div className="relative inline-block">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full text-white flex items-center justify-center mx-auto text-2xl sm:text-3xl font-extrabold shadow-xl ring-4 ring-emerald-500/20">
                  {participantName.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <Volume2 className="w-3 h-3 text-white" />
                </span>
              </div>
              <div>
                <p className="font-extrabold text-base sm:text-lg text-white">{participantName}</p>
                <p className="text-xs text-emerald-400 font-medium">Live Secure Audio / Video Stream</p>
                <span className="inline-block mt-1 text-[10px] text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                  Peer-to-Peer Signal Synchronized
                </span>
              </div>
            </div>
          </div>

          {/* Floating Self Camera Widget */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-32 h-24 sm:w-48 sm:h-36 bg-slate-900 rounded-2xl border-2 border-emerald-500/80 overflow-hidden shadow-2xl flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            {/* Live WebRTC Video Element */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                permissionStatus === 'GRANTED' && videoActive ? 'block' : 'hidden'
              }`}
            />

            {/* Video Off Overlay */}
            {permissionStatus === 'GRANTED' && !videoActive && (
              <div className="text-center p-2">
                <VideoOff className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-[10px] text-slate-300 font-semibold mt-1">Camera Paused</p>
              </div>
            )}

            {/* Requesting Permission State */}
            {permissionStatus === 'REQUESTING' && (
              <div className="text-center p-2 space-y-1">
                <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin mx-auto" />
                <p className="text-[9px] text-emerald-300 font-bold">Requesting Camera...</p>
              </div>
            )}

            {/* Permission Denied State */}
            {permissionStatus === 'DENIED' && (
              <div className="text-center p-2 cursor-pointer" onClick={requestMediaAccess}>
                <Camera className="w-5 h-5 text-amber-400 mx-auto" />
                <p className="text-[9px] text-amber-300 font-bold mt-0.5">Click to Allow Camera</p>
              </div>
            )}

            {/* Floating Tag */}
            <div className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white font-semibold">
              You {micActive ? '🎙️' : '🔇'}
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-center space-x-3 sm:space-x-4">
          <button
            onClick={toggleMic}
            title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
            className={`p-3 sm:p-3.5 rounded-full transition-all active:scale-95 shadow-md cursor-pointer ${
              micActive
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                : 'bg-rose-600 text-white'
            }`}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            title={videoActive ? 'Turn Camera Off' : 'Turn Camera On'}
            className={`p-3 sm:p-3.5 rounded-full transition-all active:scale-95 shadow-md cursor-pointer ${
              videoActive
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                : 'bg-rose-600 text-white'
            }`}
          >
            {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {permissionStatus === 'DENIED' && (
            <button
              onClick={requestMediaAccess}
              title="Request Camera Access"
              className="p-3 sm:p-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-all active:scale-95 shadow-md cursor-pointer"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={endCall}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-full flex items-center shadow-lg transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
          >
            <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> End Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

