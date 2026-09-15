import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { getPriceHistory } from '../../services/api';

const CROPS = ['All', 'Tomato', 'Potato', 'Onion', 'Chilly', 'Rice', 'Wheat', 'Maize', 'Cotton'];
const MARKETS = [
  { id: 'all', name: 'All Markets' },
  { id: 'mkt_coimbatore', name: 'Coimbatore Central' },
  { id: 'mkt_pollachi', name: 'Pollachi Market' },
  { id: 'mkt_mettupalayam', name: 'Mettupalayam Produce' },
  { id: 'mkt_tiruppur', name: 'Tiruppur Commodity' },
  { id: 'mkt_erode', name: 'Erode Grain Market' },
  { id: 'mkt_salem', name: 'Salem APMC' },
  { id: 'mkt_madurai', name: 'Madurai Mattuthavani' },
  { id: 'mkt_dindigul', name: 'Dindigul Market' },
];

const HORIZONS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '1 Year', days: 365 },
];

export default function PriceHistoryScreen() {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedDays, setSelectedDays] = useState(30);

  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await getPriceHistory(selectedCrop, selectedMarket, selectedDays);
    setLoading(false);

    if (res.success) {
      setHistoryData(res.data);
    } else {
      setErrorMsg(res.error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedCrop, selectedMarket, selectedDays]);

  const records = historyData?.records || [];
  const summary = historyData?.summary || {};

  return (
    <View style={styles.container}>
      {/* Title & Subtitle Header */}
      <View style={styles.titleCard}>
        <Text style={styles.screenTitle}>📊 HISTORICAL CROP PRICE EXPLORER</Text>
        <Text style={styles.screenSub}>
          Analyze multi-year historical prices and arrival trends across regional agricultural markets
        </Text>
      </View>

      {/* FILTER PANEL */}
      <View style={styles.filterCard}>
        <Text style={styles.filterSectionTitle}>FILTER HISTORICAL DATA</Text>

        {/* 1. Crop Filter Scroll */}
        <Text style={styles.filterLabel}>Select Crop:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {CROPS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, selectedCrop === c && styles.chipActive]}
              onPress={() => setSelectedCrop(c)}
            >
              <Text style={[styles.chipText, selectedCrop === c && styles.chipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 2. Market Filter Scroll */}
        <Text style={styles.filterLabel}>Select Market:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {MARKETS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.chip, selectedMarket === m.id && styles.chipActiveSecondary]}
              onPress={() => setSelectedMarket(m.id)}
            >
              <Text style={[styles.chipText, selectedMarket === m.id && styles.chipTextActiveSecondary]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 3. Time Horizon Filter */}
        <Text style={styles.filterLabel}>Time Period:</Text>
        <View style={styles.horizonRow}>
          {HORIZONS.map((h) => (
            <TouchableOpacity
              key={h.days}
              style={[styles.horizonBtn, selectedDays === h.days && styles.horizonBtnActive]}
              onPress={() => setSelectedDays(h.days)}
            >
              <Text style={[styles.horizonBtnText, selectedDays === h.days && styles.horizonBtnTextActive]}>
                {h.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* LOADING OR RESULTS DISPLAY */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingText}>Fetching historical price records...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Failed to Load History</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchHistory}>
            <Text style={styles.retryBtnText}>Retry Loading</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {/* SUMMARY CARDS GRID */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Average Price</Text>
              <Text style={styles.metricVal}>₹{summary.avg_modal_price?.toLocaleString('en-IN')}</Text>
              <Text style={styles.metricSub}>per quintal</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Peak Recorded</Text>
              <Text style={styles.metricValHigh}>₹{summary.max_price?.toLocaleString('en-IN')}</Text>
              <Text style={styles.metricSub}>per quintal</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Lowest Recorded</Text>
              <Text style={styles.metricValLow}>₹{summary.min_price?.toLocaleString('en-IN')}</Text>
              <Text style={styles.metricSub}>per quintal</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Arrivals</Text>
              <Text style={styles.metricValArrival}>
                {summary.total_arrivals ? summary.total_arrivals.toLocaleString('en-IN') : 0} q
              </Text>
              <Text style={styles.metricSub}>market volume</Text>
            </View>
          </View>

          {/* HISTORICAL PRICE RECORDS TABLE */}
          <View style={styles.tableCard}>
            <View style={styles.tableCardHeader}>
              <Text style={styles.tableTitle}>DAILY PRICE RECORDS ({records.length} Entries)</Text>
              <Text style={styles.tableSub}>Sorted by date (latest first)</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.thRow}>
                  <Text style={[styles.th, styles.colDate]}>Date</Text>
                  <Text style={[styles.th, styles.colCrop]}>Crop</Text>
                  <Text style={[styles.th, styles.colMarket]}>Market Name</Text>
                  <Text style={[styles.th, styles.colPrice]}>Min (₹)</Text>
                  <Text style={[styles.th, styles.colPrice]}>Modal (₹)</Text>
                  <Text style={[styles.th, styles.colPrice]}>Max (₹)</Text>
                  <Text style={[styles.th, styles.colArrival]}>Arrivals (q)</Text>
                </View>

                {/* Table Rows */}
                {records.length === 0 ? (
                  <View style={styles.noDataRow}>
                    <Text style={styles.noDataText}>No price records found for selected filters.</Text>
                  </View>
                ) : (
                  records.map((row, idx) => (
                    <View key={idx} style={[styles.tr, idx % 2 === 1 && styles.trEven]}>
                      <Text style={[styles.td, styles.colDate, styles.tdDate]}>{row.date}</Text>
                      <Text style={[styles.td, styles.colCrop, styles.tdCrop]}>{row.crop}</Text>
                      <Text style={[styles.td, styles.colMarket, styles.tdMarket]} numberOfLines={1}>
                        {row.market_name}
                      </Text>
                      <Text style={[styles.td, styles.colPrice, styles.tdMin]}>
                        ₹{row.min_price?.toLocaleString('en-IN')}
                      </Text>
                      <Text style={[styles.td, styles.colPrice, styles.tdModal]}>
                        ₹{row.modal_price?.toLocaleString('en-IN')}
                      </Text>
                      <Text style={[styles.td, styles.colPrice, styles.tdMax]}>
                        ₹{row.max_price?.toLocaleString('en-IN')}
                      </Text>
                      <Text style={[styles.td, styles.colArrival]}>
                        {row.arrival_quantity} q
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  titleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  screenSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#165834',
    marginBottom: 6,
    marginTop: 4,
  },
  chipScroll: {
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  chipActiveSecondary: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  chipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#15803D',
    fontWeight: '800',
  },
  chipTextActiveSecondary: {
    color: '#0369A1',
    fontWeight: '800',
  },
  horizonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  horizonBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  horizonBtnActive: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
  },
  horizonBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  horizonBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  loadingText: {
    color: '#64748B',
    marginTop: 10,
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  errorTitle: {
    color: '#991B1B',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    color: '#7F1D1D',
    fontSize: 12,
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  metricVal: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  metricValHigh: {
    color: '#16A34A',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  metricValLow: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  metricValArrival: {
    color: '#0284C7',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  metricSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  tableCardHeader: {
    marginBottom: 12,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  tableSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  table: {
    minWidth: 700,
  },
  thRow: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 8,
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
  tr: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  trEven: {
    backgroundColor: '#F8FAFC',
  },
  td: {
    color: '#334155',
    fontSize: 12,
  },
  colDate: { width: 100 },
  colCrop: { width: 90 },
  colMarket: { width: 180 },
  colPrice: { width: 100, textAlign: 'right' },
  colArrival: { width: 110, textAlign: 'right' },

  tdDate: { fontWeight: '600' },
  tdCrop: { fontWeight: '700', color: '#15803D' },
  tdMarket: { fontWeight: '700', color: '#0F172A' },
  tdMin: { color: '#64748B' },
  tdModal: { color: '#0284C7', fontWeight: '800' },
  tdMax: { color: '#16A34A', fontWeight: '700' },

  noDataRow: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    color: '#94A3B8',
    fontSize: 13,
  },
});
