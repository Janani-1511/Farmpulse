import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

const LOGO = require('../../assets/logo.jpg');

export default function Navbar({ activePage, onNavigate, onBack }) {
  return (
    <View style={styles.navbar}>
      <View style={styles.navContainer}>
        {/* Brand Logo & Title */}
        <TouchableOpacity
          style={styles.brandRow}
          onPress={() => onNavigate('home')}
          activeOpacity={0.8}
        >
          <Image source={LOGO} style={styles.logo} resizeMode="cover" />
          <View style={{ justifyContent: 'center' }}>
            <Text style={styles.brandTitle}>FarmPulse</Text>
            <Text style={styles.brandTagline}>Predict. Analyze. Decide.</Text>
          </View>
        </TouchableOpacity>

        {/* Desktop Web Navigation Links */}
        <View style={styles.navLinks}>
          <TouchableOpacity
            style={[styles.navItem, activePage === 'home' && styles.navItemActive]}
            onPress={() => onNavigate('home')}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activePage === 'home' && styles.navTextActive]}>
              🎯 Market Intelligence
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activePage === 'trend' && styles.navItemActive]}
            onPress={() => onNavigate('trend')}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activePage === 'trend' && styles.navTextActive]}>
              📈 Price Trend Analysis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activePage === 'history' && styles.navItemActive]}
            onPress={() => onNavigate('history')}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activePage === 'history' && styles.navTextActive]}>
              📊 Past Price Records
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activePage === 'retail' && styles.navItemActive]}
            onPress={() => onNavigate('retail')}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activePage === 'retail' && styles.navTextActive]}>
              🛒 Grocery Shop Prices
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activePage === 'markets' && styles.navItemActive]}
            onPress={() => onNavigate('markets')}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activePage === 'markets' && styles.navTextActive]}>
              🏢 Regional Markets
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Action: Back Button */}
        <View style={styles.rightGroup}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 100,
  },
  navContainer: {
    maxWidth: 1240,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexWrap: 'wrap',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.2,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  navItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navItemActive: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  navText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
