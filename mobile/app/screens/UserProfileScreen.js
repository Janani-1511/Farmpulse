import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';

const LOGO = require('../../assets/logo.jpg');

export default function UserProfileScreen({ currentUser, onLogout, onNavigate }) {
  if (!currentUser) return null;

  // Extract initials for avatar
  const getInitials = (name) => {
    if (!name) return 'FP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.contentWrapper}>

        {/* PROFILE HEADER CARD */}
        <View style={styles.headerCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(currentUser.full_name)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{currentUser.full_name}</Text>
              <Text style={styles.userEmail}>✉️ {currentUser.email}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.districtBadge}>
                  <Text style={styles.districtBadgeText}>📍 {currentUser.city || 'Tamil Nadu'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ACCOUNT REGISTRATION DETAILS SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👤 Registration & Profile Details</Text>
            <Text style={styles.sectionSubtitle}>
              Information provided during your FarmPulse account registration
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            
            {/* ITEM 1: FULL NAME */}
            <View style={styles.detailCard}>
              <View style={styles.detailIconCircle}>
                <Text style={styles.detailIcon}>👤</Text>
              </View>
              <View style={styles.detailTextCol}>
                <Text style={styles.detailLabel}>Registered Full Name</Text>
                <Text style={styles.detailValue}>{currentUser.full_name}</Text>
              </View>
            </View>

            {/* ITEM 2: EMAIL ADDRESS */}
            <View style={styles.detailCard}>
              <View style={styles.detailIconCircle}>
                <Text style={styles.detailIcon}>✉️</Text>
              </View>
              <View style={styles.detailTextCol}>
                <Text style={styles.detailLabel}>Registered Email Address</Text>
                <Text style={styles.detailValue}>{currentUser.email}</Text>
              </View>
            </View>

            {/* ITEM 3: CITY / DISTRICT */}
            <View style={styles.detailCard}>
              <View style={styles.detailIconCircle}>
                <Text style={styles.detailIcon}>📍</Text>
              </View>
              <View style={styles.detailTextCol}>
                <Text style={styles.detailLabel}>City / Tamil Nadu District</Text>
                <Text style={styles.detailValue}>{currentUser.city || 'Coimbatore, Tamil Nadu'}</Text>
              </View>
            </View>

            {/* ITEM 4: ACCOUNT REGISTRATION DATE */}
            <View style={styles.detailCard}>
              <View style={styles.detailIconCircle}>
                <Text style={styles.detailIcon}>📅</Text>
              </View>
              <View style={styles.detailTextCol}>
                <Text style={styles.detailLabel}>Account Created On</Text>
                <Text style={styles.detailValue}>
                  {currentUser.created_at
                    ? new Date(currentUser.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'August 31, 2026'}
                </Text>
              </View>
            </View>

          </View>
        </View>

        {/* QUICK NAVIGATION & ACTIONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.analyzeBtn} onPress={() => onNavigate('home')}>
            <Text style={styles.analyzeBtnText}>🎯 Go to Market Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutBtnText}>🚪 Log Out of Account</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
  },
  contentWrapper: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    gap: 24,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2D6A4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  districtBadge: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  districtBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B4332',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    width: '48%',
    minWidth: 260,
    gap: 14,
  },
  detailIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailIcon: {
    fontSize: 20,
  },
  detailTextCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  analyzeBtn: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '800',
  },
});
