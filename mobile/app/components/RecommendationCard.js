import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const RADIUS_OPTIONS = [150, 250, 500, 1000, 2500];

export default function RecommendationCard({
  bestMarket,
  recommendation,
  onViewTrend,
  currentRadius = 100,
  onExpandRadius,
}) {
  const [selectedExpandRadius, setSelectedExpandRadius] = useState(250);
  const [showRadiusPicker, setShowRadiusPicker] = useState(false);

  if (!recommendation || !bestMarket) return null;

  const isNoMarketFound =
    !bestMarket ||
    bestMarket.market_name === 'N/A' ||
    !bestMarket.id ||
    (recommendation.reason && recommendation.reason.toLowerCase().includes('no agricultural markets were found'));

  const getBadgeStyle = (type) => {
    if (isNoMarketFound) {
      return { bg: '#FEF2F2', text: '#DC2626', label: '⚠️ NO MARKETS IN RADIUS' };
    }
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
    <View style={[styles.card, isNoMarketFound && styles.cardWarning]}>
      <View style={styles.headerRow}>
        <Text style={[styles.cardTitle, isNoMarketFound && styles.cardTitleWarning]}>
          SMART DECISION RECOMMENDATION
        </Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={[styles.bestMarketContainer, isNoMarketFound && styles.bestMarketWarningBox]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.trophy, isNoMarketFound && { color: '#DC2626' }]}>
              {isNoMarketFound ? '🔍 MARKET SEARCH LIMIT REACHED' : '🏆 BEST RECOMMENDED MARKET'}
            </Text>
            <Text style={styles.marketName}>{bestMarket.market_name || 'N/A'}</Text>

            {isNoMarketFound ? (
              <Text style={styles.districtTextWarning}>
                No registered agricultural markets were found within {currentRadius} km of your location.
              </Text>
            ) : (
              <Text style={styles.districtText}>
                {[bestMarket.district, bestMarket.state].filter(Boolean).join(', ')} ({bestMarket.distance_km} km {bestMarket.distance_type === 'estimated' ? 'est. distance' : 'road distance'})
              </Text>
            )}
          </View>

          {onViewTrend && !isNoMarketFound ? (
            <TouchableOpacity
              style={styles.trendBtn}
              onPress={() => onViewTrend(bestMarket.id)}
            >
              <Text style={styles.trendBtnText}>📈 VIEW PRICE TREND</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {!isNoMarketFound && (
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
      )}

      <View style={[styles.reasonBox, isNoMarketFound && styles.reasonBoxWarning]}>
        <Text style={[styles.reasonHeader, isNoMarketFound && { color: '#991B1B' }]}>
          Recommendation Reason:
        </Text>
        <Text style={styles.reasonText}>{recommendation.reason}</Text>
      </View>

      {/* PROMPT TO INCREASE SEARCH RADIUS */}
      {(isNoMarketFound || showRadiusPicker) ? (
        <View style={styles.expandBox}>
          <View style={styles.expandHeaderRow}>
            <Text style={styles.expandIcon}>📡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.expandTitle}>INCREASE MARKET SEARCH RADIUS</Text>
              <Text style={styles.expandSub}>
                {isNoMarketFound
                  ? `Select a larger distance to scan regional agricultural markets beyond ${currentRadius} km:`
                  : `Currently searching within ${currentRadius} km. Select a new search radius:`}
              </Text>
            </View>
          </View>

          <View style={styles.pillContainer}>
            {RADIUS_OPTIONS.map((r) => {
              const isSelected = selectedExpandRadius === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.radiusPill, isSelected && styles.radiusPillSelected]}
                  onPress={() => setSelectedExpandRadius(r)}
                >
                  <Text style={[styles.radiusPillText, isSelected && styles.radiusPillTextSelected]}>
                    {r >= 2500 ? 'All India (2500 km)' : `${r} km`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {onExpandRadius ? (
            <TouchableOpacity
              style={styles.expandSubmitBtn}
              onPress={() => onExpandRadius(selectedExpandRadius)}
            >
              <Text style={styles.expandSubmitText}>
                ⚡ SEARCH MARKETS WITHIN {selectedExpandRadius >= 2500 ? 'ALL INDIA' : `${selectedExpandRadius} KM`} →
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.adjustRadiusToggleBtn}
          onPress={() => setShowRadiusPicker(true)}
        >
          <Text style={styles.adjustRadiusToggleText}>
            ⚙️ Search Radius: {currentRadius} km — Click to Expand / Modify Distance
          </Text>
        </TouchableOpacity>
      )}
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
  cardWarning: {
    borderColor: '#F59E0B',
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
  cardTitleWarning: {
    color: '#D97706',
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
  bestMarketWarningBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
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
  districtTextWarning: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
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
    marginBottom: 14,
  },
  reasonBoxWarning: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#EF4444',
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
  expandBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    marginTop: 6,
  },
  expandHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  expandIcon: {
    fontSize: 22,
  },
  expandTitle: {
    color: '#1E40AF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  expandSub: {
    color: '#334155',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  radiusPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  radiusPillSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  radiusPillText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '700',
  },
  radiusPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  expandSubmitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  expandSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  adjustRadiusToggleBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 4,
  },
  adjustRadiusToggleText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
});
