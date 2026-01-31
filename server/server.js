require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const transcribeRoutes = require('./routes/transcribe');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api', require('./routes/index'));
app.use('/api/video', require('./routes/videoRoutes'));
app.use('/api', transcribeRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EduBridge-AI Server is running',
    documentation: '/api',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server only after DB connects (prevents mongoose buffering timeouts)
const start = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// const API_KEY = "sk_eHNgFhnJWYEU-iJB9w885saJ9k71CskiEMglRHa11vY";
// const VIDEO_URL = 'https://www.youtube.com/watch?v=U4QhCYlyIqE';

// async function fetchTranscript() {
//   try {
//     const url = `https://transcriptapi.com/api/v2/youtube/transcript?video_url=${encodeURIComponent(VIDEO_URL)}`;

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${API_KEY}`
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
//     console.log('Full API Response:\n', data);

//     if (Array.isArray(data.transcript)) {
//       const text = data.transcript.map(item => item.text).join(' ');
//       console.log('\nTranscript:\n', text);
//     } else if (typeof data.transcript === 'string') {
//       console.log('\nTranscript:\n', data.transcript);
//     } else {
//       console.log('Unexpected transcript format.');
//     }

//   } catch (err) {
//     console.error('Failed to fetch transcript:', err.message);
//   }
// }

// fetchTranscript();
