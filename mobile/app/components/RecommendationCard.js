import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function RecommendationCard({ bestMarket, recommendation, onViewTrend }) {
  if (!recommendation || !bestMarket) return null;

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'CHOOSE_A_BETTER_MARKET':
        return { bg: '#DCFCE7', text: '#15803D', label: '💡 OPTIMAL MARKET CHOICE' };
      case 'WAIT':
        return { bg: '#DBEAFE', text: '#1D4ED8', label: '⏳ WAIT FOR HIGHER PRICE' };
      case 'SELL_NOW':
        return { bg: '#FCE7F3', text: '#BE185D', label: '⚡ SELL IMMEDIATELY' };
      default:
        return { bg: '#F3F4F6', text: '#374151', label: '📊 HOLD & MONITOR' };
    }
  };

  const badge = getBadgeStyle(recommendation.type);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>SMART DECISION RECOMMENDATION</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.bestMarketContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.trophy}>🏆 BEST RECOMMENDED MARKET</Text>
            <Text style={styles.marketName}>{bestMarket.market_name || 'N/A'}</Text>
            <Text style={styles.districtText}>
              {bestMarket.district}, {bestMarket.state} ({bestMarket.distance_km} km away)
            </Text>
          </View>

          {onViewTrend ? (
            <TouchableOpacity
              style={styles.trendBtn}
              onPress={() => onViewTrend(bestMarket.id)}
            >
              <Text style={styles.trendBtnText}>📈 VIEW PRICE TREND</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.revenueHighlight}>
        <View style={styles.revCol}>
          <Text style={styles.revLabel}>Predicted Price</Text>
          <Text style={styles.revVal}>₹{bestMarket.predicted_price?.toLocaleString('en-IN')}/q</Text>
        </View>
        <View style={styles.revCol}>
          <Text style={styles.revLabel}>Transport Cost</Text>
          <Text style={styles.revValCost}>₹{bestMarket.transport_cost?.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.revCol}>
          <Text style={styles.revLabel}>Est. Net Revenue</Text>
          <Text style={styles.revValNet}>₹{bestMarket.estimated_net_revenue?.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.reasonBox}>
        <Text style={styles.reasonHeader}>Recommendation Reason:</Text>
        <Text style={styles.reasonText}>{recommendation.reason}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#16A34A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bestMarketContainer: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  trophy: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  marketName: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
  },
  districtText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  revenueHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  revCol: {
    alignItems: 'center',
  },
  revLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  revVal: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  revValCost: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  revValNet: {
    color: '#15803D',
    fontSize: 16,
    fontWeight: '800',
  },
  reasonBox: {
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },
  reasonHeader: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  reasonText: {
    color: '#1E293B',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  trendBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  trendBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
