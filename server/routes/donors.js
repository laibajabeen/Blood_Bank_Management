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

// Update a donation by donationId (expects userId and donationId in body)
router.put('/donate', async (req, res) => {
  try {
    const { userId, donationId, name, cnic, bloodType, units } = req.body;

    if (!userId || !donationId) {
      return res.status(400).json({ message: 'Missing userId or donationId' });
    }

    const donor = await Donor.findOne({ userId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const donation = donor.donations.id(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Update fields
    if (name) donation.name = name;
    if (cnic) donation.cnic = cnic;
    if (bloodType) donation.bloodType = bloodType;
    if (units) donation.units = units;

    await donor.save();
    res.json({ message: 'Donation updated', donation });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});



router.delete('/donate/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;

    // Find donor with donation in the array
    const donor = await Donor.findOne({ "donations._id": donationId });
    if (!donor) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Remove the donation by filtering it out
    donor.donations = donor.donations.filter(
      (donation) => donation._id.toString() !== donationId
    );

    await donor.save();
    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Delete Donation Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
