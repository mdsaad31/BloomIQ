const cron = require('node-cron');
const axios = require('axios');

// Configuration
const BACKEND_URL = 'https://bloomiq.onrender.com';
const PING_INTERVAL = '*/10 * * * *'; // Every 10 minutes

// Color codes for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Ping function
async function pingBackend() {
  const timestamp = new Date().toISOString();
  console.log(`\n${colors.blue}[${timestamp}] 🔄 Pinging backend...${colors.reset}`);

  try {
    // Ping health endpoint
    const healthResponse = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 30000 // 30 seconds timeout
    });

    if (healthResponse.status === 200) {
      console.log(`${colors.green}✅ Health check passed!${colors.reset}`);
      console.log(`${colors.green}   Status: ${healthResponse.data.status}${colors.reset}`);
      console.log(`${colors.green}   MongoDB: ${healthResponse.data.mongodb}${colors.reset}`);
      console.log(`${colors.green}   Uptime: ${Math.floor(healthResponse.data.uptime)} seconds${colors.reset}`);
    }

    // Ping root endpoint
    const rootResponse = await axios.get(`${BACKEND_URL}/`);
    console.log(`${colors.green}✅ Root endpoint check passed!${colors.reset}`);

    return true;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log(`${colors.yellow}⚠️  Request timeout (backend might be waking up)${colors.reset}`);
    } else if (error.response) {
      console.log(`${colors.red}❌ Backend returned error: ${error.response.status}${colors.reset}`);
    } else if (error.request) {
      console.log(`${colors.red}❌ No response from backend${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    }
    return false;
  }
}

// Start cron job
console.log(`${colors.blue}🚀 BloomIQ Backend Keep-Alive Service${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
console.log(`${colors.blue}Backend URL: ${BACKEND_URL}${colors.reset}`);
console.log(`${colors.blue}Interval: Every 10 minutes${colors.reset}`);
console.log(`${colors.blue}Started at: ${new Date().toISOString()}${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}\n`);

// Run immediately on start
pingBackend();

// Schedule recurring pings
cron.schedule(PING_INTERVAL, () => {
  pingBackend();
});

// Keep process running
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}👋 Shutting down keep-alive service...${colors.reset}`);
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(`${colors.red}❌ Uncaught Exception: ${error.message}${colors.reset}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`${colors.red}❌ Unhandled Rejection at:${colors.reset}`, promise);
  console.error(`${colors.red}   Reason:${colors.reset}`, reason);
});
