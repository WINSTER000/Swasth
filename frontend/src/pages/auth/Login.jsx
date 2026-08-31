import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  ShieldCheck,
  User,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Stethoscope,
  Video,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { LanguageSelector } from '../../components/layout/LanguageSelector';
import { ThemeToggle } from '../../components/layout/ThemeToggle';

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false); // false = Login, true = Register

  // Login State (Email & Password ONLY - No role selection during login)
  const [loginEmail, setLoginEmail] = useState('patient@swasth.gov.in');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('PATIENT'); // PATIENT, HEALTH_WORKER, ADMIN
  const [regAdminLevel, setRegAdminLevel] = useState('HOSPITAL');
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState('MALE');
  const [regDistrict, setRegDistrict] = useState('Satara');
  const [regVillage, setRegVillage] = useState('');

  // Proof Verification Fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [adminAuthCode, setAdminAuthCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loggedUser = await login(loginEmail, loginPassword);
      if (loggedUser.role === 'PATIENT') navigate('/patient/dashboard');
      else if (loggedUser.role === 'HEALTH_WORKER') navigate('/worker/dashboard');
      else if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/register', {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        adminLevel: regAdminLevel,
        phone: regPhone,
        gender: regGender,
        district: regDistrict,
        villageOrCity: regVillage,
        licenseNumber,
        adminAuthCode,
      });

      const loggedUser = await login(regEmail, regPassword);
      if (loggedUser.role === 'PATIENT') navigate('/patient/dashboard');
      else if (loggedUser.role === 'HEALTH_WORKER') navigate('/worker/dashboard');
      else if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (devEmail) => {
    setLoginEmail(devEmail);
    setLoginPassword('password123');
    setIsSignUp(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-auto bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
      {/* LEFT PANEL: Form Container (7 cols) */}
      <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6 bg-white dark:bg-slate-900">
        <div>
          {/* Header Controls & Brand Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                S
              </div>
              <span className="font-extrabold text-slate-950 dark:text-white text-xl tracking-tight">SWASTH</span>
            </div>

            <div className="flex items-center space-x-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {isSignUp ? 'Create an Account' : 'Welcome!'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isSignUp
                ? 'Register your real patient or medical staff profile'
                : 'Enter your email and password to log in'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-semibold">
              {error}
            </div>
          )}

          {/* FORM 1: LOGIN (EMAIL & PASSWORD ONLY — NO ROLE SELECTION) */}
          {!isSignUp && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-950 dark:text-white mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-950 dark:text-white mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm mt-2 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORM 2: REAL REGISTRATION VIEW WITH EXPLICIT ROLE CHIPS */}
          {isSignUp && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              {/* CLEAR ROLE SELECTION HEADING */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="block font-extrabold text-slate-950 dark:text-white text-xs mb-1.5 uppercase tracking-wider">
                  Select Account Role / Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'PATIENT', label: 'Patient', desc: 'Rural Care' },
                    { id: 'HEALTH_WORKER', label: 'Doctor / Worker', desc: 'Medical License Req.' },
                    { id: 'ADMIN', label: 'Admin / Staff', desc: 'Employee Code Req.' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegRole(r.id)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${regRole === r.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                      <span className="block text-xs font-bold">{r.label}</span>
                      <span className={`text-[10px] block font-normal mt-0.5 ${regRole === r.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {r.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-950 dark:text-white mb-1">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="Full Name"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-950 dark:text-white mb-1">Email Address</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="user@swasth.gov.in"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-950 dark:text-white mb-1">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-950 dark:text-white mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* ROLE SPECIFIC PROOF REQUIREMENT */}
              {regRole === 'HEALTH_WORKER' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                    <Stethoscope className="w-4 h-4" />
                    <span>Doctor / Medical Officer License Verification</span>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-950 dark:text-white mb-1">Medical Council Registration No. *</label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      required
                      placeholder="e.g. MMC/2018/04/1234"
                      className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {regRole === 'ADMIN' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                    <Building className="w-4 h-4" />
                    <span>Institutional Staff Authorization Proof</span>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-950 dark:text-white mb-1">Employee Authorization Code *</label>
                    <input
                      type="text"
                      value={adminAuthCode}
                      onChange={(e) => setAdminAuthCode(e.target.value)}
                      required
                      placeholder="e.g. GOV-SATARA-884"
                      className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm mt-2 cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Sign up'}
              </button>
            </form>
          )}
        </div>

        {/* Bottom Switch Link */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {isSignUp ? 'Login' : 'Sign up'}
          </button>

          {/* Quick Demo Accounts Bar */}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-[10px]">
            <span className="text-slate-400 self-center font-bold">Quick Demo Accounts:</span>
            <button onClick={() => handleQuickLogin('patient@swasth.gov.in')} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200">
              Patient
            </button>
            <button onClick={() => handleQuickLogin('doctor@swasth.gov.in')} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200">
              Doctor (PHC MO)
            </button>
            <button onClick={() => handleQuickLogin('admin@swasth.gov.in')} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200">
              Hospital Admin
            </button>
            <button onClick={() => handleQuickLogin('govadmin@swasth.gov.in')} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200">
              Govt Admin
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Hero/Visual Side matching MHC Image 3 (5 cols) */}
      <div className="lg:col-span-5 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Canvas Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight mt-2">
            Swasth Healthcare, Seamless Management!
          </h2>
          <p className="text-xs text-emerald-100 leading-relaxed font-medium">
            "Transforming rural healthcare with seamless AI triage, WebRTC teleconsultation, and multi-facility continuity of care!"
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 space-y-3 my-6">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center space-x-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">AI-Assisted Care</p>
              <p className="text-[10px] text-emerald-200">AI triage, risk detection & health assistance</p>
            </div>
          </div>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center space-x-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">Connected Care & Referrals</p>
              <p className="text-[10px] text-emerald-200">Track care from referral to follow-up</p>
            </div>
          </div>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center space-x-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">Multilingual AI Suite</p>
              <p className="text-[10px] text-emerald-200">English, Hindi (हिन्दी), Marathi (मराठी)</p>
            </div>
          </div>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center space-x-3 text-xs">
            <Video className="w-5 h-5 text-teal-300 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">Peer-to-Peer Teleconsultation</p>
              <p className="text-[10px] text-emerald-200">Instant WebRTC video sessions</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-emerald-200 font-medium">
          SWASTH Rural Healthcare Access & Continuity System
        </div>
      </div>
    </div>
  );
};
