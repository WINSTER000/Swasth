# SWASTH — AI-Assisted Rural Healthcare Access & Continuity Platform

> **SIH Problem Statement 26133**: "Accessibility and quality of public healthcare services, particularly in rural and underserved areas."

SWASTH is a real, full-stack, production-grade healthcare platform designed to solve long travel distances, shortage of specialists, irregular diagnostics, fragmented medical records, delayed referrals, and lack of information continuity across Indian rural health networks (PHCs, CHCs, and District Hospitals).

---

## 🏛️ 1. Three User-Facing Product Sides

The application is structured into **exactly three user-facing sides**:

1. **PATIENT WEB APP** (`/patient/dashboard`)
   - Dashboard, Facility Discovery, Interactive Map, Appointment Booking, Real-time Queue Tracking, Longitudinal Medical Records, Referrals Timeline, Follow-up Reminders, Multilingual AI Health Assistant, Emergency Access.
2. **DOCTOR / HEALTH WORKER WEB APP** (`/worker/dashboard`)
   - Today's Queue Management, Patient Directory & Longitudinal Record Search, Consultation Workspace, AI Digital Triage Tool, AI Risk Detection & Early Warning System, High-Risk Patient Watchlist, Specialist Referral Creator, Follow-up Scheduler, WebRTC Teleconsultation.
3. **HOSPITAL / GOVERNMENT ADMIN DASHBOARD** (`/admin/dashboard`)
   - Unified Institutional Admin Console featuring a toggle between **Hospital Operational Management** (facility details, beds, medicine stock, diagnostic availability) and **Government Public Health Monitoring** (district aggregated referral completion rates, waiting-time trends, risk distribution charts, quality indicators).

---

## 🛠️ 2. Technology Stack

- **Frontend**: React (v18), Vite, Tailwind CSS, React Router (v6), Axios, Lucide React, Recharts, i18next, react-i18next, date-fns, socket.io-client.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose ODM, JWT Authentication, bcryptjs, Socket.IO, Helmet, CORS, Express Rate Limit.
- **AI Architecture**: `AIService` with pluggable `MockAIProvider` (supporting English, Hindi, Marathi) and `GeminiAIProvider` stub.
- **Maps Architecture**: `MapsService` with pluggable `MockMapsProvider` (Haversine distance, travel time, route simulation) and `GoogleMapsProvider` stub.
- **Notification Architecture**: `NotificationService` with pluggable `MockNotificationProvider` (creates real MongoDB Notification documents) and `FirebaseNotificationProvider` stub.
- **Teleconsultation**: WebRTC video/audio peer connections with Socket.IO signaling.

---

## 🌐 3. Multilingual & Theme Architecture

- **Supported Languages**: English (`en`), Hindi (`hi` - हिन्दी), Marathi (`mr` - मराठी).
- **Dynamic Translation**: Uses `react-i18next` with JSON locale bundles across 15 domains (`common`, `auth`, `patient`, `healthWorker`, `admin`, `appointments`, `queue`, `records`, `referrals`, `medicines`, `diagnostics`, `followups`, `risk`, `ai`, `notifications`).
- **Multilingual AI**: Dynamically formats AI assistant responses and disclaimers according to selected language.
- **Theme Modes**: Full Tailwind dark mode integration (`light`, `dark`, `system`). Theme selection persists across refreshes in `localStorage`.

---

## 🚀 4. Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+ or v22+)
- MongoDB running locally at `mongodb://127.0.0.1:27017/swasth_db` or a remote MongoDB URI.

### Step 1: Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### Step 2: Seed Database
Populate MongoDB with realistic Satara district rural healthcare facilities, medical officers, patients, appointments, longitudinal encounters, prescriptions, referrals, medicine stock, and risk assessments:
```bash
npm run seed
```

### Step 3: Run Development Server
```bash
npm run dev
```
- Backend server runs at: `http://localhost:5000`
- Frontend application runs at: `http://localhost:5173`

---

## 🔑 5. Test Accounts (Pre-Seeded)

| Role | Email | Password | Scope / Permissions |
| :--- | :--- | :--- | :--- |
| **PATIENT** | `patient@swasth.gov.in` | `password123` | Ramesh Patil (Shirwal PHC Patient) |
| **PATIENT** | `sunita@swasth.gov.in` | `password123` | Sunita Deshmukh (Khandala CHC Patient) |
| **HEALTH WORKER** | `doctor@swasth.gov.in` | `password123` | Dr. Anand Kulkarni (PHC Medical Officer) |
| **HEALTH WORKER** | `specialist@swasth.gov.in` | `password123` | Dr. Smita Pawar (District Specialist) |
| **HOSPITAL ADMIN** | `admin@swasth.gov.in` | `password123` | Satara District Hospital Admin |
| **GOVT ADMIN** | `govadmin@swasth.gov.in` | `password123` | District Health Officer (Public Health View) |

---

## 🤖 6. AI System Capabilities

SWASTH implements **four distinct AI capabilities** via `AIService`:

1. **AI Health Assistant**: Patient Q&A for appointments, medicines, referrals, emergency escalation.
2. **AI Digital Triage**: Clinical symptom & vital evaluator producing urgency levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), observations, considerations, and next actions.
3. **AI Record Summarizer**: Synthesizes past patient encounters, active prescriptions, and lab reports into concise clinical summaries.
4. **AI Risk Detection & Early Warning**: Calculates `aiRiskLevel` based on age, blood pressure, oxygen saturation, and missed follow-ups. Includes a Health Worker Review workflow (`ACCEPT`, `MODIFY`, `REJECT`) that automatically schedules priority follow-ups and issues alerts upon confirmation.

---

## 📡 7. API Endpoints Map

- `POST /api/auth/register`, `/login`, `/logout`, `GET /me`
- `GET /api/patients/me`, `/records`, `/appointments`, `/referrals`, `/followups`, `/risk-assessments`
- `GET /api/facilities`, `/nearby`, `/:id`
- `POST /api/appointments`, `GET /api/appointments`, `DELETE /:id`
- `GET /api/queues/:facilityId`, `POST /check-in`, `POST /next`
- `GET /api/records/:patientId`, `POST /encounters`, `POST /prescriptions`, `POST /labs`
- `POST /api/referrals`, `GET /api/referrals`, `PATCH /:id/status`
- `GET /api/followups`, `POST /api/followups`, `PATCH /:id`
- `GET /api/medicines`, `PATCH /api/medicines/inventory/:id`
- `GET /api/diagnostics`, `PATCH /api/diagnostics/facility-diagnostic/:id`
- `POST /api/ai/assistant`, `/triage`, `/summarize`, `/risk-assessment`
- `PATCH /api/risk-assessments/:id/review`
- `GET /api/notifications`, `PATCH /read-all`
- `GET /api/analytics/facility`, `/government`
- `GET /api/maps/nearby`, `/route`

---

## 🛡️ 8. Medical Safety & Disclaimer

SWASTH AI features are decision-support tools only. AI does not independently diagnose, prescribe, or make final clinical decisions. All AI outputs include explicit disclaimers and require professional healthcare worker review.
