import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requests: [{
    bloodType: {
      type: String,
      required: true
    },
    units: {
      type: Number,
      required: true
    }
  }]
});

export default mongoose.model('Hospital', hospitalSchema);