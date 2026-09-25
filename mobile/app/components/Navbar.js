import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, useWindowDimensions } from 'react-native';

const LOGO = require('../../assets/logo.jpg');

export default function Navbar({ activePage, onNavigate, onBack }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const navItems = [
    { id: 'home', label: '🎯 Market Intelligence' },
    { id: 'trend', label: '📈 Price Trend Analysis' },
    { id: 'history', label: '📊 Past Price Records' },
    { id: 'retail', label: '🛒 Grocery Shop Prices' },
    { id: 'markets', label: '🏢 Regional Markets' },
  ];

  return (
    <View style={styles.navbar}>
      <View style={[styles.navContainer, isMobile && styles.navContainerMobile]}>
        {/* Top Header Row: Brand Logo + Back Button */}
        <View style={styles.brandAndBackRow}>
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

          {/* Desktop Right Back Button */}
          {!isMobile && (
            <View style={styles.rightGroup}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={onBack}
                activeOpacity={0.8}
              >
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Mobile Right Back Button */}
          {isMobile && (
            <TouchableOpacity
              style={styles.backBtnMobile}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Text style={styles.backBtnTextMobile}>← Back</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Navigation Links */}
        {isMobile ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mobileNavScrollContent}
            style={styles.mobileNavWrapper}
          >
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => onNavigate(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.navText, isActive && styles.navTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.navLinks}>
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => onNavigate(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.navText, isActive && styles.navTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
    width: '100%',
  },
  navContainer: {
    maxWidth: 1240,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  navContainerMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  brandAndBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 10,
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
  mobileNavWrapper: {
    width: '100%',
    marginTop: 2,
  },
  mobileNavScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
  },
  navItem: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
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
  backBtnMobile: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  backBtnTextMobile: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
});
