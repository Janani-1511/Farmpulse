import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, useWindowDimensions } from 'react-native';

const LOGO = require('../../assets/logo.jpg');

export default function Navbar({ activePage, onNavigate, onBack }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 900; // Use 900px breakpoint to ensure full desktop menu has ample space

  const navItems = [
    { id: 'home', label: '🎯 Market Intelligence' },
    { id: 'trend', label: '📈 Trend Analysis' },
    { id: 'history', label: '📊 Past Price Records' },
    { id: 'retail', label: '🛒 Grocery Shops' },
    { id: 'markets', label: '🏢 Regional Markets' },
  ];

  return (
    <View style={styles.navbar}>
      {!isMobile ? (
        /* DESKTOP NAVBAR: Logo (Left) | Back & Nav Buttons (Right) */
        <View style={styles.desktopNavContainer}>
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

          <View style={styles.rightGroup}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.desktopNavLinks}>
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
          </View>
        </View>
      ) : (
        /* MOBILE NAVBAR: Top Row (Logo + Back) | Bottom Row (Horizontally Scrollable Tabs) */
        <View style={styles.mobileNavContainer}>
          <View style={styles.brandAndBackRow}>
            <TouchableOpacity
              style={styles.brandRow}
              onPress={() => onNavigate('home')}
              activeOpacity={0.8}
            >
              <Image source={LOGO} style={styles.logoMobile} resizeMode="cover" />
              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.brandTitleMobile}>FarmPulse</Text>
                <Text style={styles.brandTaglineMobile}>Predict. Analyze. Decide.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtnMobile}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Text style={styles.backBtnTextMobile}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mobileNavOuterWrapper}>
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
          </View>
        </View>
      )}
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
    maxWidth: '100%',
    boxSizing: 'border-box',
  },

  /* DESKTOP STYLES */
  desktopNavContainer: {
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 16,
  },
  desktopNavLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'nowrap',
  },

  /* MOBILE STYLES */
  mobileNavContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
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
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 10,
  },
  logoMobile: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandTitleMobile: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.2,
  },
  brandTaglineMobile: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.2,
  },

  mobileNavOuterWrapper: {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  mobileNavWrapper: {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  mobileNavScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
    flexGrow: 0,
    flexShrink: 0,
  },
  navItem: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  navItemActive: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  navText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    whiteSpace: 'nowrap',
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
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
