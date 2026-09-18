import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Alert,
} from 'react-native';
import { loginUser, registerUser, loginWithGoogle, updateUserCity, resetPassword, sendOtp, verifyOtp, sendRegisterOtp, verifyRegisterOtp } from '../../services/api';
import MagneticButton from '../components/MagneticButton';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const LOGO_IMG = require('../../assets/logo.jpg');
const LANDING_BG = require('../../assets/landing_bg.jpg');

const TAMILNADU_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
];

export default function LandingScreen({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register'

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP Verification State for Password Reset & Registration
  const [forgotStep, setForgotStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Set Password
  const [otp, setOtp] = useState('');

  const [registerStep, setRegisterStep] = useState(1); // 1: Enter details, 2: Verify OTP
  const [regOtp, setRegOtp] = useState('');

  // District Dropdown & Focus State
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Google Auth Setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  // City Completion State
  const [requireCityCompletion, setRequireCityCompletion] = useState(false);
  const [tempGoogleUser, setTempGoogleUser] = useState(null);

  // Inject global CSS rule to strip default web browser blue outline and apply theme neon green glow
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'farmpulse-input-focus-glow';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          input, textarea, select, [role="textbox"] {
            padding-left: 10px !important;
          }
          input:focus, textarea:focus, select:focus, [role="textbox"]:focus {
            outline: none !important;
            border-color: #16A34A !important;
            box-shadow: 0 0 0 3.5px rgba(22, 163, 74, 0.25), 0 0 12px rgba(34, 197, 94, 0.35) !important;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        `;

        document.head.appendChild(style);
      }
    }
  }, []);



  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication, params } = response;
      const token = authentication?.idToken || 
                    authentication?.accessToken || 
                    params?.id_token || 
                    params?.access_token || 
                    params?.idToken || 
                    authentication?.id_token;
      if (token) {
        handleGoogleToken(token);
      } else {
        setLoading(false);
        setErrorMsg('Google Sign-In completed, but no token was received.');
      }
    } else if (response?.type === 'cancel') {
      setLoading(false);
      setErrorMsg('Google sign-in was cancelled.');
    } else if (response?.type === 'error') {
      setLoading(false);
      setErrorMsg('Google authentication failed. Please ensure http://localhost:8081 is added to Authorized JavaScript Origins in Google Cloud Console.');
    }
  }, [response]);

  const handleGoogleToken = async (idToken) => {
    setLoading(true);
    setErrorMsg(null);
    const res = await loginWithGoogle(idToken);
    setLoading(false);
    
    if (res.success && res.data?.user) {
      if (!res.data.user.city) {
        setTempGoogleUser(res.data.user);
        setRequireCityCompletion(true);
      } else {
        setSuccessMsg('Google Sign-In successful! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(res.data.user);
        }, 500);
      }
    } else {
      setErrorMsg(res.error || 'Unable to sign in with Google. Please try again.');
    }
  };

  const handleCityCompletion = async () => {
    if (!city || !city.trim()) {
      setErrorMsg('Please enter your city.');
      return;
    }
    setLoading(true);
    const res = await updateUserCity(tempGoogleUser.id, city.trim());
    setLoading(false);

    if (res.success && res.data?.user) {
      setSuccessMsg('Profile completed! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(res.data.user);
      }, 500);
    } else {
      setErrorMsg(res.error || 'Failed to update city. Please try again.');
    }
  };

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setCity('');
    setConfirmPassword('');
    setOtp('');
    setRegOtp('');
    setForgotStep(1);
    setRegisterStep(1);
  };

  const handleToggleMode = (mode) => {
    resetForm();
    setAuthMode(mode);
  };

  const validateEmail = (val) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(val);
  };

  const handleSendOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await sendOtp(email.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.data?.message || 'OTP sent successfully to your email address!');
      setForgotStep(2);
    } else {
      setErrorMsg(res.error || 'Failed to send OTP code. Please check your registered email.');
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!otp || otp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setLoading(true);
    const res = await verifyOtp(email.trim(), otp.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Email verified successfully! Please enter your new password.');
      setForgotStep(3);
    } else {
      setErrorMsg(res.error || 'Invalid or expired OTP code. Please check and try again.');
    }
  };

  const handleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await loginUser({ email: email.trim(), password });
    setLoading(false);

    if (res.success && res.data?.user) {
      setSuccessMsg('Sign in successful! Redirecting to Market Analysis...');
      setTimeout(() => {
        onLoginSuccess(res.data.user);
      }, 500);
    } else {
      setErrorMsg(res.error || 'Invalid email or password. Please try again.');
    }
  };

  const handleRegisterSendOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await sendRegisterOtp(email.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.data?.message || 'Verification code sent to your email address! Please check your inbox.');
      setRegisterStep(2);
    } else {
      setErrorMsg(res.error || 'Failed to send verification code. Please check your email.');
    }
  };

  const handleRegisterVerifyOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regOtp || regOtp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setLoading(true);
    const res = await verifyOtp(email.trim(), regOtp.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Email verified successfully! Please complete your account profile below.');
      setRegisterStep(3);
    } else {
      setErrorMsg(res.error || 'Verification failed. Invalid or expired OTP code.');
    }
  };

  const handleRegisterCreateProfile = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName || !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!city || !city.trim()) {
      setErrorMsg('Please select or enter your city.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);
    const res = await registerUser({
      full_name: fullName.trim(),
      email: email.trim(),
      city: city.trim(),
      password,
    });
    setLoading(false);

    if (res.success && res.data?.user) {
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(res.data.user);
      }, 500);
    } else {
      setErrorMsg(res.error || 'Registration failed. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    resetForm();
    setAuthMode('forgot');
  };

  const handleResetPassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your new password.');
      return;
    }

    setLoading(true);
    const res = await resetPassword({
      email: email.trim(),
      new_password: password,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Password reset successfully! Redirecting to Sign In...');
      const savedEmail = email.trim();
      setTimeout(() => {
        resetForm();
        setEmail(savedEmail);
        setAuthMode('signin');
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Password reset failed. Please check your registered email.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID' || clientId.includes('YOUR_')) {
      setLoading(false);
      setErrorMsg('Google OAuth Client ID is not configured. Please set a valid EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in mobile/.env');
      return;
    }
    
    try {
      if (!request) {
        setLoading(false);
        setErrorMsg('Google Auth request is not initialized. Please try again.');
        return;
      }
      await promptAsync();
    } catch (e) {
      setLoading(false);
      setErrorMsg('Failed to open Google Auth. Please check your configuration.');
    }
  };

  return (
    <ImageBackground source={LANDING_BG} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.backgroundOverlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.mainContainer}>

            {/* LEFT COLUMN: BRANDING & FEATURE HIGHLIGHTS */}
            <View style={styles.introColumn}>
              {/* Circular Emblem Logo */}
              <View style={styles.logoContainer}>
                <Image source={LOGO_IMG} style={styles.logoImg} resizeMode="cover" />
              </View>

              <Text style={styles.brandTitle}>FARMPULSE</Text>
              <Text style={styles.brandTagline}>Smart Agricultural Market Intelligence</Text>

              <View style={styles.leafDivider}>
                <Text style={{ fontSize: 16 }}>🌱</Text>
              </View>

              <Text style={styles.mainHeading}>
                Know Your Market.{'\n'}Choose Your Best Opportunity.
              </Text>

              <Text style={styles.introText}>
                FarmPulse helps farmers analyze market trends, compare nearby markets, estimate transportation costs and get weather insights to make better selling decisions.
              </Text>

              {/* 5 CIRCULAR FEATURE BADGES */}
              <View style={styles.featureGrid}>
                <View style={styles.featureRow}>
                  <View style={styles.featureItem}>
                    <View style={styles.featureIconCircle}>
                      <Text style={styles.featureIcon}>📊</Text>
                    </View>
                    <Text style={styles.featureLabel}>Price Prediction</Text>
                  </View>

                  <View style={styles.featureItem}>
                    <View style={styles.featureIconCircle}>
                      <Text style={styles.featureIcon}>📍</Text>
                    </View>
                    <Text style={styles.featureLabel}>Market Comparison</Text>
                  </View>

                  <View style={styles.featureItem}>
                    <View style={styles.featureIconCircle}>
                      <Text style={styles.featureIcon}>🌦️</Text>
                    </View>
                    <Text style={styles.featureLabel}>Weather Insights</Text>
                  </View>
                </View>

                <View style={styles.featureRow}>
                  <View style={styles.featureItem}>
                    <View style={styles.featureIconCircle}>
                      <Text style={styles.featureIcon}>🚚</Text>
                    </View>
                    <Text style={styles.featureLabel}>Transport Estimation</Text>
                  </View>

                  <View style={styles.featureItem}>
                    <View style={styles.featureIconCircle}>
                      <Text style={styles.featureIcon}>🌱</Text>
                    </View>
                    <Text style={styles.featureLabel}>Better Decisions</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* RIGHT COLUMN: AUTHENTICATION CARD */}
            <View style={styles.authColumn}>
              <View style={styles.authCard}>

                {/* TABS: SIGN IN vs CREATE ACCOUNT */}
                <View style={styles.tabHeader}>
                  <TouchableOpacity
                    style={[styles.tabBtn, authMode === 'signin' && styles.tabBtnActive]}
                    onPress={() => handleToggleMode('signin')}
                  >
                    <Text style={[styles.tabText, authMode === 'signin' && styles.tabTextActive]}>
                      Sign In
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tabBtn, authMode === 'register' && styles.tabBtnActive]}
                    onPress={() => handleToggleMode('register')}
                  >
                    <Text style={[styles.tabText, authMode === 'register' && styles.tabTextActive]}>
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* ALERTS */}
                {errorMsg ? (
                  <View style={styles.errorAlert}>
                    <Text style={styles.errorAlertText}>⚠️ {errorMsg}</Text>
                  </View>
                ) : null}

                {successMsg ? (
                  <View style={styles.successAlert}>
                    <Text style={styles.successAlertText}>✅ {successMsg}</Text>
                  </View>
                ) : null}

                {requireCityCompletion ? (
                  /* CITY COMPLETION FORM */
                  <View style={styles.formContent}>
                     <Text style={[styles.mainHeading, { fontSize: 18, marginBottom: 4 }]}>Welcome to FarmPulse!</Text>
                     <Text style={[styles.introText, { textAlign: 'left', marginBottom: 16 }]}>Please enter your city to complete your profile.</Text>

                     <View style={[styles.inputGroup, { zIndex: 10 }]}>
                        <Text style={styles.inputLabel}>City / Tamil Nadu District</Text>
                        <View style={[styles.inputWithIcon, focusedField === 'comp_city' && styles.inputWithIconFocused]}>
                          <Text style={styles.inputIcon}>📍</Text>
                          <TextInput
                            style={styles.inputField}
                            placeholder="Select Tamil Nadu District"
                            placeholderTextColor="#94A3B8"
                            value={city}
                            onChangeText={(text) => {
                              setCity(text);
                              setShowDistrictDropdown(true);
                            }}
                            onFocus={() => {
                              setFocusedField('comp_city');
                              setShowDistrictDropdown(true);
                            }}
                            onBlur={() => setFocusedField(null)}
                          />
                          {city ? (
                            <TouchableOpacity onPress={() => setCity('')} style={{ padding: 4 }}>
                              <Text style={{ fontSize: 12, color: '#94A3B8' }}>✕</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                        {showDistrictDropdown ? (
                          <View style={styles.districtDropdown}>
                            <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                              {TAMILNADU_DISTRICTS.filter((d) =>
                                d.toLowerCase().includes(city.toLowerCase())
                              ).map((district) => (
                                <TouchableOpacity
                                  key={district}
                                  style={styles.districtItem}
                                  onPress={() => {
                                    setCity(district);
                                    setShowDistrictDropdown(false);
                                  }}
                                >
                                  <Text style={styles.districtItemText}>📍 {district}</Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        ) : null}
                      </View>

                      <MagneticButton>
                        <TouchableOpacity
                          style={styles.submitBtn}
                          onPress={handleCityCompletion}
                          disabled={loading}
                        >
                          {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.submitBtnText}>CONTINUE TO FARMPULSE</Text>
                          )}
                        </TouchableOpacity>
                      </MagneticButton>
                  </View>
                ) : authMode === 'signin' ? (
                  /* SIGN IN FORM */
                  <View style={styles.formContent}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Email Address</Text>
                      <View style={[styles.inputWithIcon, focusedField === 'signin_email' && styles.inputWithIconFocused]}>
                        <Text style={styles.inputIcon}>✉️</Text>
                        <TextInput
                          style={styles.inputField}
                          placeholder="Enter your email"
                          placeholderTextColor="#94A3B8"
                          value={email}
                          onChangeText={setEmail}
                          onFocus={() => setFocusedField('signin_email')}
                          onBlur={() => setFocusedField(null)}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Password</Text>
                      <View style={[styles.inputWithIcon, focusedField === 'signin_pwd' && styles.inputWithIconFocused]}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput
                          style={[styles.inputField, { flex: 1 }]}
                          placeholder="Enter your password"
                          placeholderTextColor="#94A3B8"
                          value={password}
                          onChangeText={setPassword}
                          onFocus={() => setFocusedField('signin_pwd')}
                          onBlur={() => setFocusedField(null)}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                          style={styles.eyeBtn}
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Forgot Password Link */}
                    <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
                      <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Submit Button */}
                    <MagneticButton>
                      <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleSignIn}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.submitBtnText}>Sign In</Text>
                        )}
                      </TouchableOpacity>
                    </MagneticButton>

                    {/* OR DIVIDER */}
                    <View style={styles.dividerRow}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>OR</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    {/* GOOGLE SSO BUTTON */}
                    <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn}>
                      <Text style={styles.googleG}>G</Text>
                      <Text style={styles.googleBtnText}>Sign in with Google</Text>
                    </TouchableOpacity>

                    {/* SWITCH MODE FOOTER */}
                    <View style={styles.switchRow}>
                      <Text style={styles.switchText}>New to FarmPulse? </Text>
                      <TouchableOpacity onPress={() => handleToggleMode('register')}>
                        <Text style={styles.switchLink}>Create Account</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : authMode === 'forgot' ? (
                  /* FORGOT / RESET PASSWORD FORM WITH OTP VERIFICATION */
                  <View style={styles.formContent}>
                    {/* Step indicator header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#BBF7D0' }}>
                      <View style={{ backgroundColor: '#16A34A', width: 8, height: 8, borderRadius: 4, marginRight: 8 }} />
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#15803D', letterSpacing: 0.5 }}>
                        STEP {forgotStep} OF 3: {forgotStep === 1 ? 'EMAIL IDENTIFICATION' : forgotStep === 2 ? 'ENTER OTP CODE' : 'CREATE NEW PASSWORD'}
                      </Text>
                    </View>

                    {forgotStep === 1 ? (
                      /* STEP 1: ENTER EMAIL & REQUEST OTP */
                      <View>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1B4332', marginBottom: 4, letterSpacing: -0.3 }}>
                          🔑 Forgot Password
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 18, fontWeight: '500', lineHeight: 18 }}>
                          Enter your registered email address below. We will send a 6-digit OTP code to verify your account identity.
                        </Text>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Registered Email Address</Text>
                          <View style={[styles.inputWithIcon, focusedField === 'forgot_email' && styles.inputWithIconFocused]}>
                            <Text style={styles.inputIcon}>✉️</Text>
                            <TextInput
                              style={styles.inputField}
                              placeholder="Enter your registered email"
                              placeholderTextColor="#94A3B8"
                              value={email}
                              onChangeText={setEmail}
                              onFocus={() => setFocusedField('forgot_email')}
                              onBlur={() => setFocusedField(null)}
                              keyboardType="email-address"
                              autoCapitalize="none"
                            />
                          </View>
                        </View>

                        <MagneticButton>
                          <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleSendOtp}
                            disabled={loading}
                          >
                            {loading ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Text style={styles.submitBtnText}>📩 SEND OTP VERIFICATION CODE</Text>
                            )}
                          </TouchableOpacity>
                        </MagneticButton>
                      </View>
                    ) : forgotStep === 2 ? (
                      /* STEP 2: ENTER & VERIFY OTP CODE */
                      <View>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1B4332', marginBottom: 4, letterSpacing: -0.3 }}>
                          🔢 Enter Verification OTP
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 18, fontWeight: '500', lineHeight: 18 }}>
                          We sent a 6-digit verification code to <Text style={{ fontWeight: '800', color: '#0F172A' }}>{email}</Text>.
                        </Text>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>6-Digit OTP Code</Text>
                          <View style={[styles.inputWithIcon, focusedField === 'forgot_otp' && styles.inputWithIconFocused]}>
                            <Text style={styles.inputIcon}>🔑</Text>
                            <TextInput
                              style={[styles.inputField, { letterSpacing: 4, fontSize: 16, fontWeight: '800' }]}
                              placeholder="e.g. 123456"
                              placeholderTextColor="#94A3B8"
                              value={otp}
                              onChangeText={setOtp}
                              onFocus={() => setFocusedField('forgot_otp')}
                              onBlur={() => setFocusedField(null)}
                              keyboardType="number-pad"
                              maxLength={6}
                            />
                          </View>
                        </View>

                        <MagneticButton>
                          <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleVerifyOtp}
                            disabled={loading}
                          >
                            {loading ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Text style={styles.submitBtnText}>✅ VERIFY OTP CODE</Text>
                            )}
                          </TouchableOpacity>
                        </MagneticButton>

                        <TouchableOpacity
                          style={{ marginTop: 14, alignItems: 'center' }}
                          onPress={handleSendOtp}
                          disabled={loading}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284C7' }}>
                            Didn't receive code? Resend OTP
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* STEP 3: CREATE NEW PASSWORD */
                      <View>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1B4332', marginBottom: 4, letterSpacing: -0.3 }}>
                          🔒 Set New Password
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 18, fontWeight: '500', lineHeight: 18 }}>
                          Your email identity is verified! Choose a new password for <Text style={{ fontWeight: '800', color: '#0F172A' }}>{email}</Text>.
                        </Text>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>New Password</Text>
                          <View style={[styles.inputWithIcon, focusedField === 'forgot_pwd' && styles.inputWithIconFocused]}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                              style={[styles.inputField, { flex: 1 }]}
                              placeholder="Minimum 8 characters"
                              placeholderTextColor="#94A3B8"
                              value={password}
                              onChangeText={setPassword}
                              onFocus={() => setFocusedField('forgot_pwd')}
                              onBlur={() => setFocusedField(null)}
                              secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                              style={styles.eyeBtn}
                              onPress={() => setShowPassword(!showPassword)}
                            >
                              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Confirm New Password</Text>
                          <View style={[styles.inputWithIcon, focusedField === 'forgot_cpwd' && styles.inputWithIconFocused]}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                              style={styles.inputField}
                              placeholder="Re-enter new password"
                              placeholderTextColor="#94A3B8"
                              value={confirmPassword}
                              onChangeText={setConfirmPassword}
                              onFocus={() => setFocusedField('forgot_cpwd')}
                              onBlur={() => setFocusedField(null)}
                              secureTextEntry={!showPassword}
                            />
                          </View>
                        </View>

                        <MagneticButton>
                          <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleResetPassword}
                            disabled={loading}
                          >
                            {loading ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Text style={styles.submitBtnText}>🔐 RESET PASSWORD</Text>
                            )}
                          </TouchableOpacity>
                        </MagneticButton>
                      </View>
                    )}

                    <View style={styles.switchRow}>
                      <Text style={styles.switchText}>Remembered your password? </Text>
                      <TouchableOpacity onPress={() => handleToggleMode('signin')}>
                        <Text style={styles.switchLink}>Back to Sign In</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* CREATE ACCOUNT FORM: EMAIL VERIFICATION FIRST SEQUENCE */
                  <View style={styles.formContent}>
                    {/* Step indicator header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#BBF7D0' }}>
                      <View style={{ backgroundColor: '#16A34A', width: 8, height: 8, borderRadius: 4, marginRight: 8 }} />
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#15803D', letterSpacing: 0.5 }}>
                        STEP {registerStep} OF 3: {registerStep === 1 ? 'EMAIL VERIFICATION' : registerStep === 2 ? 'ENTER OTP CODE' : 'CREATE ACCOUNT PROFILE'}
                      </Text>
                    </View>

                    {registerStep === 1 ? (
                      /* STEP 1: ENTER EMAIL & SEND OTP */
                      <View>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1B4332', marginBottom: 4, letterSpacing: -0.3 }}>
                          🌱 Create Account
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 18, fontWeight: '500', lineHeight: 18 }}>
                          Enter your email address below. We will send a 6-digit OTP code to verify your email before creating your account.
                        </Text>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Email Address</Text>
                          <View style={[styles.inputWithIcon, focusedField === 'reg_email' && styles.inputWithIconFocused]}>
                            <Text style={styles.inputIcon}>✉️</Text>
                            <TextInput
                              style={styles.inputField}
                              placeholder="Enter your email address"
                              placeholderTextColor="#94A3B8"
                              value={email}
                              onChangeText={setEmail}
                              onFocus={() => setFocusedField('reg_email')}
                              onBlur={() => setFocusedField(null)}
                              keyboardType="email-address"
                              autoCapitalize="none"
                            />
                          </View>
                        </View>

                        <MagneticButton>
                          <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleRegisterSendOtp}
                            disabled={loading}
                          >
                            {loading ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Text style={styles.submitBtnText}>📩 SEND VERIFICATION CODE</Text>
                            )}
                          </TouchableOpacity>
                        </MagneticButton>
                      </View>
                    ) : registerStep === 2 ? (
                      /* STEP 2: ENTER & VERIFY OTP CODE */
                      <View>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1B4332', marginBottom: 4, letterSpacing: -0.3 }}>
                          🔢 Verify Email Address
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 18, fontWeight: '500', lineHeight: 18 }}>
                          We sent a 6-digit verification code to <Text style={{ fontWeight: '800', color: '#0F172A' }}>{email}</Text>. Please enter it below.
                        </Text>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>6-Digit OTP Verification Code</Text>
                          <View style={[styles.inputWithIcon, focusedField === 'reg_otp' && styles.inputWithIconFocused]}>
                            <Text style={styles.inputIcon}>🔑</Text>
                            <TextInput
                              style={[styles.inputField, { letterSpacing: 4, fontSize: 16, fontWeight: '800' }]}
                              placeholder="e.g. 123456"
                              placeholderTextColor="#94A3B8"
                              value={regOtp}
                              onChangeText={setRegOtp}
                              onFocus={() => setFocusedField('reg_otp')}
                              onBlur={() => setFocusedField(null)}
                              keyboardType="number-pad"
                              maxLength={6}
                            />
                          </View>
                        </View>

                        <MagneticButton>
                          <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleRegisterVerifyOtp}
                            disabled={loading}
                          >
                            {loading ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Text style={styles.submitBtnText}>✅ VERIFY OTP CODE</Text>
                            )}
                          </TouchableOpacity>
                        </MagneticButton>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
                          <TouchableOpacity onPress={handleRegisterSendOtp} disabled={loading}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284C7' }}>
                              Resend Code
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => setRegisterStep(1)} disabled={loading}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B' }}>
                              ✏️ Change Email
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      /* STEP 3: FILL ACCOUNT DETAILS (ONLY AFTER EMAIL VERIFICATION!) */
                      <View>
                        {/* Verified Email Banner Badge */}
                        <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#86EFAC', flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 14, marginRight: 6 }}>✅</Text>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: '#166534' }}>
                            Email Verified: {email}
                          </Text>
                        </View>

                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1B4332', marginBottom: 4, letterSpacing: -0.3 }}>
                          👤 Complete Profile Details
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 18, fontWeight: '500', lineHeight: 18 }}>
                          Please enter your name, location, and set a password to finalize your FarmPulse account.
                        </Text>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Full Name</Text>
                          <View style={[styles.inputWithIcon, focusedField === 'reg_name' && styles.inputWithIconFocused]}>
                            <Text style={styles.inputIcon}>👤</Text>
                            <TextInput
                              style={styles.inputField}
                              placeholder="Enter your full name"
                              placeholderTextColor="#94A3B8"
                              value={fullName}
                              onChangeText={setFullName}
                              onFocus={() => setFocusedField('reg_name')}
                              onBlur={() => setFocusedField(null)}
                            />
                          </View>
                        </View>

                        <View style={[styles.inputGroup, { zIndex: 10 }]}>
                          <Text style={styles.inputLabel}>City / Tamil Nadu District</Text>
                          <View style={[styles.inputWithIcon, focusedField === 'reg_city' && styles.inputWithIconFocused]}>
                            <Text style={styles.inputIcon}>📍</Text>
                            <TextInput
                              style={styles.inputField}
                              placeholder="Select Tamil Nadu District"
                              placeholderTextColor="#94A3B8"
                              value={city}
                              onChangeText={(text) => {
                                setCity(text);
                                setShowDistrictDropdown(true);
                              }}
                              onFocus={() => {
                                setFocusedField('reg_city');
                                setShowDistrictDropdown(true);
                              }}
                              onBlur={() => setFocusedField(null)}
                            />
                            {city ? (
                              <TouchableOpacity onPress={() => setCity('')} style={{ padding: 4 }}>
                                <Text style={{ fontSize: 12, color: '#94A3B8' }}>✕</Text>
                              </TouchableOpacity>
                            ) : null}
                          </View>

                          {/* Tamil Nadu District Dropdown List */}
                          {showDistrictDropdown ? (
                            <View style={styles.districtDropdown}>
                              <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                                {TAMILNADU_DISTRICTS.filter((d) =>
                                  d.toLowerCase().includes(city.toLowerCase())
                                ).map((district) => (
                                  <TouchableOpacity
                                    key={district}
                                    style={styles.districtItem}
                                    onPress={() => {
                                      setCity(district);
                                      setShowDistrictDropdown(false);
                                    }}
                                  >
                                    <Text style={styles.districtItemText}>📍 {district}</Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          ) : null}
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Password</Text>
                          <View style={[styles.inputWithIcon, focusedField === 'reg_pwd' && styles.inputWithIconFocused]}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                              style={[styles.inputField, { flex: 1 }]}
                              placeholder="Minimum 8 characters"
                              placeholderTextColor="#94A3B8"
                              value={password}
                              onChangeText={setPassword}
                              onFocus={() => setFocusedField('reg_pwd')}
                              onBlur={() => setFocusedField(null)}
                              secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                              style={styles.eyeBtn}
                              onPress={() => setShowPassword(!showPassword)}
                            >
                              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Confirm Password</Text>
                          <View style={[styles.inputWithIcon, focusedField === 'reg_cpwd' && styles.inputWithIconFocused]}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                              style={styles.inputField}
                              placeholder="Re-enter password"
                              placeholderTextColor="#94A3B8"
                              value={confirmPassword}
                              onChangeText={setConfirmPassword}
                              onFocus={() => setFocusedField('reg_cpwd')}
                              onBlur={() => setFocusedField(null)}
                              secureTextEntry={!showPassword}
                            />
                          </View>
                        </View>

                        <MagneticButton>
                          <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleRegisterCreateProfile}
                            disabled={loading}
                          >
                            {loading ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Text style={styles.submitBtnText}>🚀 COMPLETE REGISTRATION & SIGN IN</Text>
                            )}
                          </TouchableOpacity>
                        </MagneticButton>
                      </View>
                    )}

                    <View style={styles.switchRow}>
                      <Text style={styles.switchText}>Already have an account? </Text>
                      <TouchableOpacity onPress={() => handleToggleMode('signin')}>
                        <Text style={styles.switchLink}>Sign In</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

              </View>
            </View>

          </View>

          {/* FOOTER */}
          <Text style={styles.footerText}>© 2025 FarmPulse. All rights reserved.</Text>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  mainContainer: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introColumn: {
    flex: 1,
    minWidth: 320,
    alignItems: 'center',
    textAlign: 'center',
    position: 'sticky',
    top: 40,
    alignSelf: 'flex-start',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoImg: {
    width: 115,
    height: 115,
    borderRadius: 57.5,
  },

  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1B4332',
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D6A4F',
    marginTop: 2,
  },
  leafDivider: {
    marginVertical: 12,
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1B4332',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 14,
  },
  introText: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 420,
    marginBottom: 24,
  },
  featureGrid: {
    gap: 16,
    alignItems: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
  },
  featureItem: {
    alignItems: 'center',
    width: 90,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureIcon: {
    fontSize: 20,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 14,
  },
  authColumn: {
    flex: 1,
    minWidth: 330,
    maxWidth: 440,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    marginBottom: 24,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#2D6A4F',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2D6A4F',
    fontWeight: '900',
  },
  formContent: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputWithIconFocused: {
    borderColor: '#16A34A',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },

  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    marginLeft: 2,
  },
  inputField: {
    flex: 1,
    paddingVertical: 11,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none',
  },

  districtDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2D6A4F',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 999,
  },
  districtItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  districtItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B4332',
  },

  eyeBtn: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 4,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  submitBtn: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 11,
  },
  googleG: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA4335',
    marginRight: 8,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  switchText: {
    fontSize: 12,
    color: '#64748B',
  },
  switchLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2D6A4F',
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorAlertText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '700',
  },
  successAlert: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  successAlertText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 30,
  },
});
