// Auto-detect API URL: same origin in prod, localhost in dev
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : '';
