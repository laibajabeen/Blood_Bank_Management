import express from 'express';
import Donor from '../models/Donor.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all donors (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const donors = await Donor.find().populate('userId', 'email');
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donor's donations
router.get('/my-donations', auth, async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.json(donor.donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new donation
router.post('/donate', auth, async (req, res) => {
  try {
    const { bloodType, units } = req.body;
    let donor = await Donor.findOne({ userId: req.user.userId });

    if (!donor) {
      donor = new Donor({
        userId: req.user.userId,
        donations: []
      });
    }

    donor.donations.push({ bloodType, units });
    await donor.save();

    res.status(201).json(donor.donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;