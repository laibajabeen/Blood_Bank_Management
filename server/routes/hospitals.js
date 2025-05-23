import express from 'express';
import Hospital from '../models/Hospital.js';

const router = express.Router();

// Get all hospitals (now public, no admin check)
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find().populate('userId', 'email');
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hospital's requests — now expects userId as query parameter
router.get('/my-requests', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId query parameter required' });
    }

    const hospital = await Hospital.findOne({ userId });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json(hospital.requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new blood request — now expects userId in request body
router.post('/request', async (req, res) => {
  try {
    const { userId, bloodType, units } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    let hospital = await Hospital.findOne({ userId });

    if (!hospital) {
      hospital = new Hospital({
        userId,
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
