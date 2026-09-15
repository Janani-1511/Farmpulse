import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

export default function SkeletonLoader() {
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    '🔍 Validating location & finding nearby markets...',
    '📈 Running Random Forest ML price prediction model...',
    '🚚 Computing Haversine transport estimates...',
    '🌦️ Fetching live Open-Meteo weather forecasts...',
    '🏆 Formulating optimal revenue recommendations...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* ACTIVE LOADING STATUS BANNER */}
      <View style={styles.statusBanner}>
        <ActivityIndicator size="small" color="#16A34A" style={{ marginRight: 10 }} />
        <Text style={styles.statusText}>{loadingMessages[loadingStep]}</Text>
      </View>

      {/* SKELETON 1: SUMMARY CARD */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonLineLong} />
        <View style={styles.skeletonLineMedium} />
      </View>

      {/* SKELETON 2: MARKET COMPARISON TABLE */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonHeaderRow}>
          <Text style={styles.skeletonHeaderText}>NEARBY MARKET COMPARISON</Text>
        </View>

        <View style={styles.skeletonTableRow}>
          <View style={styles.skeletonBadge} />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.skeletonLineMedium} />
            <View style={styles.skeletonLineShort} />
          </View>
        </View>

        <View style={styles.skeletonTableRow}>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.skeletonLineMedium} />
            <View style={styles.skeletonLineShort} />
          </View>
        </View>

        <View style={styles.skeletonTableRow}>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.skeletonLineMedium} />
            <View style={styles.skeletonLineShort} />
          </View>
        </View>
      </View>

      {/* SKELETON 3: WEATHER FORECAST */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonGrid}>
          <View style={styles.skeletonGridBox} />
          <View style={styles.skeletonGridBox} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  statusBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#16A34A',
  },
  statusText: {
    color: '#15803D',
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  skeletonHeaderRow: {
    marginBottom: 12,
  },
  skeletonHeaderText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  skeletonLineShort: {
    height: 12,
    width: '35%',
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonLineMedium: {
    height: 14,
    width: '65%',
    backgroundColor: '#CBD5E1',
    borderRadius: 6,
    marginBottom: 6,
  },
  skeletonLineLong: {
    height: 18,
    width: '85%',
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  skeletonBadge: {
    width: 40,
    height: 18,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginRight: 10,
  },
  skeletonGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  skeletonGridBox: {
    flex: 1,
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
});
