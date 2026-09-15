import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PriceInsightCard({ crop, targetDate, bestMarket }) {
  if (!bestMarket || !bestMarket.predicted_price) return null;

  const currentPrice = bestMarket.current_price || 0;
  const predictedPrice = bestMarket.predicted_price || 0;
  const diff = predictedPrice - currentPrice;
  const pctChange = currentPrice > 0 ? (diff / currentPrice) * 100 : 0;
  const isUp = diff >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>PRICE INSIGHT ({crop.toUpperCase()})</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Current Price</Text>
          <Text style={styles.metricValue}>₹{currentPrice.toLocaleString('en-IN')}</Text>
          <Text style={styles.unitText}>per quintal</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Predicted Price ({targetDate})</Text>
          <Text style={styles.metricValuePredicted}>₹{predictedPrice.toLocaleString('en-IN')}</Text>
          <Text style={styles.unitText}>per quintal</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Expected Trend</Text>
          <Text style={[styles.trendValue, isUp ? styles.trendUp : styles.trendDown]}>
            {isUp ? '📈 +' : '📉 '}
            {diff.toFixed(0)} ({pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}%)
          </Text>
          <Text style={styles.unitText}>{isUp ? 'Increasing' : 'Decreasing'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  cardHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  metricValue: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  metricValuePredicted: {
    color: '#15803D',
    fontSize: 17,
    fontWeight: '800',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  trendUp: {
    color: '#16A34A',
  },
  trendDown: {
    color: '#DC2626',
  },
  unitText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: '70%',
    backgroundColor: '#E2E8F0',
  },
});
