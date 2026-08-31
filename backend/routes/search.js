const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Facility = require('../models/Facility');
const PatientProfile = require('../models/PatientProfile');
const { Encounter, MedicalRecord } = require('../models/MedicalRecord');
const Referral = require('../models/Referral');
const DiagnosticService = require('../models/DiagnosticService');

const router = express.Router();

// Known clinical departments & core services for patient search autocomplete
const HEALTHCARE_SERVICES = [
  { name: 'WebRTC Live Teleconsultation', category: 'Telehealth', link: '/patient/teleconsult', desc: 'Direct 24x7 video consult with Medical Officers & Specialists' },
  { name: 'OPD Queue Tracking', category: 'OPD Services', link: '/patient/queue', desc: 'Real-time token wait position at local PHC/CHC' },
  { name: '24x7 Emergency Trauma & Ambulance', category: 'Emergency', link: '/patient/emergency', desc: 'Critical SOS dispatch and trauma care access' },
  { name: 'AI Symptom Assessment & Triage', category: 'AI Services', link: '/patient/ai', desc: 'Instant multilingual AI symptom checker' },
  { name: '12-Lead Electrocardiogram (ECG)', category: 'Diagnostics', link: '/patient/facilities', desc: 'Cardiac electrical activity & ischemia screening' },
  { name: 'Digital Chest X-Ray', category: 'Diagnostics', link: '/patient/facilities', desc: 'Pulmonary infection, TB, and bone imaging' },
  { name: 'Complete Blood Count (CBC)', category: 'Laboratory', link: '/patient/facilities', desc: 'Hemoglobin, platelets, and infection markers' },
  { name: 'Random Blood Glucose (RBG)', category: 'Laboratory', link: '/patient/facilities', desc: 'Rapid diabetes and glycemic evaluation' },
  { name: 'Maternal & Child Health (MCH) Immunization', category: 'Preventive', link: '/patient/facilities', desc: 'Antenatal checkups and childhood vaccine schedule' },
  { name: 'Essential Medicines Pharmacy', category: 'Pharmacy', link: '/patient/facilities', desc: 'Free government formulary medicine dispensing' },
];

const CLINICAL_DEPARTMENTS = [
  { name: 'General Medicine', desc: 'Outpatient consultation for common fevers, hypertension, and primary care', link: '/patient/facilities' },
  { name: 'Emergency Trauma Care', desc: '24x7 acute stabilization and emergency response', link: '/patient/emergency' },
  { name: 'Cardiology & Vascular', desc: 'Hypertension management, ECG, and heart health', link: '/patient/facilities' },
  { name: 'Pediatrics & Neonatal Care', desc: 'Child health, growth monitoring, and pediatric immunization', link: '/patient/facilities' },
  { name: 'Obstetrics & Gynaecology (MCH)', desc: 'Antenatal care, institutional deliveries, and maternal wellness', link: '/patient/facilities' },
  { name: 'Orthopedics & Fracture Clinic', desc: 'Bone trauma, joint pains, and physical rehab', link: '/patient/facilities' },
];

// ==========================================
// 1. PATIENT SEARCH: Facilities, Doctors, Services, Departments
// GET /api/search/patient?q=...
// ==========================================
router.get('/patient', protect, async (req, res, next) => {
  try {
    const q = (req.query.q || req.query.query || '').trim();
    if (!q) {
      return res.json({ facilities: [], doctors: [], services: [], departments: [] });
    }

    const regex = new RegExp(q, 'i');

    // Search Facilities
    const facilities = await Facility.find({
      $or: [
        { name: regex },
        { type: regex },
        { district: regex },
        { address: regex },
      ],
    })
      .select('name type district address phone bedCapacity opdQueue')
      .limit(6);

    // Search Doctors / Health Workers
    const doctors = await User.find({
      role: 'HEALTH_WORKER',
      $or: [{ name: regex }, { email: regex }, { phone: regex }],
    })
      .select('name email phone role district')
      .limit(6);

    // Search Services & Diagnostics
    const services = HEALTHCARE_SERVICES.filter(
      (s) => regex.test(s.name) || regex.test(s.category) || regex.test(s.desc)
    ).slice(0, 6);

    // Search Departments
    const departments = CLINICAL_DEPARTMENTS.filter(
      (d) => regex.test(d.name) || regex.test(d.desc)
    ).slice(0, 4);

    res.json({
      facilities,
      doctors,
      services,
      departments,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. DOCTOR / HEALTH WORKER SEARCH: Patients, Medical Records, Referrals
// GET /api/search/doctor?q=...
// ==========================================
router.get('/doctor', protect, authorize('HEALTH_WORKER', 'ADMIN'), async (req, res, next) => {
  try {
    const q = (req.query.q || req.query.query || '').trim();
    if (!q) {
      return res.json({ patients: [], records: [], referrals: [] });
    }

    const regex = new RegExp(q, 'i');

    // 1. Search Patients by name, phone, email, district, or chronic conditions
    const matchedUsers = await User.find({
      role: 'PATIENT',
      $or: [{ name: regex }, { email: regex }, { phone: regex }, { district: regex }],
    }).limit(8);

    const userIds = matchedUsers.map((u) => u._id);

    // Also find profiles matching chronic conditions or blood group
    const profileMatches = await PatientProfile.find({
      $or: [
        { user: { $in: userIds } },
        { chronicConditions: regex },
        { bloodGroup: regex },
        { 'address.villageOrCity': regex },
      ],
    }).populate('user', 'name email phone role');

    // Consolidate unique patient list
    const patientMap = new Map();

    matchedUsers.forEach((u) => {
      patientMap.set(u._id.toString(), {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        district: u.district || 'Rural District',
        gender: 'PATIENT',
        bloodGroup: 'N/A',
        chronicConditions: [],
      });
    });

    profileMatches.forEach((p) => {
      if (p.user) {
        patientMap.set(p.user._id.toString(), {
          _id: p.user._id,
          profileId: p._id,
          name: p.user.name,
          email: p.user.email,
          phone: p.user.phone,
          district: p.address?.district || 'Satara',
          gender: p.gender || 'PATIENT',
          bloodGroup: p.bloodGroup || 'N/A',
          chronicConditions: p.chronicConditions || [],
        });
      }
    });

    const patients = Array.from(patientMap.values()).slice(0, 8);

    // 2. Search Clinical Records / Encounters
    const encounters = await Encounter.find({
      $or: [
        { patient: { $in: userIds } },
        { chiefComplaints: regex },
        { 'diagnoses.condition': regex },
        { clinicalNotes: regex },
      ],
    })
      .populate('patient', 'name email phone')
      .populate('facility', 'name type')
      .populate('healthWorker', 'name')
      .limit(6);

    const records = encounters.map((e) => ({
      _id: e._id,
      patientId: e.patient?._id,
      patientName: e.patient?.name || 'Patient',
      complaints: e.chiefComplaints || [],
      diagnoses: e.diagnoses?.map((d) => d.condition) || [],
      facilityName: e.facility?.name || 'Primary Health Centre',
      encounterDate: e.encounterDate,
      clinicalNotes: e.clinicalNotes,
    }));

    // 3. Search Referrals
    const referrals = await Referral.find({
      $or: [
        { patient: { $in: userIds } },
        { reason: regex },
        { department: regex },
        { clinicalSummary: regex },
        { status: regex },
      ],
    })
      .populate('patient', 'name email phone')
      .populate('referringFacility', 'name type district')
      .populate('receivingFacility', 'name type district')
      .limit(6);

    res.json({
      patients,
      records,
      referrals,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
