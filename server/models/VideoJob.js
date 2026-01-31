const mongoose = require('mongoose');

const VideoJobSchema = new mongoose.Schema(
  {
    videoUrl: {
      type: String,
      required: false,
      trim: true,
    },
    clientRequestId: {
      type: String,
      required: false,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
    },
    targetLanguage: {
      type: String,
      required: [true, 'Target language is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },

    // Raw transcript with timing (from YouTube API)
    transcript: [
      {
        text: String,
        start: Number,
        duration: Number,
      },
    ],

    // What you send to OpenAI (the numbered strings: ["1. text", "2. text"])
    indexedLines: {
      type: [String],
      default: [],
    },

    // Translated output aligned to indexedLines order (["1. हैलो", "2. स्वागत है"])
    translatedLines: {
      type: [String],
      default: [],
    },

    // Translated transcript with timing (for TTS generation)
    translatedTranscript: [
      {
        text: String,           // Translated text
        start: Number,          // From original transcript
        duration: Number,       // From original transcript
        originalText: String,   // Original English text (for reference)
      },
    ],

    error: {
      type: String,
      default: null,
    },

    openai: {
      model: String,
      attempts: Number,
      lastError: String,
    },

    metadata: {
      title: String,
      thumbnail: String,
      duration: String,
    },
  },
  { timestamps: true }
);

// Indexes for performance
VideoJobSchema.index({ status: 1 });
VideoJobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VideoJob', VideoJobSchema);