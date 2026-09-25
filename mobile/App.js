import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { checkHealth, analyzeLocation } from './services/api';
import Navbar from './app/components/Navbar';
import StepProgressIndicator from './app/components/StepProgressIndicator';
import CropSelector from './app/components/CropSelector';
import QuantityInput from './app/components/QuantityInput';
import DateSelector from './app/components/DateSelector';
import LocationSelector from './app/components/LocationSelector';
import RecommendationCard from './app/components/RecommendationCard';
import PriceInsightCard from './app/components/PriceInsightCard';
import MarketComparisonTable from './app/components/MarketComparisonTable';
import WeatherForecast from './app/components/WeatherForecast';
import SkeletonLoader from './app/components/SkeletonLoader';
import MarketDetailModal from './app/components/MarketDetailModal';
import PriceHistoryScreen from './app/screens/PriceHistoryScreen';
import RetailPricesScreen from './app/screens/RetailPricesScreen';
import MarketsDirectoryScreen from './app/screens/MarketsDirectoryScreen';
import LandingScreen from './app/screens/LandingScreen';
import PriceTrendScreen from './app/screens/PriceTrendScreen';


// Desktop Interaction Enhancements
import ScrollProgress from './app/components/ScrollProgress';
import MagneticButton from './app/components/MagneticButton';
import InteractiveCard from './app/components/InteractiveCard';



// Local Static Asset Images
const HERO_BANNER = require('./assets/hero_banner.png');
const MARKET_BANNER = require('./assets/market.png');
const LOGO = require('./assets/logo.jpg');

export default function App() {
  const scrollViewRef = useRef(null);

  // Authentication State (Always defaults to null so the app opens on the Sign-In screen)
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  // Inject global CSS rules for viewport reset, focus ring, and box-sizing
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Ensure viewport meta tag is properly set
      let meta = document.querySelector("meta[name='viewport']");
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        document.head.appendChild(meta);
      }
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';

      const styleId = 'farmpulse-theme-focus-ring';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          html, body, #root {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
            box-sizing: border-box !important;
          }
          *, *:before, *:after {
            box-sizing: border-box !important;
          }
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

      // Dynamically set browser tab favicon to FarmPulse logo
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.type = 'image/jpeg';
      link.href = LOGO;
    }
  }, []);

  // Website Multi-Page Navigation State ('home' | 'trend' | 'history' | 'retail' | 'markets' | 'profile')
  const [activePage, setActivePage] = useState('home');
  const [trendParams, setTrendParams] = useState(null);

  const handleNavigate = (page, params = null) => {
    if (params) {
      setTrendParams(params);
    }
    setActivePage(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getTodayFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form State
  const [crop, setCrop] = useState('Tomato');
  const [quantity, setQuantity] = useState(20);
  const [targetDate, setTargetDate] = useState(getTodayFormatted);
  const [location, setLocation] = useState({
    name: 'Coimbatore, Tamil Nadu',
    latitude: 11.0168,
    longitude: 76.9558,
    isGps: false,
  });


  // Search Radius State (Default 100 km)
  const [searchRadius, setSearchRadius] = useState(100.0);

  // Health & UI State
  const [healthStatus, setHealthStatus] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  // Analysis Result State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedMarketModal, setSelectedMarketModal] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchHealth = async () => {
    setHealthLoading(true);
    const res = await checkHealth();
    if (res.success) {
      setHealthStatus(res.data);
    }
    setHealthLoading(false);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRunAnalysis = async (customRadius = null) => {
    if (!crop) {
      Alert.alert('Selection Error', 'Please select a crop to proceed.');
      return;
    }
    if (!quantity || quantity <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid crop quantity greater than zero.');
      return;
    }
    if (!location || !location.latitude || !location.longitude) {
      Alert.alert('Location Error', 'Please select your location using GPS or manually.');
      return;
    }

    const radiusToUse = typeof customRadius === 'number' ? customRadius : searchRadius;
    if (typeof customRadius === 'number' && customRadius !== searchRadius) {
      setSearchRadius(customRadius);
    }

    setAnalyzing(true);
    setErrorMsg(null);

    const payload = {
      crop,
      quantity: Number(quantity),
      latitude: location.latitude,
      longitude: location.longitude,
      target_date: targetDate,
      search_radius: radiusToUse,
      location_name: location.name,
    };

    const res = await analyzeLocation(payload);
    setAnalyzing(false);

    if (res.success) {
      setAnalysisResult(res.data);
      // Smoothly scroll to the top of the Results screen
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }, 100);
    } else {
      setErrorMsg(res.error || 'Unable to retrieve market data right now. Please check your connection and try again.');
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ScrollProgress />
        <LandingScreen onLoginSuccess={handleLoginSuccess} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Scroll Depth Progress Indicator */}
      <ScrollProgress />

      {/* Modern Website Header Navbar */}
      <Navbar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
        onBack={() => setCurrentUser(null)}
      />


      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainWrapper}>

          {/* PAGE 1: HOME / MARKET INTELLIGENCE & DECISION ENGINE */}
          {activePage === 'home' ? (
            <View>
              {/* Agricultural Hero Banner */}
              <View style={styles.heroContainer}>
                <Image source={HERO_BANNER} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.heroOverlay}>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>CORE GPS MARKET INTELLIGENCE</Text>
                  </View>
                  <Text style={styles.title}>FarmPulse</Text>
                  <Text style={styles.tagline}>Predict. Analyze. Decide.</Text>
                  <Text style={styles.subtitle}>
                    GPS-Enabled Agricultural Price Prediction & Location-Based Decision Support System
                  </Text>

                  {/* Quick Action Navigation Links */}
                  <View style={styles.heroActionRow}>
                    <TouchableOpacity
                      style={styles.heroLinkBtn}
                      onPress={() => setActivePage('history')}
                    >
                      <Text style={styles.heroLinkBtnText}>📊 Past Price Records →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.heroLinkBtnSecondary}
                      onPress={() => setActivePage('retail')}
                    >
                      <Text style={styles.heroLinkBtnTextSecondary}>🛒 Grocery Shop Prices →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {analyzing ? (
                /* POLISHED SHIMMER SKELETON LOADER */
                <SkeletonLoader />
              ) : !analysisResult ? (
                /* INPUT PARAMETERS FORM */
                <View style={styles.card}>
                  {/* Step Progress Tracker */}
                  <StepProgressIndicator
                    crop={crop}
                    quantity={quantity}
                    location={location}
                    targetDate={targetDate}
                  />

                  <Text style={styles.cardHeader}>MARKET INTELLIGENCE ANALYSIS</Text>

                  {/* 1. Crop Selector */}
                  <CropSelector selectedCrop={crop} onSelectCrop={setCrop} />

                  {/* 2. Quantity Input */}
                  <QuantityInput quantity={quantity} onChangeQuantity={setQuantity} />

                  {/* 3. Visual Calendar Future Selling Date Selector */}
                  <DateSelector targetDate={targetDate} onChangeDate={setTargetDate} />

                  {/* 4. Full Street Address GPS / Manual Location Selector */}
                  <LocationSelector
                    currentLocation={location}
                    onLocationChange={setLocation}
                    searchRadius={searchRadius}
                    onSearchRadiusChange={setSearchRadius}
                  />

                  {/* Contextual Error Message with Retry */}
                  {errorMsg ? (
                    <View style={styles.errorCard}>
                      <Text style={styles.errorCardTitle}>⚠️ Analysis Request Failed</Text>
                      <Text style={styles.errorCardBody}>{errorMsg}</Text>
                      <MagneticButton>
                        <TouchableOpacity style={styles.retryBtn} onPress={handleRunAnalysis}>
                          <Text style={styles.retryBtnText}>🔄 Retry Market Analysis</Text>
                        </TouchableOpacity>
                      </MagneticButton>
                    </View>
                  ) : null}

                  {/* Magnetic Submit Action Button */}
                  <MagneticButton>
                    <TouchableOpacity
                      style={styles.submitBtn}
                      onPress={handleRunAnalysis}
                      disabled={analyzing}
                    >
                      <Text style={styles.submitBtnText}>ANALYZE MARKET PRICES & NET REVENUE</Text>
                    </TouchableOpacity>
                  </MagneticButton>
                </View>
              ) : (
                /* RESULTS VIEW IN EXACT ORDER:
                   1. Analysis Summary
                   2. Nearby Market Comparison Table
                   3. Weather Forecast & Weather Impact
                   4. Price Trend Insights
                   5. Smart Recommendation
                */
                <View>
                  {/* 1. Analysis Summary Header */}
                  <InteractiveCard>
                    <View style={styles.summaryCard}>
                      <View style={styles.summaryTopRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.summaryTitle}>ANALYSIS PARAMETERS</Text>
                          <Text style={styles.summaryCrop}>
                            {analysisResult.crop} ({analysisResult.quantity} Quintals)
                          </Text>
                          <Text style={styles.summarySub}>Target Selling Date: {analysisResult.target_date}</Text>
                          <Text style={styles.summarySub}>Location: {analysisResult.location?.name}</Text>
                        </View>
                        <Image source={MARKET_BANNER} style={styles.summaryImage} />
                      </View>

                      <TouchableOpacity style={styles.editBtn} onPress={handleReset}>
                        <Text style={styles.editBtnText}>✏️ Edit Parameters / Select New Crop</Text>
                      </TouchableOpacity>
                    </View>
                  </InteractiveCard>

                  {/* 2. Nearby Market Comparison Table (with Weather Risk column) */}
                  <MarketComparisonTable
                    markets={analysisResult.markets}
                    bestMarketId={analysisResult.best_market?.id}
                    onSelectMarketRow={(mkt) => setSelectedMarketModal(mkt)}
                  />

                  {/* 3. Weather Forecast and Weather Impact */}
                  <InteractiveCard>
                    <WeatherForecast
                      weather={analysisResult.weather}
                      recommendedMarketName={analysisResult.best_market?.market_name}
                      targetDate={analysisResult.target_date}
                    />
                  </InteractiveCard>

                  {/* 4. Price Trend & Market Risk Information */}
                  <InteractiveCard>
                    <PriceInsightCard
                      crop={analysisResult.crop}
                      targetDate={analysisResult.target_date}
                      bestMarket={analysisResult.best_market}
                    />
                  </InteractiveCard>

                  {/* 5. Smart Decision Engine Recommendation */}
                  <InteractiveCard>
                    <RecommendationCard
                      bestMarket={analysisResult.best_market}
                      recommendation={analysisResult.recommendation}
                      currentRadius={searchRadius}
                      onExpandRadius={(newRadius) => handleRunAnalysis(newRadius)}
                    />
                  </InteractiveCard>

                  {/* Notice & Disclaimer Box */}
                  <View style={styles.disclaimerBox}>
                    <Text style={styles.disclaimerTitle}>Notice & Disclaimer:</Text>
                    <Text style={styles.disclaimerBody}>{analysisResult.disclaimer}</Text>
                  </View>

                  {/* Perform New Analysis Button */}
                  <MagneticButton>
                    <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                      <Text style={styles.resetBtnText}>🔄 Perform New Analysis</Text>
                    </TouchableOpacity>
                  </MagneticButton>
                </View>
              )}


            </View>
          ) : activePage === 'trend' ? (
            /* PAGE 2: PRICE TREND ANALYSIS (HISTORICAL REAL DATA + ML PREDICTIONS) */
            <PriceTrendScreen
              initialCrop={trendParams?.crop || crop}
              initialMarketId={trendParams?.marketId || 'mkt_coimbatore'}
              onNavigate={handleNavigate}
            />
          ) : activePage === 'history' ? (
            /* PAGE 2: PAST RECORDS OF PRICES OF THE CROPS */
            <PriceHistoryScreen />
          ) : activePage === 'retail' ? (
            /* PAGE 3: GROCERY SHOP RETAIL CROP PRICES */
            <RetailPricesScreen />
          ) : (
            /* PAGE 4: REGIONAL AGRICULTURAL MARKETS NETWORK */
            <MarketsDirectoryScreen />
          )}


        </View>

        {/* Detailed Market Modal Popup */}
        <MarketDetailModal
          visible={!!selectedMarketModal}
          market={selectedMarketModal}
          crop={crop}
          quantity={quantity}
          onClose={() => setSelectedMarketModal(null)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 40,
    width: '100%',
  },
  mainWrapper: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    padding: 12,
    overflow: 'hidden',
  },
  heroContainer: {
    minHeight: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    backgroundColor: '#15803D',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.35,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  badgeContainer: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 6,
  },
  badgeText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '800',
    color: '#86EFAC',
    marginTop: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#F0FDF4',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroLinkBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heroLinkBtnText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
  },
  heroLinkBtnSecondary: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heroLinkBtnTextSecondary: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    width: '100%',
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  errorCardTitle: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  errorCardBody: {
    color: '#7F1D1D',
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryCrop: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  summarySub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  summaryImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginLeft: 12,
  },
  editBtn: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  editBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  disclaimerBox: {
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  disclaimerTitle: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  disclaimerBody: {
    color: '#78350F',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  resetBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  retryBtn: {
    marginTop: 10,
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
