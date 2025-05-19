import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donations: [{
    bloodType: {
      type: String,
      required: true
    },
    units: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

export default mongoose.model('Donor', donorSchema);