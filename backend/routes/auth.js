const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const HealthWorkerProfile = require('../models/HealthWorkerProfile');
const Facility = require('../models/Facility');
const { protect } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'swasth_super_secret_jwt_key_2026_sih', {
    expiresIn: '30d',
  });
};

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      adminLevel,
      phone,
      languagePreference,
      gender,
      dateOfBirth,
      district,
      villageOrCity,
      // Proof Verification Fields
      licenseNumber,
      proofDocumentName,
      adminAuthCode,
      specialization,
      designation,
      facilityId,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user account already exists with this email address' });
    }

    // Role-based proof validation
    if (role === 'HEALTH_WORKER') {
      if (!licenseNumber || !licenseNumber.trim()) {
        return res.status(400).json({ message: 'Medical License / Council Registration Number proof is required for Healthcare Workers' });
      }
    }

    if (role === 'ADMIN') {
      if (!adminAuthCode || !adminAuthCode.trim()) {
        return res.status(400).json({ message: 'Government / Hospital Employee Authorization Code is required for Administrators' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationStatus = role === 'PATIENT' ? 'NOT_REQUIRED' : 'VERIFIED'; // Verified for registration demo

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'PATIENT',
      adminLevel: adminLevel || 'HOSPITAL',
      phone,
      languagePreference: languagePreference || 'en',
      licenseNumber: licenseNumber || '',
      proofDocumentUrl: proofDocumentName ? `uploads/proofs/${proofDocumentName}` : '',
      adminAuthCode: adminAuthCode || '',
      verificationStatus,
    });

    // Create appropriate role profile
    if (user.role === 'PATIENT') {
      await PatientProfile.create({
        user: user._id,
        gender: gender || 'MALE',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1995-01-01'),
        address: {
          villageOrCity: villageOrCity || 'Village',
          district: district || 'Satara',
          state: 'Maharashtra',
        },
      });
    } else if (user.role === 'HEALTH_WORKER') {
      // Assign to Shirwal PHC or provided facility
      const defaultFacility = facilityId || '66d1f0000000000000000001';
      await HealthWorkerProfile.create({
        user: user._id,
        facility: defaultFacility,
        designation: designation || 'Medical Officer',
        specialization: specialization || 'General Medicine',
        licenseNumber: licenseNumber || 'MMC/REG/VERIFIED',
      });
    }

    await logAudit(req, 'REGISTER_NEW_ACCOUNT', 'User', user._id.toString(), {
      email: user.email,
      role: user.role,
      licenseNumber: user.licenseNumber,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        adminLevel: user.adminLevel,
        languagePreference: user.languagePreference,
        verificationStatus: user.verificationStatus,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    await logAudit(req, 'LOGIN', 'User', user._id.toString(), { email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        adminLevel: user.adminLevel,
        languagePreference: user.languagePreference,
        verificationStatus: user.verificationStatus,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    let profile = null;
    if (req.user.role === 'PATIENT') {
      profile = await PatientProfile.findOne({ user: req.user._id }).populate('primaryFacility');
    } else if (req.user.role === 'HEALTH_WORKER') {
      profile = await HealthWorkerProfile.findOne({ user: req.user._id }).populate('facility');
    }

    res.json({
      user: req.user,
      profile,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/auth/profile
router.patch('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, languagePreference } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (languagePreference) req.user.languagePreference = languagePreference;

    await req.user.save();
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
