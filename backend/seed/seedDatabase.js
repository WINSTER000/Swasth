const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const HealthWorkerProfile = require('../models/HealthWorkerProfile');
const Facility = require('../models/Facility');
const Department = require('../models/Department');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const { MedicalRecord, Encounter, Prescription, LabReport } = require('../models/MedicalRecord');
const Referral = require('../models/Referral');
const FollowUp = require('../models/FollowUp');
const RiskAssessment = require('../models/RiskAssessment');
const { Medicine, MedicineInventory } = require('../models/Medicine');
const { DiagnosticService, FacilityDiagnostic } = require('../models/DiagnosticService');
const Notification = require('../models/Notification');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swasth_db';
    console.log(`[Seed Script] Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed Script] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      PatientProfile.deleteMany({}),
      HealthWorkerProfile.deleteMany({}),
      Facility.deleteMany({}),
      Department.deleteMany({}),
      Service.deleteMany({}),
      Appointment.deleteMany({}),
      Queue.deleteMany({}),
      MedicalRecord.deleteMany({}),
      Encounter.deleteMany({}),
      Prescription.deleteMany({}),
      LabReport.deleteMany({}),
      Referral.deleteMany({}),
      FollowUp.deleteMany({}),
      RiskAssessment.deleteMany({}),
      Medicine.deleteMany({}),
      MedicineInventory.deleteMany({}),
      DiagnosticService.deleteMany({}),
      FacilityDiagnostic.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    console.log('[Seed Script] Creating Facilities...');
    const phcShirwal = await Facility.create({
      name: 'Shirwal Primary Health Centre (PHC)',
      type: 'PHC',
      code: 'PHC-SHIRWAL-412801',
      district: 'Satara',
      state: 'Maharashtra',
      address: 'Near Bus Stand, Shirwal, Satara District, 412801',
      location: { lat: 18.1472, lng: 73.9847 },
      phone: '+91 2169 244102',
      operatingHours: '08:00 AM - 04:00 PM (24x7 Emergency)',
      totalBeds: 12,
      availableBeds: 8,
      icuBeds: 0,
      queueStatus: 'NORMAL',
      averageWaitTimeMinutes: 20,
    });

    const chcKhandala = await Facility.create({
      name: 'Khandala Community Health Centre (CHC)',
      type: 'CHC',
      code: 'CHC-KHANDALA-412802',
      district: 'Satara',
      state: 'Maharashtra',
      address: 'NH-48 Bypass, Khandala, Satara District, 412802',
      location: { lat: 18.0333, lng: 73.9833 },
      phone: '+91 2169 252044',
      operatingHours: '24 Hours Emergency & IPD',
      totalBeds: 30,
      availableBeds: 14,
      icuBeds: 4,
      queueStatus: 'BUSY',
      averageWaitTimeMinutes: 35,
    });

    const sataraDistrictHospital = await Facility.create({
      name: 'Satara District General Hospital',
      type: 'DISTRICT_HOSPITAL',
      code: 'DH-SATARA-415001',
      district: 'Satara',
      state: 'Maharashtra',
      address: 'Sadar Bazar Road, Satara City, Maharashtra 415001',
      location: { lat: 17.6868, lng: 74.0000 },
      phone: '+91 2162 234100',
      operatingHours: '24x7 Multi-specialty Tertiary Centre',
      totalBeds: 250,
      availableBeds: 62,
      icuBeds: 20,
      queueStatus: 'BUSY',
      averageWaitTimeMinutes: 45,
    });

    await Facility.create({
      name: 'Wai Sub-District Hospital (SDH)',
      type: 'DISTRICT_HOSPITAL',
      code: 'SDH-WAI-412803',
      district: 'Satara',
      state: 'Maharashtra',
      address: 'Gangapuri Road, Wai, Satara District 412803',
      location: { lat: 17.9467, lng: 73.8944 },
      phone: '+91 2167 222100',
      operatingHours: '24x7 Multi-Specialty & ICU',
      totalBeds: 100,
      availableBeds: 28,
      icuBeds: 8,
      queueStatus: 'NORMAL',
      averageWaitTimeMinutes: 15,
    });

    await Facility.create({
      name: 'Mahabaleshwar Rural Hospital',
      type: 'CHC',
      code: 'CHC-MAHABALESHWAR-412806',
      district: 'Satara',
      state: 'Maharashtra',
      address: 'Kate\'s Point Road, Mahabaleshwar 412806',
      location: { lat: 17.9237, lng: 73.6586 },
      phone: '+91 2168 260233',
      operatingHours: '24 Hours Emergency & Outpatient',
      totalBeds: 24,
      availableBeds: 10,
      icuBeds: 2,
      queueStatus: 'NORMAL',
      averageWaitTimeMinutes: 10,
    });

    await Facility.create({
      name: 'Karad General Specialty Hospital',
      type: 'DISTRICT_HOSPITAL',
      code: 'DH-KARAD-415110',
      district: 'Satara',
      state: 'Maharashtra',
      address: 'Near Shani Mandir, Karad City 415110',
      location: { lat: 17.2858, lng: 74.1834 },
      phone: '+91 2164 220055',
      operatingHours: '24x7 Trauma & Tertiary Care',
      totalBeds: 180,
      availableBeds: 45,
      icuBeds: 14,
      queueStatus: 'BUSY',
      averageWaitTimeMinutes: 30,
    });

    await Facility.create({
      name: 'Phaltan Community Health Centre',
      type: 'CHC',
      code: 'CHC-PHALTAN-415523',
      district: 'Satara',
      state: 'Maharashtra',
      address: 'Laxminagar Road, Phaltan 415523',
      location: { lat: 17.9866, lng: 74.4328 },
      phone: '+91 2166 222301',
      operatingHours: '08:00 AM - 08:00 PM (Emergency 24x7)',
      totalBeds: 35,
      availableBeds: 18,
      icuBeds: 3,
      queueStatus: 'NORMAL',
      averageWaitTimeMinutes: 15,
    });

    await Facility.create({
      name: 'Bhuinj Primary Health Centre (PHC)',
      type: 'PHC',
      code: 'PHC-BHUINJ-412804',
      district: 'Satara',
      state: 'Maharashtra',
      address: 'NH-48 National Highway, Bhuinj 412804',
      location: { lat: 17.8931, lng: 73.9622 },
      phone: '+91 2167 240112',
      operatingHours: '08:00 AM - 04:00 PM',
      totalBeds: 10,
      availableBeds: 6,
      icuBeds: 0,
      queueStatus: 'NORMAL',
      averageWaitTimeMinutes: 12,
    });

    await Facility.create({
      name: 'Patan Rural Health Centre',
      type: 'CHC',
      code: 'CHC-PATAN-415206',
      district: 'Satara',
      state: 'Maharashtra',
      address: 'Koyna Nagar Road, Patan 415206',
      location: { lat: 17.3694, lng: 73.9011 },
      phone: '+91 2165 220110',
      operatingHours: '24 Hours OPD & IPD',
      totalBeds: 28,
      availableBeds: 12,
      icuBeds: 2,
      queueStatus: 'NORMAL',
      averageWaitTimeMinutes: 18,
    });

    console.log('[Seed Script] Creating Departments & Services...');
    const depGenMed = await Department.create({ facility: phcShirwal._id, name: 'General Medicine', description: 'Outpatient consultations and general care' });
    const depMch = await Department.create({ facility: phcShirwal._id, name: 'Maternal & Child Health', description: 'Antenatal care and immunization' });
    const depSpecialty = await Department.create({ facility: sataraDistrictHospital._id, name: 'Cardiology & Intensive Care', description: 'Advanced cardiac care and ICU' });

    await Service.create([
      { facility: phcShirwal._id, department: depGenMed._id, name: 'General OPD Consultation', category: 'OPD' },
      { facility: phcShirwal._id, department: depMch._id, name: 'ANC Screening & Vaccination', category: 'Maternal' },
      { facility: sataraDistrictHospital._id, department: depSpecialty._id, name: 'Echocardiography & Cardiac ICU', category: 'Specialty' },
    ]);

    console.log('[Seed Script] Creating Users...');
    const patientUser1 = await User.create({
      name: 'Ramesh Patil',
      email: 'patient@swasth.gov.in',
      password: defaultPassword,
      role: 'PATIENT',
      phone: '+91 98220 11223',
      languagePreference: 'mr',
    });

    const patientUser2 = await User.create({
      name: 'Sunita Deshmukh',
      email: 'sunita@swasth.gov.in',
      password: defaultPassword,
      role: 'PATIENT',
      phone: '+91 98220 44556',
      languagePreference: 'hi',
    });

    const doctorUser1 = await User.create({
      name: 'Dr. Anand Kulkarni',
      email: 'doctor@swasth.gov.in',
      password: defaultPassword,
      role: 'HEALTH_WORKER',
      phone: '+91 94220 77889',
      languagePreference: 'en',
    });

    const specialistUser = await User.create({
      name: 'Dr. Smita Pawar',
      email: 'specialist@swasth.gov.in',
      password: defaultPassword,
      role: 'HEALTH_WORKER',
      phone: '+91 94220 99001',
      languagePreference: 'en',
    });

    const adminUser = await User.create({
      name: 'Satara Hospital Administrator',
      email: 'admin@swasth.gov.in',
      password: defaultPassword,
      role: 'ADMIN',
      adminLevel: 'HOSPITAL',
      phone: '+91 2162 234101',
      languagePreference: 'en',
    });

    const govAdminUser = await User.create({
      name: 'District Health Officer (DHO)',
      email: 'govadmin@swasth.gov.in',
      password: defaultPassword,
      role: 'ADMIN',
      adminLevel: 'GOVERNMENT',
      phone: '+91 2162 234999',
      languagePreference: 'en',
    });

    console.log('[Seed Script] Creating Profiles...');
    await PatientProfile.create({
      user: patientUser1._id,
      gender: 'MALE',
      dateOfBirth: new Date('1975-06-14'),
      bloodGroup: 'B+',
      address: { street: 'Main Gram Panchayat Road', villageOrCity: 'Shirwal', district: 'Satara', state: 'Maharashtra', pincode: '412801' },
      emergencyContact: { name: 'Suresh Patil', relationship: 'Brother', phone: '+91 98220 99887' },
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
      primaryFacility: phcShirwal._id,
    });

    await PatientProfile.create({
      user: patientUser2._id,
      gender: 'FEMALE',
      dateOfBirth: new Date('1992-09-20'),
      bloodGroup: 'O+',
      address: { street: 'Near Temple', villageOrCity: 'Khandala', district: 'Satara', state: 'Maharashtra', pincode: '412802' },
      emergencyContact: { name: 'Vikas Deshmukh', relationship: 'Husband', phone: '+91 98220 33445' },
      allergies: [],
      chronicConditions: ['Mild Anemia'],
      primaryFacility: chcKhandala._id,
    });

    await HealthWorkerProfile.create({
      user: doctorUser1._id,
      facility: phcShirwal._id,
      designation: 'Medical Officer (MO)',
      specialization: 'General Medicine & Rural Health',
      department: 'OPD',
      licenseNumber: 'MMC/2012/04/1829',
    });

    await HealthWorkerProfile.create({
      user: specialistUser._id,
      facility: sataraDistrictHospital._id,
      designation: 'Senior Consultant Physician',
      specialization: 'Cardiology',
      department: 'Cardiology & Intensive Care',
      licenseNumber: 'MMC/2008/02/0912',
    });

    console.log('[Seed Script] Creating Medicines & Inventory...');
    const medPara = await Medicine.create({ name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic & Antipyretic', dosageForm: 'Tablet' });
    const medAmox = await Medicine.create({ name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', dosageForm: 'Capsule' });
    const medMet = await Medicine.create({ name: 'Metformin 500mg', genericName: 'Metformin Hydrochloride', category: 'Antidiabetic', dosageForm: 'Tablet' });
    const medIron = await Medicine.create({ name: 'Iron & Folic Acid (IFA)', genericName: 'Ferrous Sulfate + Folic Acid', category: 'Nutritional Supplement', dosageForm: 'Tablet' });

    await MedicineInventory.create([
      { medicine: medPara._id, facility: phcShirwal._id, stockQuantity: 450, lowStockThreshold: 100, availabilityStatus: 'AVAILABLE' },
      { medicine: medAmox._id, facility: phcShirwal._id, stockQuantity: 35, lowStockThreshold: 50, availabilityStatus: 'LIMITED' },
      { medicine: medMet._id, facility: phcShirwal._id, stockQuantity: 280, lowStockThreshold: 80, availabilityStatus: 'AVAILABLE' },
      { medicine: medIron._id, facility: phcShirwal._id, stockQuantity: 600, lowStockThreshold: 150, availabilityStatus: 'AVAILABLE' },
      { medicine: medPara._id, facility: sataraDistrictHospital._id, stockQuantity: 1200, lowStockThreshold: 200, availabilityStatus: 'AVAILABLE' },
    ]);

    console.log('[Seed Script] Creating Diagnostics...');
    const diagCbc = await DiagnosticService.create({ name: 'Complete Blood Count (CBC)', code: 'PATH-01', category: 'Pathology' });
    const diagXray = await DiagnosticService.create({ name: 'Chest X-Ray (PA View)', code: 'RAD-01', category: 'Radiology' });
    const diagEcg = await DiagnosticService.create({ name: '12-Lead ECG', code: 'CARD-01', category: 'Cardiology' });
    const diagGlucose = await DiagnosticService.create({ name: 'Random Blood Glucose (RBG)', code: 'PATH-02', category: 'Pathology' });

    await FacilityDiagnostic.create([
      { diagnosticService: diagCbc._id, facility: phcShirwal._id, availabilityStatus: 'AVAILABLE', estimatedReportTimeHours: 2, priceInINR: 0 },
      { diagnosticService: diagGlucose._id, facility: phcShirwal._id, availabilityStatus: 'AVAILABLE', estimatedReportTimeHours: 1, priceInINR: 0 },
      { diagnosticService: diagEcg._id, facility: phcShirwal._id, availabilityStatus: 'LIMITED', estimatedReportTimeHours: 1, priceInINR: 0 },
      { diagnosticService: diagXray._id, facility: sataraDistrictHospital._id, availabilityStatus: 'AVAILABLE', estimatedReportTimeHours: 4, priceInINR: 0 },
    ]);

    console.log('[Seed Script] Creating Appointments & Queue...');
    const appt1 = await Appointment.create({
      patient: patientUser1._id,
      facility: phcShirwal._id,
      healthWorker: doctorUser1._id,
      department: 'General Medicine',
      date: new Date(),
      time: '10:00 AM',
      reason: 'Persistent fever and chest tightness',
      tokenNumber: 101,
      status: 'IN_QUEUE',
      appointmentType: 'IN_PERSON',
    });

    const appt2 = await Appointment.create({
      patient: patientUser2._id,
      facility: chcKhandala._id,
      healthWorker: doctorUser1._id,
      department: 'Maternal & Child Health',
      date: new Date(),
      time: '11:30 AM',
      reason: 'Routine ANC Checkup & Hb test',
      tokenNumber: 102,
      status: 'CONFIRMED',
      appointmentType: 'TELECONSULT',
    });

    const todayStr = new Date().toISOString().split('T')[0];
    await Queue.create({
      facility: phcShirwal._id,
      department: 'General Medicine',
      date: todayStr,
      currentToken: 100,
      items: [
        {
          appointment: appt1._id,
          patient: patientUser1._id,
          tokenNumber: 101,
          status: 'WAITING',
          priority: 'URGENT',
          checkInTime: new Date(),
        },
      ],
    });

    console.log('[Seed Script] Creating Longitudinal Medical Records...');
    const labR1 = await LabReport.create({
      patient: patientUser1._id,
      facility: phcShirwal._id,
      testName: 'Complete Blood Count (CBC)',
      category: 'Pathology',
      result: 'Hb: 13.5 g/dL, TLC: 11,200 /cumm, Platelets: 2.1 Lakhs',
      status: 'COMPLETED',
    });

    const presc1 = await Prescription.create({
      patient: patientUser1._id,
      healthWorker: doctorUser1._id,
      facility: phcShirwal._id,
      medications: [
        { medicineName: 'Paracetamol 500mg', dosage: '500mg', frequency: 'Three times a day after food', duration: '3 days', instructions: 'Take with plenty of warm water' },
        { medicineName: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'Complete full course' },
      ],
      notes: 'Advised rest and warm fluids.',
    });

    const enc1 = await Encounter.create({
      patient: patientUser1._id,
      healthWorker: doctorUser1._id,
      facility: phcShirwal._id,
      appointment: appt1._id,
      chiefComplaints: ['High fever for 3 days', 'Dry cough', 'Moderate hypertension episode'],
      vitals: { bp: '145/92', pulse: 92, temp: 101.2, spo2: 95, weight: 68 },
      diagnoses: [{ condition: 'Acute Febrile Illness', type: 'PRIMARY', severity: 'MODERATE' }, { condition: 'Stage 1 Essential Hypertension', type: 'CHRONIC', severity: 'MILD' }],
      prescriptions: [presc1._id],
      labReports: [labR1._id],
      clinicalNotes: 'Patient presented with 3-day history of fever. Elevated BP noted.',
      aiSummary: 'Clinical History Summary: Patient exhibits acute febrile symptoms with elevated BP (145/92 mmHg). Prescribed Paracetamol & Amoxicillin.',
    });

    await MedicalRecord.create({
      patient: patientUser1._id,
      encounters: [enc1._id],
      prescriptions: [presc1._id],
      labReports: [labR1._id],
    });

    console.log('[Seed Script] Creating Referral & FollowUp...');
    const ref1 = await Referral.create({
      patient: patientUser1._id,
      referringFacility: phcShirwal._id,
      receivingFacility: sataraDistrictHospital._id,
      referringHealthWorker: doctorUser1._id,
      receivingHealthWorker: specialistUser._id,
      department: 'Cardiology & Intensive Care',
      reason: 'Evaluation of persistent hypertensive spikes and cardiac clearance',
      urgency: 'URGENT',
      clinicalSummary: '49-year-old male with BP 145/92 mmHg and intermittent chest pain episode. Referred for 2D Echo and specialist review.',
      status: 'SENT',
    });

    const follow1 = await FollowUp.create({
      patient: patientUser1._id,
      responsibleHealthWorker: doctorUser1._id,
      facility: phcShirwal._id,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      reason: 'Post-referral BP evaluation & prescription review',
      status: 'PENDING',
      priority: 'PRIORITY',
      notes: 'Check referral outcome report from Satara District Hospital.',
    });

    console.log('[Seed Script] Creating AI Risk Assessment & Notifications...');
    await RiskAssessment.create({
      patient: patientUser1._id,
      encounter: enc1._id,
      aiRiskLevel: 'HIGH',
      riskFactors: ['Elevated Systolic BP (145 mmHg)', 'Sub-optimal SpO2 (95%)', 'Reported chest discomfort'],
      warningSignals: ['Cardiovascular risk progression'],
      recommendedAction: 'Priority referral consult at District Hospital Cardiology Unit within 48 hours.',
      followUpPriority: 'PRIORITY',
      aiConfidence: 0.92,
      healthWorkerDecision: 'ACCEPT',
      finalRiskLevel: 'HIGH',
      reviewedBy: doctorUser1._id,
      reviewedAt: new Date(),
    });

    await Notification.create([
      {
        user: patientUser1._id,
        title: 'Appointment Confirmed',
        message: 'Your appointment at Shirwal PHC for General OPD is set for today (Token #101).',
        type: 'APPOINTMENT_CONFIRMATION',
        link: '/patient/appointments',
        isRead: false,
      },
      {
        user: patientUser1._id,
        title: 'Priority Health Alert',
        message: 'Your medical officer has created an URGENT referral to Satara District Hospital.',
        type: 'REFERRAL_CREATED',
        link: '/patient/referrals',
        isRead: false,
      },
    ]);

    console.log('=============================================================');
    console.log('  SUCCESSFULLY SEEDED SWASTH DATABASE WITH REAL RECORDS!');
    console.log('=============================================================');
    console.log('Test Accounts Available:');
    console.log('  PATIENT:         patient@swasth.gov.in     / password123');
    console.log('  DOCTOR:          doctor@swasth.gov.in      / password123');
    console.log('  HOSPITAL ADMIN:  admin@swasth.gov.in       / password123');
    console.log('  GOVT ADMIN:      govadmin@swasth.gov.in    / password123');
    console.log('=============================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Script Error] ${error.stack || error.message}`);
    process.exit(1);
  }
};

seedDB();
