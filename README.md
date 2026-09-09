## Problem Statement

| | Details |
|---|---|
| **Problem Statement ID** | SIH26133 |
| **Problem Statement Title** | Accessibility and quality of public healthcare services, particularly in rural and underserved areas |
| **Theme** | MedTech / BioTech / HealthTech |
| **PS Category** | Software |

SWASTH 🏥

AI-Assisted Rural Healthcare Access & Continuity Platform

SWASTH is a full-stack healthcare platform designed to improve access to public healthcare services in rural and underserved communities. It connects patients, healthcare workers, and healthcare facilities in one system to support the complete healthcare journey — from consultation and diagnosis support to referrals and follow-up care.

The platform focuses on continuity of care, helping prevent patients from getting lost between different healthcare facilities by keeping important information, referrals, and follow-ups connected.

🚀 Key Features

🤖 AI-assisted healthcare consultation and digital triage

⚠️ AI-assisted patient risk detection

📋 Longitudinal digital medical records

📅 Appointment and queue management

🔄 Referral tracking between healthcare facilities

🔔 Follow-up management and notifications

💊 Medicine availability tracking

🧪 Diagnostic service availability

🎥 Doctor-patient teleconsultation using WebRTC

🗺️ Facility discovery using Leaflet and OpenStreetMap

📊 Facility and public-health dashboards

🔐 JWT authentication and role-based access

📝 Healthcare activity and audit logging

📡 Support for low-connectivity environments

🌐 Language Selection & AI Voice Support — Language options for English, Hindi, and Marathi, with multilingual AI Assistant voice interaction; full application UI translation is planned for a future release.

## 🖥️ Applications Preview

<div align="center">

<strong>Authentication</strong><br><br>

<img src="https://github.com/user-attachments/assets/071187fd-0158-473b-a1da-eade43117e6e" width="90%">

</div>

<br>

<table>
<tr>
<td align="center" width="50%">
<strong>Patient Dashboard</strong><br><br>
<img src="https://github.com/user-attachments/assets/70938696-ddd8-4368-b0e3-e7437311c6f5" width="100%">
</td>

<td align="center" width="50%">
<strong>Healthcare Facility Map</strong><br><br>
<img src="https://github.com/user-attachments/assets/2596eae1-581b-46f0-8d9d-5575473970b6" width="100%">
</td>
</tr>

<tr>
<td align="center" width="50%">
<strong>AI Healthcare Assistant</strong><br><br>
<img src="https://github.com/user-attachments/assets/c237e7c0-b4b0-4b85-a702-58ac82b9e87b" width="100%">
</td>

<td align="center" width="50%">
<strong>Health Worker Dashboard</strong><br><br>
<img src="https://github.com/user-attachments/assets/94900b04-deff-4138-b59b-0fc8fb5cadd1" width="100%">
</td>
</tr>

<tr>
<td align="center" width="50%">
<strong>Hospital Dashboard</strong><br><br>
<img src="https://github.com/user-attachments/assets/07f42a82-459f-468d-b223-4edafd8982d6" width="100%">
</td>

<td align="center" width="50%">
<strong>Government Dashboard</strong><br><br>
<img src="https://github.com/user-attachments/assets/f4bbb0ea-d8bb-4e6e-bf1e-3939de7a8ff8" width="100%">
</td>
</tr>
</table>


🔄 How SWASTH Works

Patient → Appointment / Consultation → Medical Record → AI-Assisted Triage & Risk Detection → Referral if Required → Receiving Healthcare Facility → Treatment & Follow-up → Continuous Patient Care

🧠 AI System

SWASTH uses an AI service layer for healthcare decision support. The AI system can assist with digital triage, patient risk detection, medical-record summarization, referral assistance, and healthcare questions.

AI-generated results are presented as decision-support information, while healthcare workers remain responsible for clinical decisions.

AI Architecture: The AI assistant operates on data available within the SWASTH platform, such as patient records, medical history, consultations, and other authorized healthcare information. It does not rely on external patient data or internet-based medical searches for its core analysis.

🏗️ System Architecture

React Frontend → Axios / Socket.IO → Node.js + Express → Application Services → Mongoose → MongoDB

The backend also connects to external services such as Gemini, Leaflet/OpenStreetMap, WebRTC, Firebase and Google Cloud Translation where required.

🛠️ Tech Stack

Frontend: React, Vite, Tailwind CSS, Axios, Socket.IO Client

Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt

AI & Integrations: Gemini API, WebRTC, Socket.IO, Leaflet, OpenStreetMap, Firebase Cloud Messaging, Google Cloud Translation

🔐 Security

SWASTH uses JWT authentication, bcrypt password hashing, role-based authorization, protected API routes, request validation, rate limiting, security headers, environment-based secrets, and audit logging.

Sensitive API keys and credentials are kept on the backend and are not exposed to the frontend.

🎯 Problem Statement

SIH Problem Statement 26133 — Accessibility and quality of public healthcare services, particularly in rural and underserved areas.

Rural communities can face long travel distances, limited specialist availability, fragmented medical records, delayed referrals, diagnostic limitations, and difficulty maintaining follow-up care.

SWASTH addresses these challenges by connecting healthcare access, consultation, records, referrals, and follow-up into a single platform.

🌱 Impact

SWASTH aims to reduce unnecessary travel, improve healthcare access, reduce referral delays, improve referral completion, support healthcare workers with AI-assisted tools, improve continuity of patient records, make medicine and diagnostic availability easier to discover, and improve follow-up for high-risk patients.

📁 Project Structure

Swasth/

frontend/

backend/

package.json

package-lock.json

README.md

⚙️ Getting Started

Clone the repository and install the dependencies.

git clone https://github.com/WINSTER000/Swasth.git
cd Swasth

Install frontend and backend dependencies if required.

cd frontend
npm install
cd ../backend
npm install

Create the required environment variables in the backend and configure the database and external services.

Start the application using the project's development script:

cd frontend
npm run dev 

cd backend
npm start   

🚧 Project Status

SWASTH is a functional hackathon prototype with working end-to-end healthcare workflows. Core features including AI-assisted healthcare support, risk detection, appointments, referrals, follow-ups, notifications, teleconsultation, facility discovery, medical records, and dashboards are implemented and integrated into the platform.

The system uses a modular architecture that allows production healthcare APIs, verified health-data integrations, and real-world service providers to be connected as the platform moves toward production deployment.

⚠️ Disclaimer

SWASTH is a prototype developed for the Smart India Hackathon. It is intended as a healthcare access and decision-support platform and does not replace qualified medical professionals, emergency services, or clinical diagnosis.

🏆 Developed as part of the Smart India Hackathon 2026 selection journey

SWASTH — Connecting Healthcare Access, Care and Continuity.
