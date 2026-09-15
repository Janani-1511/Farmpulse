import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import { getRetailPrices } from '../../services/api';

const CROPS = ['Tomato', 'Potato', 'Onion', 'Chilly', 'Rice', 'Wheat'];
const DISTRICTS = ['Coimbatore', 'Erode', 'Madurai', 'Salem', 'Tiruppur', 'All'];

export default function RetailPricesScreen() {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedDistrict, setSelectedDistrict] = useState('Coimbatore');

  const [loading, setLoading] = useState(true);
  const [retailData, setRetailData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchPrices = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await getRetailPrices(selectedCrop, selectedDistrict);
    setLoading(false);

    if (res.success) {
      setRetailData(res.data);
    } else {
      setErrorMsg(res.error);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedCrop, selectedDistrict]);

  const stores = retailData?.stores || [];
  const summary = retailData?.summary || {};

  const openStoreMaps = (store) => {
    const query = encodeURIComponent(`${store.store_name}, ${store.address}`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    if (typeof window !== 'undefined' && window.open) {
      window.open(mapsUrl, '_blank');
    } else {
      Linking.openURL(mapsUrl);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <Text style={styles.title}>🛒 GROCERY SHOPS & SUPERMARKET CROP PRICES</Text>
        <Text style={styles.sub}>
          Real-time consumer retail prices of crops sold in local grocery stores & supermarkets vs Mandi wholesale prices
        </Text>
      </View>

      {/* FILTER PANEL */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>SELECT CROP & LOCATION</Text>

        {/* 1. Crop Selector */}
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

        {/* 2. District Selector */}
        <Text style={styles.filterLabel}>Select Location / District:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {DISTRICTS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, selectedDistrict === d && styles.chipActiveSecondary]}
              onPress={() => setSelectedDistrict(d)}
            >
              <Text style={[styles.chipText, selectedDistrict === d && styles.chipTextActiveSecondary]}>
                📍 {d}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* RESULTS DISPLAY */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Fetching grocery shop retail prices...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Failed to Load Retail Prices</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchPrices}>
            <Text style={styles.retryBtnText}>Retry Loading</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {/* SUMMARY CARDS */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.sumLabel}>Grocery Shop Price</Text>
              <Text style={styles.sumValRetail}>₹{summary.avg_retail_price_per_kg} / kg</Text>
              <Text style={styles.sumSub}>Average Consumer Retail</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.sumLabel}>Wholesale Mandi Price</Text>
              <Text style={styles.sumValMandi}>₹{summary.avg_mandi_price_per_kg} / kg</Text>
              <Text style={styles.sumSub}>Average Farmer Mandi</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.sumLabel}>Retail Spread / Margin</Text>
              <Text style={styles.sumValMargin}>+{summary.avg_retail_markup}%</Text>
              <Text style={styles.sumSub}>Retail Markup Percentage</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.sumLabel}>Shops Sampled</Text>
              <Text style={styles.sumValStores}>{summary.total_stores_counted} Stores</Text>
              <Text style={styles.sumSub}>In {selectedDistrict}</Text>
            </View>
          </View>

          {/* GROCERY STORES PRICE TABLE */}
          <View style={styles.tableCard}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableTitle}>GROCERY SHOPS & SUPERMARKET PRICE LIST ({stores.length} Stores)</Text>
              <Text style={styles.tableSub}>{selectedCrop} prices in {selectedDistrict}</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.thRow}>
                  <Text style={[styles.th, styles.colStore]}>Grocery Shop / Supermarket</Text>
                  <Text style={[styles.th, styles.colArea]}>Area / Location</Text>
                  <Text style={[styles.th, styles.colCrop]}>Crop</Text>
                  <Text style={[styles.th, styles.colPrice]}>Mandi (₹/kg)</Text>
                  <Text style={[styles.th, styles.colPrice]}>Grocery Shop (₹/kg)</Text>
                  <Text style={[styles.th, styles.colMarkup]}>Markup (%)</Text>
                  <Text style={[styles.th, styles.colStock]}>Stock Status</Text>
                  <Text style={[styles.th, styles.colAction]}>Google Maps</Text>
                </View>

                {/* Table Rows */}
                {stores.length === 0 ? (
                  <View style={styles.noDataRow}>
                    <Text style={styles.noDataText}>No grocery shop records found for this selection.</Text>
                  </View>
                ) : (
                  stores.map((row, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.tr, idx % 2 === 1 && styles.trEven]}
                      onPress={() => openStoreMaps(row)}
                    >
                      <View style={[styles.td, styles.colStore]}>
                        <Text style={styles.storeName}>{row.store_name}</Text>
                        <Text style={styles.storeType}>{row.store_type}</Text>
                      </View>
                      <Text style={[styles.td, styles.colArea, styles.tdArea]}>
                        📍 {row.area}, {row.district}
                      </Text>
                      <Text style={[styles.td, styles.colCrop, styles.tdCrop]}>{row.crop}</Text>
                      <Text style={[styles.td, styles.colPrice, styles.tdMandi]}>
                        ₹{row.mandi_price_per_kg}
                      </Text>
                      <Text style={[styles.td, styles.colPrice, styles.tdRetail]}>
                        ₹{row.retail_price_per_kg}
                      </Text>
                      <View style={[styles.td, styles.colMarkup]}>
                        <View style={styles.markupBadge}>
                          <Text style={styles.markupBadgeText}>+{row.markup_percentage}%</Text>
                        </View>
                      </View>
                      <Text style={[styles.td, styles.colStock, styles.tdStock]}>
                        {row.stock_status}
                      </Text>
                      <TouchableOpacity
                        style={styles.mapActionBtn}
                        onPress={() => openStoreMaps(row)}
                      >
                        <Text style={styles.mapActionBtnText}>📍 Find Map</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
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
    marginBottom: 30,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  sub: {
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
  filterTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
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
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  chipActiveSecondary: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  chipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#0369A1',
    fontWeight: '800',
  },
  chipTextActiveSecondary: {
    color: '#15803D',
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sumLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  sumValRetail: {
    color: '#0284C7',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  sumValMandi: {
    color: '#16A34A',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  sumValMargin: {
    color: '#D97706',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  sumValStores: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  sumSub: {
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
  tableHeaderRow: {
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
    minWidth: 840,
  },
  thRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#BAE6FD',
  },
  th: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '800',
  },
  tr: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  trEven: {
    backgroundColor: '#F8FAFC',
  },
  td: {
    color: '#334155',
    fontSize: 12,
  },
  colStore: { width: 180 },
  colArea: { width: 140 },
  colCrop: { width: 80 },
  colPrice: { width: 100, textAlign: 'right' },
  colMarkup: { width: 100, alignItems: 'center' },
  colStock: { width: 110, textAlign: 'center' },
  colAction: { width: 120, alignItems: 'center' },

  storeName: { fontWeight: '800', color: '#0F172A', fontSize: 13 },
  storeType: { color: '#64748B', fontSize: 10 },
  tdArea: { fontWeight: '600', color: '#475569' },
  tdCrop: { fontWeight: '700', color: '#0284C7' },
  tdMandi: { color: '#16A34A', fontWeight: '700' },
  tdRetail: { color: '#0369A1', fontWeight: '800' },
  markupBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  markupBadgeText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
  },
  tdStock: { color: '#166534', fontWeight: '700', fontSize: 11 },
  mapActionBtn: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  mapActionBtnText: {
    color: '#0369A1',
    fontSize: 11,
    fontWeight: '800',
  },
  noDataRow: { padding: 20, alignItems: 'center' },
  noDataText: { color: '#94A3B8', fontSize: 13 },
});
