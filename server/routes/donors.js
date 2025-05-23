import express from 'express';
import Donor from '../models/Donor.js';

const router = express.Router();

// Get all donors (no admin check, public now)
router.get('/', async (req, res) => {
  try {
    const donors = await Donor.find().populate('userId', 'email');
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donor's donations — now expects userId in query parameters
router.get('/my-donations', async (req, res) => {
  try {
    const { userId } = req.query;  // get userId from query string
    if (!userId) {
      return res.status(400).json({ message: 'userId query parameter required' });
    }

    const donor = await Donor.findOne({ userId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.json(donor.donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new donation — now expects userId in body instead of req.user
router.post('/donate', async (req, res) => {
  try {
    const { userId, name, cnic, bloodType, units } = req.body;

    if (!userId || !name || !cnic || !bloodType || !units) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let donor = await Donor.findOne({ userId });

    if (!donor) {
      donor = new Donor({
        userId,
        donations: []
      });
    }

    donor.donations.push({ name, cnic, bloodType, units });
    await donor.save();

    res.status(201).json(donor.donations);
  } catch (error) {
    console.error("Donation Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
