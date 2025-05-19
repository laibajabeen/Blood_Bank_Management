import express from 'express';
import Hospital from '../models/Hospital.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all hospitals (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const hospitals = await Hospital.find().populate('userId', 'email');
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hospital's requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json(hospital.requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new blood request
router.post('/request', auth, async (req, res) => {
  try {
    const { bloodType, units } = req.body;
    let hospital = await Hospital.findOne({ userId: req.user.userId });

    if (!hospital) {
      hospital = new Hospital({
        userId: req.user.userId,
        requests: []
      });
    }

    hospital.requests.push({ bloodType, units });
    await hospital.save();

    res.status(201).json(hospital.requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;