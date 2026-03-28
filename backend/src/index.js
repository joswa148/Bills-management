import { app } from './app.js';
import { initCronJobs } from './cron.js';

const PORT = process.env.PORT || 5000;

// Initialize cron jobs
initCronJobs();

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
