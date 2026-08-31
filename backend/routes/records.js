const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { MedicalRecord, Encounter, Prescription, LabReport } = require('../models/MedicalRecord');
const User = require('../models/User');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// GET /api/records/:patientId
router.get('/:patientId', protect, async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Security check: Patients can only access their own records
    if (req.user.role === 'PATIENT' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ message: 'Unauthorized access to patient records' });
    }

    let record = await MedicalRecord.findOne({ patient: patientId })
      .populate({
        path: 'encounters',
        populate: [{ path: 'healthWorker', select: 'name role' }, { path: 'facility', select: 'name type' }],
      })
      .populate({
        path: 'prescriptions',
        populate: [{ path: 'healthWorker', select: 'name' }, { path: 'facility', select: 'name' }],
      })
      .populate('labReports');

    if (!record) {
      record = await MedicalRecord.create({ patient: patientId, encounters: [], prescriptions: [], labReports: [] });
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
});

// POST /api/records/encounters (Health Worker creates consultation encounter)
router.post('/encounters', protect, authorize('HEALTH_WORKER', 'ADMIN'), async (req, res, next) => {
  try {
    const { patientId, facilityId, appointmentId, chiefComplaints, vitals, diagnoses, clinicalNotes, aiSummary } = req.body;

    // Resolve Facility
    let targetFacilityId = facilityId;
    const Facility = require('../models/Facility');
    const Appointment = require('../models/Appointment');
    const Queue = require('../models/Queue');

    if (!targetFacilityId || targetFacilityId === '66d1f0000000000000000001') {
      const defaultFac = await Facility.findOne({});
      targetFacilityId = defaultFac?._id;
    }

    const encounter = await Encounter.create({
      patient: patientId,
      healthWorker: req.user._id,
      facility: targetFacilityId,
      appointment: appointmentId || null,
      chiefComplaints: Array.isArray(chiefComplaints) ? chiefComplaints : [chiefComplaints || 'Clinical Examination'],
      vitals: {
        bp: vitals?.bp || '120/80',
        pulse: parseInt(vitals?.pulse) || 72,
        temp: parseFloat(vitals?.temp) || 98.6,
        spo2: parseInt(vitals?.spo2) || 98,
        weight: parseFloat(vitals?.weight) || 68,
      },
      diagnoses: Array.isArray(diagnoses) ? diagnoses : [{ condition: diagnoses || 'Clinical Consultation', severity: 'MODERATE' }],
      clinicalNotes: clinicalNotes || 'OPD clinical examination completed.',
      aiSummary: aiSummary || `Clinical Encounter: Vitals BP ${vitals?.bp || '120/80'}, SpO2 ${vitals?.spo2 || 98}%, Pulse ${vitals?.pulse || 72} bpm.`,
      encounterDate: new Date(),
    });

    // Update or create patient MedicalRecord
    let record = await MedicalRecord.findOne({ patient: patientId });
    if (!record) {
      record = await MedicalRecord.create({ patient: patientId, encounters: [encounter._id], prescriptions: [], labReports: [] });
    } else {
      record.encounters.push(encounter._id);
      await record.save();
    }

    // Complete appointment if active
    let targetApptId = appointmentId;
    if (!targetApptId) {
      const activeAppt = await Appointment.findOne({ patient: patientId, status: { $in: ['CONFIRMED', 'IN_QUEUE', 'IN_CONSULTATION'] } });
      if (activeAppt) targetApptId = activeAppt._id;
    }

    if (targetApptId) {
      await Appointment.findByIdAndUpdate(targetApptId, { status: 'COMPLETED' });
    }

    // Advance Queue if in consultation
    const today = new Date().toISOString().split('T')[0];
    const activeQueue = await Queue.findOne({ facility: targetFacilityId, date: today });
    if (activeQueue) {
      const qItem = activeQueue.items.find((i) => i.patient?.toString() === patientId || i.appointment?.toString() === targetApptId?.toString());
      if (qItem) {
        qItem.status = 'COMPLETED';
        await activeQueue.save();
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`facility-${targetFacilityId}`).emit('queue-updated', {
        facilityId: targetFacilityId,
        currentToken: activeQueue?.currentToken,
        queueItems: activeQueue?.items,
      });
    }

    await logAudit(req, 'CREATE_ENCOUNTER', 'Encounter', encounter._id.toString(), { patientId });

    res.status(201).json(encounter);
  } catch (error) {
    next(error);
  }
});

// POST /api/records/prescriptions
router.post('/prescriptions', protect, authorize('HEALTH_WORKER', 'ADMIN'), async (req, res, next) => {
  try {
    const { patientId, facilityId, medications, notes } = req.body;

    let targetFacilityId = facilityId;
    const Facility = require('../models/Facility');
    if (!targetFacilityId || targetFacilityId === '66d1f0000000000000000001') {
      const defaultFac = await Facility.findOne({});
      targetFacilityId = defaultFac?._id;
    }

    const prescription = await Prescription.create({
      patient: patientId,
      healthWorker: req.user._id,
      facility: targetFacilityId,
      medications: medications || [],
      notes: notes || '',
      date: new Date(),
    });

    let record = await MedicalRecord.findOne({ patient: patientId });
    if (!record) {
      record = await MedicalRecord.create({ patient: patientId, prescriptions: [prescription._id], encounters: [], labReports: [] });
    } else {
      record.prescriptions.push(prescription._id);
      await record.save();
    }

    await logAudit(req, 'CREATE_PRESCRIPTION', 'Prescription', prescription._id.toString(), { patientId });

    res.status(201).json(prescription);
  } catch (error) {
    next(error);
  }
});

// POST /api/records/labs
router.post('/labs', protect, authorize('HEALTH_WORKER', 'ADMIN'), async (req, res, next) => {
  try {
    const { patientId, facilityId, testName, category, result, referenceRange, unit, status } = req.body;

    const labReport = await LabReport.create({
      patient: patientId,
      facility: facilityId,
      testName,
      category: category || 'Pathology',
      result,
      referenceRange: referenceRange || '',
      unit: unit || '',
      status: status || 'COMPLETED',
    });

    let record = await MedicalRecord.findOne({ patient: patientId });
    if (!record) {
      record = await MedicalRecord.create({ patient: patientId, labReports: [labReport._id] });
    } else {
      record.labReports.push(labReport._id);
      await record.save();
    }

    await logAudit(req, 'CREATE_LAB_REPORT', 'LabReport', labReport._id.toString(), { patientId, testName });

    res.status(201).json(labReport);
  } catch (error) {
    next(error);
  }
});

// POST /api/records/patient-entry (Allows patient to record real consultation/vitals/prescriptions/labs)
router.post('/patient-entry', protect, async (req, res, next) => {
  try {
    const patientId = req.user.role === 'PATIENT' ? req.user._id : req.body.patientId;
    const {
      facilityId,
      facilityName,
      chiefComplaints,
      vitals,
      diagnoses,
      medications,
      labTestName,
      labResult,
      clinicalNotes,
    } = req.body;

    // Resolve Facility
    let targetFacilityId = facilityId;
    if (!targetFacilityId) {
      const Facility = require('../models/Facility');
      const defaultFac = await Facility.findOne({});
      targetFacilityId = defaultFac?._id;
    }

    // 1. Create Encounter
    const encounter = await Encounter.create({
      patient: patientId,
      healthWorker: req.user._id,
      facility: targetFacilityId,
      chiefComplaints: Array.isArray(chiefComplaints) ? chiefComplaints : [chiefComplaints || 'Routine Health Consultation'],
      vitals: vitals || { bp: '120/80', pulse: 72, temp: 98.6, spo2: 98 },
      diagnoses: Array.isArray(diagnoses)
        ? diagnoses
        : [{ condition: diagnoses || 'Health Assessment', severity: 'MILD', type: 'PRIMARY' }],
      clinicalNotes: clinicalNotes || `Health record entry recorded at ${facilityName || 'Healthcare Facility'}.`,
      aiSummary: `Patient recorded clinical visit. Vitals: BP ${vitals?.bp || '120/80'}, Pulse ${vitals?.pulse || '72'} bpm. Condition: ${diagnoses?.[0]?.condition || diagnoses || 'General checkup'}.`,
      encounterDate: new Date(),
    });

    let record = await MedicalRecord.findOne({ patient: patientId });
    if (!record) {
      record = await MedicalRecord.create({
        patient: patientId,
        encounters: [encounter._id],
        prescriptions: [],
        labReports: [],
      });
    } else {
      record.encounters.push(encounter._id);
    }

    // 2. Create Prescription if provided
    if (medications && medications.length > 0) {
      const prescription = await Prescription.create({
        patient: patientId,
        healthWorker: req.user._id,
        facility: targetFacilityId,
        medications,
        notes: `Prescribed during consultation at ${facilityName || 'Clinic'}.`,
        date: new Date(),
      });
      record.prescriptions.push(prescription._id);
    }

    // 3. Create Lab Report if provided
    if (labTestName && labResult) {
      const labReport = await LabReport.create({
        patient: patientId,
        facility: targetFacilityId,
        testName: labTestName,
        category: 'Diagnostic Screen',
        result: labResult,
        status: 'COMPLETED',
        date: new Date(),
      });
      record.labReports.push(labReport._id);
    }

    await record.save();

    await logAudit(req, 'CREATE_PATIENT_RECORD_ENTRY', 'MedicalRecord', record._id.toString(), { patientId });

    res.status(201).json({
      message: 'Medical record entry successfully created',
      encounter,
      record,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
