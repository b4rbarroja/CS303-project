
const MY_IP_ADDRESS = '192.168.1.25'; // Ensure this matches the IP in axios.js

const ENV = {
  dev: {
    apiUrl: `http://${MY_IP_ADDRESS}:5000`,
    timeout: 15000,
  },
  staging: {
    apiUrl: 'https://staging-api.scilibrary.com',
    timeout: 15000,
  },
  prod: {
    apiUrl: 'https://scilibrary-production.up.railway.app',
    timeout: 15000,
  },
};

// Determine current environment
const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

const config = getEnvVars();

// Add network debugging
console.log('[Network Config]', {
  baseURL: config.apiUrl,
  timeout: config.timeout,
});

export default config;
