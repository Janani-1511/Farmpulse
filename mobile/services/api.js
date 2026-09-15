import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const LOCALHOST_BASE_URL = 'http://localhost:8000/api';
const EMULATOR_BASE_URL = 'http://10.0.2.2:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    try {
      const fallbackResponse = await axios.get(`${EMULATOR_BASE_URL}/health`, { timeout: 5000 });
      return { success: true, data: fallbackResponse.data };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.message || 'Unable to connect to FarmPulse API server.',
      };
    }
  }
};

export const analyzeLocation = async (payload) => {
  try {
    const response = await api.post('/analyze-location', payload);
    return { success: true, data: response.data };
  } catch (error) {
    try {
      const fb1 = await axios.post(`${LOCALHOST_BASE_URL}/analyze-location`, payload, { timeout: 10000 });
      return { success: true, data: fb1.data };
    } catch (fb1Err) {
      try {
        const fb2 = await axios.post(`${EMULATOR_BASE_URL}/analyze-location`, payload, { timeout: 10000 });
        return { success: true, data: fb2.data };
      } catch (fb2Err) {
        return {
          success: false,
          error: error.response?.data?.detail || error.message || 'Failed to calculate market analysis. Please try again.',
        };
      }
    }
  }
};

export const getPriceHistory = async (crop = 'Tomato', marketId = 'all', days = 30) => {
  try {
    const response = await api.get('/history', {
      params: { crop, market_id: marketId, days, limit: 100 },
    });
    return { success: true, data: response.data };
  } catch (error) {
    try {
      const fallbackResponse = await axios.get(`${EMULATOR_BASE_URL}/history`, {
        params: { crop, market_id: marketId, days, limit: 100 },
      });
      return { success: true, data: fallbackResponse.data };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.message || 'Failed to load historical price data.',
      };
    }
  }
};

export const getRetailPrices = async (crop = 'Tomato', district = 'Coimbatore') => {
  try {
    const response = await api.get('/retail-prices', {
      params: { crop, district },
    });
    return { success: true, data: response.data };
  } catch (error) {
    try {
      const fallbackResponse = await axios.get(`${EMULATOR_BASE_URL}/retail-prices`, {
        params: { crop, district },
      });
      return { success: true, data: fallbackResponse.data };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.message || 'Failed to load grocery retail shop prices.',
      };
    }
  }
};

export const registerUser = async (payload) => {
  try {
    const response = await api.post('/auth/register', payload);
    return { success: true, data: response.data };
  } catch (error) {
    try {
      const fallbackResponse = await axios.post(`${EMULATOR_BASE_URL}/auth/register`, payload, { timeout: 10000 });
      return { success: true, data: fallbackResponse.data };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Registration failed. Please check your information.',
      };
    }
  }
};

export const loginUser = async (payload) => {
  try {
    const response = await api.post('/auth/login', payload);
    return { success: true, data: response.data };
  } catch (error) {
    try {
      const fallbackResponse = await axios.post(`${EMULATOR_BASE_URL}/auth/login`, payload, { timeout: 10000 });
      return { success: true, data: fallbackResponse.data };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Invalid email or password. Please try again.',
      };
    }
  }
};

export const loginWithGoogle = async (idToken) => {
  try {
    const response = await api.post('/auth/google', { id_token: idToken });
    return { success: true, data: response.data };
  } catch (error) {
    try {
      const fallbackResponse = await axios.post(`${EMULATOR_BASE_URL}/auth/google`, { id_token: idToken }, { timeout: 10000 });
      return { success: true, data: fallbackResponse.data };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Unable to sign in with Google. Please try again.',
      };
    }
  }
};

export const updateUserCity = async (userId, city) => {
  try {
    const response = await api.post('/auth/update-city', { user_id: userId, city });
    return { success: true, data: response.data };
  } catch (error) {
    try {
      const fallbackResponse = await axios.post(`${EMULATOR_BASE_URL}/auth/update-city`, { user_id: userId, city }, { timeout: 10000 });
      return { success: true, data: fallbackResponse.data };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to update city. Please try again.',
      };
    }
  }
};

export const getPriceTrend = async (crop = 'Tomato', marketId = 'mkt_coimbatore', historicalDays = 30, futureDays = 15) => {
  try {
    const response = await api.get('/price-trend', {
      params: { crop, market_id: marketId, historical_days: historicalDays, future_days: futureDays },
    });
    return { success: true, data: response.data };
  } catch (error) {
    try {
      const fallbackResponse = await axios.get(`${EMULATOR_BASE_URL}/price-trend`, {
        params: { crop, market_id: marketId, historical_days: historicalDays, future_days: futureDays },
      });
      return { success: true, data: fallbackResponse.data };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to load price trend analysis.',
      };
    }
  }
};

export default api;

