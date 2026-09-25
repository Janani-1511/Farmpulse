import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import MagneticButton from '../components/MagneticButton';

const LOGO_IMG = require('../../assets/logo.jpg');
const LANDING_BG = require('../../assets/landing_bg.jpg');

export default function LandingScreen({ onLoginSuccess }) {
  const handleTryAnalysis = () => {
    if (onLoginSuccess) {
      onLoginSuccess({
        full_name: 'Farmer',
        email: 'farmer@farmpulse.com',
        city: 'Coimbatore',
      });
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

            {/* RIGHT COLUMN: TRY ANALYSIS CTA CARD */}
            <View style={styles.authColumn}>
              <View style={styles.authCard}>
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <View style={styles.tryBadge}>
                    <Text style={styles.tryBadgeText}>⚡ INSTANT ACCESS</Text>
                  </View>

                  <Text style={styles.tryTitle}>Explore Market Intelligence</Text>
                  
                  <Text style={styles.tryDescription}>
                    Get real-time price predictions, compare nearby agricultural mandis, calculate net transport revenue, and access weather insights instantly.
                  </Text>

                  <View style={styles.tryFeatureList}>
                    <View style={styles.tryFeatureRow}>
                      <Text style={styles.tryFeatureIcon}>✅</Text>
                      <Text style={styles.tryFeatureText}>AI-Powered Price Forecasting</Text>
                    </View>
                    <View style={styles.tryFeatureRow}>
                      <Text style={styles.tryFeatureIcon}>✅</Text>
                      <Text style={styles.tryFeatureText}>Live Mandi Distance & Net Profit</Text>
                    </View>
                    <View style={styles.tryFeatureRow}>
                      <Text style={styles.tryFeatureIcon}>✅</Text>
                      <Text style={styles.tryFeatureText}>District Grocery Retail Comparison</Text>
                    </View>
                    <View style={styles.tryFeatureRow}>
                      <Text style={styles.tryFeatureIcon}>✅</Text>
                      <Text style={styles.tryFeatureText}>No Account or Registration Required</Text>
                    </View>
                  </View>

                  {/* Main Try Analysis CTA Button */}
                  <MagneticButton style={{ width: '100%', marginTop: 20 }}>
                    <TouchableOpacity
                      style={styles.tryAnalysisBtn}
                      onPress={handleTryAnalysis}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.tryAnalysisBtnText}>🚀 Try Analysis</Text>
                    </TouchableOpacity>
                  </MagneticButton>

                  <Text style={styles.tryFooterNote}>
                    Free & Open Access for All Farmers and Agricultural Traders
                  </Text>
                </View>
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
    width: '100%',
    maxWidth: 420,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  featureItem: {
    alignItems: 'center',
    width: 90,
  },
  featureIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureIcon: {
    fontSize: 22,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 14,
  },

  /* CTA CARD STYLES */
  authColumn: {
    flex: 1,
    minWidth: 320,
    maxWidth: 450,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
  },
  tryBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: 16,
  },
  tryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  tryTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1B4332',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tryDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  tryFeatureList: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tryFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tryFeatureIcon: {
    fontSize: 14,
  },
  tryFeatureText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  tryAnalysisBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  tryAnalysisBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tryFooterNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#475569',
    marginTop: 30,
    fontWeight: '500',
  },
});
