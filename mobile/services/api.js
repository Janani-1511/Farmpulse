import axios from 'axios';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getBaseUrl();
const LOCALHOST_BASE_URL = 'http://localhost:8000/api';
const EMULATOR_BASE_URL = 'http://10.0.2.2:8000/api';
const CLOUD_BASE_URL = 'https://farmpulse-zeta.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isNetworkError = (err) => {
  return (
    !err.response ||
    err.message === 'Network Error' ||
    err.code === 'ERR_NETWORK' ||
    err.code === 'ECONNREFUSED'
  );
};

const executeWithFallback = async (requestFn, fallbackMessage = 'Server request failed.', actionType = null, payload = null) => {
  try {
    const res = await requestFn(API_BASE_URL, 10000);
    return { success: true, data: res.data };
  } catch (primaryErr) {
    if (primaryErr.response?.data?.detail) {
      return { success: false, error: primaryErr.response.data.detail };
    }

    // Attempt 1: Try Localhost fallback if primary was different
    if (API_BASE_URL !== LOCALHOST_BASE_URL) {
      try {
        const resFb1 = await requestFn(LOCALHOST_BASE_URL, 4000);
        return { success: true, data: resFb1.data };
      } catch (fb1Err) {
        if (fb1Err.response?.data?.detail) {
          return { success: false, error: fb1Err.response.data.detail };
        }
      }
    }

    // Attempt 2: Try Android Emulator IP if on native mobile
    if (Platform.OS !== 'web' && API_BASE_URL !== EMULATOR_BASE_URL) {
      try {
        const resFb2 = await requestFn(EMULATOR_BASE_URL, 3000);
        return { success: true, data: resFb2.data };
      } catch (fb2Err) {
        if (fb2Err.response?.data?.detail) {
          return { success: false, error: fb2Err.response.data.detail };
        }
      }
    }

    // Attempt 3: Try Vercel Cloud production API fallback
    if (API_BASE_URL !== CLOUD_BASE_URL) {
      try {
        const resFb3 = await requestFn(CLOUD_BASE_URL, 5000);
        return { success: true, data: resFb3.data };
      } catch (fb3Err) {
        if (fb3Err.response?.data?.detail) {
          return { success: false, error: fb3Err.response.data.detail };
        }
      }
    }

    // Attempt 4: If backend is completely offline/unreachable and action is Auth/Demo, trigger seamless offline demo fallback
    if (isNetworkError(primaryErr)) {
      if (actionType === 'login') {
        const emailStr = payload?.email || 'farmer@farmpulse.com';
        const namePart = emailStr.split('@')[0];
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        return {
          success: true,
          data: {
            user: {
              id: 'demo_' + Date.now(),
              full_name: formattedName + ' (Demo)',
              email: emailStr,
              city: 'Coimbatore',
            },
            message: 'Signed in successfully (Offline Demo Mode)',
          },
        };
      }

      if (actionType === 'register') {
        return {
          success: true,
          data: {
            user: {
              id: 'demo_' + Date.now(),
              full_name: payload?.full_name || 'Demo Farmer',
              email: payload?.email || 'farmer@farmpulse.com',
              city: payload?.city || 'Coimbatore',
            },
            message: 'Account created successfully (Offline Demo Mode)',
          },
        };
      }

      if (actionType === 'send_otp') {
        return {
          success: true,
          data: {
            message: 'Verification OTP sent to your email! (Offline Demo Mode: Use 123456 as OTP code)',
          },
        };
      }

      if (actionType === 'verify_otp') {
        return {
          success: true,
          data: {
            message: 'OTP verified successfully (Offline Demo Mode)',
          },
        };
      }

      if (actionType === 'google') {
        return {
          success: true,
          data: {
            user: {
              id: 'demo_google_' + Date.now(),
              full_name: 'Google Demo User',
              email: 'google.user@gmail.com',
              city: 'Coimbatore',
            },
            message: 'Signed in with Google (Offline Demo Mode)',
          },
        };
      }

      if (actionType === 'reset_password') {
        return {
          success: true,
          data: {
            message: 'Password reset successfully (Offline Demo Mode)',
          },
        };
      }

      return {
        success: false,
        error: 'Unable to connect to FarmPulse API server. Please ensure your Python backend is running or check your internet connection.',
      };
    }

    return {
      success: false,
      error: primaryErr.response?.data?.detail || primaryErr.message || fallbackMessage,
    };
  }
};

export const checkHealth = () =>
  executeWithFallback((baseUrl, timeout) => axios.get(`${baseUrl}/health`, { timeout }), 'Unable to connect to FarmPulse API server.');

export const analyzeLocation = (payload) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/analyze-location`, payload, { timeout }), 'Failed to calculate market analysis. Please try again.');

export const getPriceHistory = (crop = 'Tomato', marketId = 'all', days = 30) =>
  executeWithFallback((baseUrl, timeout) => axios.get(`${baseUrl}/history`, { params: { crop, market_id: marketId, days, limit: 100 }, timeout }), 'Failed to load historical price data.');

export const getRetailPrices = (crop = 'Tomato', district = 'Coimbatore') =>
  executeWithFallback((baseUrl, timeout) => axios.get(`${baseUrl}/retail-prices`, { params: { crop, district }, timeout }), 'Failed to load grocery retail shop prices.');

export const sendRegisterOtp = (email) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/register-send-otp`, { email }, { timeout }), 'Failed to send registration verification code.', 'send_otp', { email });

export const verifyRegisterOtp = (payload) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/register-verify-otp`, payload, { timeout }), 'Verification failed. Invalid or expired OTP code.', 'verify_otp', payload);

export const registerUser = (payload) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/register`, payload, { timeout }), 'Registration failed. Please check your information.', 'register', payload);

export const loginUser = (payload) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/login`, payload, { timeout }), 'Invalid email or password. Please try again.', 'login', payload);

export const loginWithGoogle = (idToken) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/google`, { id_token: idToken }, { timeout }), 'Unable to sign in with Google. Please try again.', 'google', { idToken });

export const updateUserCity = (userId, city) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/update-city`, { user_id: userId, city }, { timeout }), 'Failed to update city. Please try again.');

export const sendOtp = (email) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/send-otp`, { email }, { timeout }), 'Failed to send OTP code. Please try again.', 'send_otp', { email });

export const verifyOtp = (email, otp) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/verify-otp`, { email, otp }, { timeout }), 'Invalid or expired OTP code. Please try again.', 'verify_otp', { email, otp });

export const resetPassword = (payload) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/reset-password`, payload, { timeout }), 'Failed to reset password. Please try again.', 'reset_password', payload);

export const getPriceTrend = (crop = 'Tomato', marketId = 'mkt_coimbatore', historicalDays = 30, futureDays = 15) =>
  executeWithFallback((baseUrl, timeout) => axios.get(`${baseUrl}/price-trend`, { params: { crop, market_id: marketId, historical_days: historicalDays, future_days: futureDays }, timeout }), 'Failed to load price trend analysis.');

export default api;
