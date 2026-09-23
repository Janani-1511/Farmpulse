import axios from 'axios';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return 'https://farmpulse-zeta.vercel.app/api';
};

const API_BASE_URL = getBaseUrl();
const LOCALHOST_BASE_URL = 'http://localhost:8000/api';
const EMULATOR_BASE_URL = 'http://10.0.2.2:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const executeWithFallback = async (requestFn, fallbackMessage = 'Server request failed.') => {
  try {
    const res = await requestFn(API_BASE_URL, 15000);
    return { success: true, data: res.data };
  } catch (primaryErr) {
    if (primaryErr.response?.data?.detail) {
      return { success: false, error: primaryErr.response.data.detail };
    }
    
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

    if (Platform.OS !== 'web') {
      try {
        const resFb2 = await requestFn(EMULATOR_BASE_URL, 3000);
        return { success: true, data: resFb2.data };
      } catch (fb2Err) {
        if (fb2Err.response?.data?.detail) {
          return { success: false, error: fb2Err.response.data.detail };
        }
      }
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
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/register-send-otp`, { email }, { timeout }), 'Failed to send registration verification code.');

export const verifyRegisterOtp = (payload) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/register-verify-otp`, payload, { timeout }), 'Verification failed. Invalid or expired OTP code.');

export const registerUser = (payload) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/register`, payload, { timeout }), 'Registration failed. Please check your information.');

export const loginUser = (payload) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/login`, payload, { timeout }), 'Invalid email or password. Please try again.');

export const loginWithGoogle = (idToken) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/google`, { id_token: idToken }, { timeout }), 'Unable to sign in with Google. Please try again.');

export const updateUserCity = (userId, city) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/update-city`, { user_id: userId, city }, { timeout }), 'Failed to update city. Please try again.');

export const sendOtp = (email) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/send-otp`, { email }, { timeout }), 'Failed to send OTP code. Please try again.');

export const verifyOtp = (email, otp) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/verify-otp`, { email, otp }, { timeout }), 'Invalid or expired OTP code. Please try again.');

export const resetPassword = (payload) =>
  executeWithFallback((baseUrl, timeout) => axios.post(`${baseUrl}/auth/reset-password`, payload, { timeout }), 'Failed to reset password. Please try again.');

export const getPriceTrend = (crop = 'Tomato', marketId = 'mkt_coimbatore', historicalDays = 30, futureDays = 15) =>
  executeWithFallback((baseUrl, timeout) => axios.get(`${baseUrl}/price-trend`, { params: { crop, market_id: marketId, historical_days: historicalDays, future_days: futureDays }, timeout }), 'Failed to load price trend analysis.');

export default api;
