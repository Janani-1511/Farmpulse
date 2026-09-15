import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

const LOGO = require('../../assets/logo.jpg');

export default function Navbar({ activePage, onNavigate, healthStatus, currentUser, onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

          <TouchableOpacity
            style={[styles.navItem, activePage === 'profile' && styles.navItemActive]}
            onPress={() => onNavigate('profile')}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activePage === 'profile' && styles.navTextActive]}>
              👤 My Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Status & User Profile Badge */}
        <View style={styles.rightGroup}>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: healthStatus ? '#10B981' : '#059669' }]} />
            <Text style={styles.statusText}>
              {healthStatus ? 'API Connected' : 'System Ready'}
            </Text>
          </View>

          {currentUser ? (
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                style={styles.profileBadgeBtn}
                onPress={() => setShowProfileMenu(!showProfileMenu)}
                activeOpacity={0.8}
              >
                <Text style={styles.profileBadgeText}>👤 {currentUser.full_name}</Text>
              </TouchableOpacity>

              {showProfileMenu ? (
                <View style={styles.profileDropdown}>
                  <Text style={styles.profileNameText}>{currentUser.full_name}</Text>
                  <Text style={styles.profileSubText}>✉️ {currentUser.email}</Text>
                  <Text style={styles.profileSubText}>📍 {currentUser.city}</Text>

                  <View style={styles.dropdownDivider} />

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setShowProfileMenu(false);
                      onNavigate('profile');
                    }}
                  >
                    <Text style={styles.dropdownItemText}>👤 Account Details</Text>
                  </TouchableOpacity>

                  <View style={styles.dropdownDivider} />

                  <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                  >
                    <Text style={styles.logoutBtnText}>🚪 Log Out</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ) : null}
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '800',
  },
  profileBadgeBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  profileBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  profileDropdown: {
    position: 'absolute',
    top: 42,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minWidth: 220,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 999,
  },
  profileNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  profileSubText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  dropdownItem: {
    paddingVertical: 6,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutBtnText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '800',
  },
});
