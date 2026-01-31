const mongoose = require('mongoose');

const VideoJobSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: [true, 'YouTube URL is required'],
    trim: true
  },
  targetLanguage: {
    type: String,
    required: [true, 'Target language is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  transcript: [{
    text: String,
    start: Number,
    duration: Number
  }],
  error: {
    type: String,
    default: null
  },
  metadata: {
    title: String,
    thumbnail: String,
    duration: String
  }
}, {
  timestamps: true
});

// Indexes for performance
VideoJobSchema.index({ status: 1 });
VideoJobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VideoJob', VideoJobSchema);