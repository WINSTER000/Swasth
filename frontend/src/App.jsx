import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { OfflineBanner } from './components/layout/OfflineBanner';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Settings } from './pages/Settings';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { FacilitiesList } from './pages/patient/FacilitiesList';
import { FacilityDetail } from './pages/patient/FacilityDetail';
import { AppointmentBooking } from './pages/patient/AppointmentBooking';
import { AppointmentsList } from './pages/patient/AppointmentsList';
import { PatientTeleconsult } from './pages/patient/PatientTeleconsult';
import { QueueTracker } from './pages/patient/QueueTracker';
import { PatientRecords } from './pages/patient/PatientRecords';
import { PatientReferrals } from './pages/patient/PatientReferrals';
import { PatientFollowups } from './pages/patient/PatientFollowups';
import { AIAssistant } from './pages/patient/AIAssistant';
import { EmergencyAccess } from './pages/patient/EmergencyAccess';

// Doctor / Health Worker Pages
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { QueueManagement } from './pages/worker/QueueManagement';
import { PatientSearch } from './pages/worker/PatientSearch';
import { ConsultationWorkspace } from './pages/worker/ConsultationWorkspace';
import { AITriageTool } from './pages/worker/AITriageTool';
import { AIRiskAssessment } from './pages/worker/AIRiskAssessment';
import { HighRiskPatients } from './pages/worker/HighRiskPatients';
import { WorkerReferrals } from './pages/worker/WorkerReferrals';
import { WorkerFollowups } from './pages/worker/WorkerFollowups';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FacilityManager } from './pages/admin/FacilityManager';
import { MedicineInventory } from './pages/admin/MedicineInventory';
import { DiagnosticManager } from './pages/admin/DiagnosticManager';
import { ReferralAnalytics } from './pages/admin/ReferralAnalytics';
import { PublicHealthAnalytics } from './pages/admin/PublicHealthAnalytics';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Loading SWASTH Session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
    if (user.role === 'HEALTH_WORKER') return <Navigate to="/worker/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100/80 dark:bg-slate-950 text-slate-950 dark:text-slate-50 font-sans select-none">
      <OfflineBanner />

      {!isAuthPage && user && (
        <div className="flex flex-1 h-full min-h-0 overflow-hidden">
          {/* FIXED SIDEBAR */}
          <Sidebar className="hidden md:flex flex-shrink-0 h-full" />

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
            {/* FIXED STICKY NAVBAR */}
            <Navbar />

            {/* ONLY THIS MAIN CONTAINER SCROLLS */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
              <Routes>
                {/* Default Redirect */}
                <Route
                  path="/"
                  element={
                    user.role === 'PATIENT' ? (
                      <Navigate to="/patient/dashboard" replace />
                    ) : user.role === 'HEALTH_WORKER' ? (
                      <Navigate to="/worker/dashboard" replace />
                    ) : (
                      <Navigate to="/admin/dashboard" replace />
                    )
                  }
                />

                {/* Patient Routes */}
                <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/facilities" element={<ProtectedRoute allowedRoles={['PATIENT']}><FacilitiesList /></ProtectedRoute>} />
                <Route path="/patient/facilities/:id" element={<ProtectedRoute allowedRoles={['PATIENT']}><FacilityDetail /></ProtectedRoute>} />
                <Route path="/patient/teleconsult" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientTeleconsult /></ProtectedRoute>} />
                <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['PATIENT']}><AppointmentsList /></ProtectedRoute>} />
                <Route path="/patient/appointments/book" element={<ProtectedRoute allowedRoles={['PATIENT']}><AppointmentBooking /></ProtectedRoute>} />
                <Route path="/patient/queue" element={<ProtectedRoute allowedRoles={['PATIENT']}><QueueTracker /></ProtectedRoute>} />
                <Route path="/patient/records" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientRecords /></ProtectedRoute>} />
                <Route path="/patient/referrals" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientReferrals /></ProtectedRoute>} />
                <Route path="/patient/followups" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientFollowups /></ProtectedRoute>} />
                <Route path="/patient/ai" element={<ProtectedRoute allowedRoles={['PATIENT']}><AIAssistant /></ProtectedRoute>} />
                <Route path="/patient/emergency" element={<ProtectedRoute allowedRoles={['PATIENT']}><EmergencyAccess /></ProtectedRoute>} />

                {/* Doctor / Health Worker Routes */}
                <Route path="/worker/dashboard" element={<ProtectedRoute allowedRoles={['HEALTH_WORKER']}><WorkerDashboard /></ProtectedRoute>} />
                <Route path="/worker/queue" element={<ProtectedRoute allowedRoles={['HEALTH_WORKER']}><QueueManagement /></ProtectedRoute>} />
                <Route path="/worker/patients" element={<ProtectedRoute allowedRoles={['HEALTH_WORKER']}><PatientSearch /></ProtectedRoute>} />
                <Route path="/worker/patients/:id" element={<ProtectedRoute allowedRoles={['HEALTH_WORKER']}><ConsultationWorkspace /></ProtectedRoute>} />
                <Route path="/worker/consultation/:id" element={<ProtectedRoute allowedRoles={['HEALTH_WORKER']}><ConsultationWorkspace /></ProtectedRoute>} />
                <Route path="/worker/triage" element={<ProtectedRoute allowedRoles={['HEALTH_WORKER']}><AITriageTool /></ProtectedRoute>} />
                <Route path="/worker/ai-risk" element={<ProtectedRoute allowedRoles={['HEALTH_WORKER']}><AIRiskAssessment /></ProtectedRoute>} />
                <Route path="/worker/high-risk" element={<ProtectedRoute allowedRoles={['HEALTH_WORKER']}><HighRiskPatients /></ProtectedRoute>} />
                <Route path="/worker/referrals" element={<ProtectedRoute allowedRoles={['HEALTH_WORKER']}><WorkerReferrals /></ProtectedRoute>} />
                <Route path="/worker/followups" element={<ProtectedRoute allowedRoles={['HEALTH_WORKER']}><WorkerFollowups /></ProtectedRoute>} />

                {/* Hospital / Government Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/facilities" element={<ProtectedRoute allowedRoles={['ADMIN']}><FacilityManager /></ProtectedRoute>} />
                <Route path="/admin/medicines" element={<ProtectedRoute allowedRoles={['ADMIN']}><MedicineInventory /></ProtectedRoute>} />
                <Route path="/admin/diagnostics" element={<ProtectedRoute allowedRoles={['ADMIN']}><DiagnosticManager /></ProtectedRoute>} />
                <Route path="/admin/referrals" element={<ProtectedRoute allowedRoles={['ADMIN']}><ReferralAnalytics /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><PublicHealthAnalytics /></ProtectedRoute>} />

                {/* Settings */}
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              </Routes>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
          </div>
        </div>
      )}

      {(!user || isAuthPage) && (
        <div className="h-full w-full overflow-y-auto bg-slate-100/90 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      )}
    </div>
  );
}
