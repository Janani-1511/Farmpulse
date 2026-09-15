import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function MarketComparisonTable({ markets, bestMarketId, onSelectMarketRow }) {
  const [sortField, setSortField] = useState('net_revenue');

  if (!markets || markets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No nearby markets with sufficient crop price data were found for the selected location.
        </Text>
      </View>
    );
  }

  const sortedMarkets = [...markets].sort((a, b) => {
    if (sortField === 'distance') {
      return a.distance_km - b.distance_km;
    } else if (sortField === 'predicted_price') {
      return b.predicted_price - a.predicted_price;
    } else {
      return b.estimated_net_revenue - a.estimated_net_revenue;
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.title}>NEARBY MARKET COMPARISON</Text>
        <Text style={styles.subtitle}>Tap any row to view full breakdown</Text>
      </View>

      {/* Sorting Tabs */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort By:</Text>

        <TouchableOpacity
          style={[styles.sortChip, sortField === 'net_revenue' && styles.sortChipActive]}
          onPress={() => setSortField('net_revenue')}
        >
          <Text style={[styles.sortText, sortField === 'net_revenue' && styles.sortTextActive]}>
            💰 Highest Net Revenue
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortChip, sortField === 'distance' && styles.sortChipActive]}
          onPress={() => setSortField('distance')}
        >
          <Text style={[styles.sortText, sortField === 'distance' && styles.sortTextActive]}>
            📍 Nearest Market
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortChip, sortField === 'predicted_price' && styles.sortChipActive]}
          onPress={() => setSortField('predicted_price')}
        >
          <Text style={[styles.sortText, sortField === 'predicted_price' && styles.sortTextActive]}>
            📈 Highest Price
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontally Scrollable Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
        <View style={styles.table}>
          {/* Table Header Row */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colMarket]}>Market</Text>
            <Text style={[styles.th, styles.colDist]}>Distance</Text>
            <Text style={[styles.th, styles.colWeather]}>Weather Risk</Text>
            <Text style={[styles.th, styles.colPrice]}>Current Price</Text>
            <Text style={[styles.th, styles.colPrice]}>Predicted Price</Text>
            <Text style={[styles.th, styles.colCost]}>Transport Cost</Text>
            <Text style={[styles.th, styles.colRev]}>Expected Revenue</Text>
            <Text style={[styles.th, styles.colNetRev]}>Est. Net Revenue</Text>
          </View>

          {/* Table Data Rows */}
          {sortedMarkets.map((item, index) => {
            const isBest = item.id === bestMarketId;
            const wInfo = item.weather;
            const wAvailable = wInfo && wInfo.available;
            const risk = wAvailable ? wInfo.weather_risk : 'N/A';
            const cond = wAvailable ? wInfo.weather_condition : 'Out of range';

            return (
              <TouchableOpacity
                key={item.id || index}
                style={[styles.tableRow, isBest && styles.bestRow, index % 2 === 1 && !isBest && styles.evenRow]}
                onPress={() => onSelectMarketRow(item)}
              >
                <View style={[styles.td, styles.colMarket, styles.marketNameCol]}>
                  {isBest ? <Text style={styles.bestBadge}>🏆 BEST</Text> : null}
                  <Text style={[styles.marketText, isBest && styles.bestMarketText]} numberOfLines={1}>
                    {item.market_name}
                  </Text>
                  <Text style={styles.districtSub}>{item.district}</Text>
                </View>

                <Text style={[styles.td, styles.colDist]}>{item.distance_km} km</Text>

                <View style={[styles.td, styles.colWeather]}>
                  {wAvailable ? (
                    <View style={[
                      styles.weatherRiskBadge,
                      risk === 'High' ? styles.riskHigh : risk === 'Medium' ? styles.riskMed : styles.riskLow
                    ]}>
                      <Text style={styles.weatherBadgeText}>{cond} ({risk})</Text>
                    </View>
                  ) : (
                    <Text style={styles.naWeatherText}>N/A</Text>
                  )}
                </View>

                <Text style={[styles.td, styles.colPrice]}>₹{item.current_price?.toLocaleString('en-IN')}</Text>
                <Text style={[styles.td, styles.colPrice, styles.predictedText]}>
                  ₹{item.predicted_price?.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.td, styles.colCost, styles.costText]}>
                  ₹{item.transport_cost?.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.td, styles.colRev]}>
                  ₹{item.expected_revenue?.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.td, styles.colNetRev, isBest ? styles.bestNetRevText : styles.netRevText]}>
                  ₹{item.estimated_net_revenue?.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  headerArea: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 14,
    gap: 6,
  },
  sortLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  sortChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sortChipActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  sortText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  sortTextActive: {
    color: '#0369A1',
    fontWeight: '700',
  },
  horizontalScroll: {
    borderRadius: 12,
  },
  table: {
    minWidth: 920,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#BBF7D0',
  },
  th: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '800',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  evenRow: {
    backgroundColor: '#F8FAFC',
  },
  bestRow: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#16A34A',
  },
  td: {
    color: '#334155',
    fontSize: 13,
  },
  colMarket: { width: 160 },
  colDist: { width: 85, textAlign: 'center' },
  colWeather: { width: 125, justifyContent: 'center', alignItems: 'center' },
  colPrice: { width: 110, textAlign: 'right' },
  colCost: { width: 105, textAlign: 'right' },
  colRev: { width: 125, textAlign: 'right' },
  colNetRev: { width: 125, textAlign: 'right' },

  weatherRiskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  riskLow: { backgroundColor: '#DCFCE7' },
  riskMed: { backgroundColor: '#FEF3C7' },
  riskHigh: { backgroundColor: '#FEE2E2' },
  weatherBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  naWeatherText: {
    color: '#94A3B8',
    fontSize: 11,
  },


  marketNameCol: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  marketText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  bestMarketText: {
    color: '#15803D',
    fontWeight: '800',
  },
  districtSub: {
    color: '#64748B',
    fontSize: 10,
  },
  bestBadge: {
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  predictedText: {
    color: '#0284C7',
    fontWeight: '700',
  },
  costText: {
    color: '#DC2626',
  },
  netRevText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  bestNetRevText: {
    color: '#15803D',
    fontWeight: '800',
    fontSize: 14,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
});
