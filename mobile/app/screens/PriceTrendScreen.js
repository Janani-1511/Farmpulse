import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getPriceTrend } from '../../services/api';
import InteractiveTrendChart from '../components/InteractiveTrendChart';

const CROPS = [
  'Tomato',
  'Potato',
  'Onion',
  'Rice',
  'Wheat',
  'Chilly',
  'Maize',
  'Cotton',
  'Turmeric',
  'Coconut',
];

const MARKETS = [
  { id: 'mkt_coimbatore', name: 'Coimbatore Central Market' },
  { id: 'mkt_pollachi', name: 'Pollachi Agricultural Market' },
  { id: 'mkt_mettupalayam', name: 'Mettupalayam Produce Yard' },
  { id: 'mkt_tiruppur', name: 'Tiruppur District Commodity Market' },
  { id: 'mkt_erode', name: 'Erode Turmeric & Grain Market' },
  { id: 'mkt_salem', name: 'Salem APMC Market' },
  { id: 'mkt_madurai', name: 'Madurai Mattuthavani Market' },
  { id: 'mkt_dindigul', name: 'Dindigul Vegetable Market' },
];

const HISTORICAL_OPTIONS = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 3 Months', value: 90 },
  { label: 'Last 6 Months', value: 180 },
  { label: 'Last 1 Year', value: 365 },
  { label: 'All Available Data', value: -1 },
];

const FUTURE_OPTIONS = [
  { label: 'Next 7 Days', value: 7 },
  { label: 'Next 15 Days', value: 15 },
  { label: 'Next 30 Days', value: 30 },
];

export default function PriceTrendScreen({ initialCrop, initialMarketId, onNavigate }) {
  const [crop, setCrop] = useState(initialCrop || 'Tomato');
  const [marketId, setMarketId] = useState(initialMarketId || 'mkt_coimbatore');
  const [historicalDays, setHistoricalDays] = useState(30);
  const [futureDays, setFutureDays] = useState(15);

  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Price Unit State: 'kg' or 'quintal'
  const [unit, setUnit] = useState('kg');

  useEffect(() => {
    fetchTrendData();
  }, [crop, marketId, historicalDays, futureDays]);

  const fetchTrendData = async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await getPriceTrend(crop, marketId, historicalDays, futureDays);
    setLoading(false);

    if (res.success && res.data) {
      setTrendData(res.data);
    } else {
      setErrorMsg(res.error || 'Unable to load price trend data. Please try again.');
    }
  };

  const getPriceVal = (kgVal, qVal) => (unit === 'kg' ? `₹${kgVal}/kg` : `₹${qVal?.toLocaleString('en-IN')}/quintal`);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>📈 MARKET TREND INTELLIGENCE</Text>
        </View>
        <Text style={styles.headerTitle}>Price Trend Analysis</Text>
        <Text style={styles.headerSubtitle}>
          Real Agmarknet Historical Market Records + ML Model Future Price Predictions
        </Text>
      </View>

      {/* Filter Selection Panel */}
      <View style={styles.filtersCard}>
        <Text style={styles.filterSectionTitle}>⚙️ SELECT CROP, MARKET & TIME PERIODS</Text>

        <View style={styles.filterGrid}>
          {/* Crop Selector */}
          <View style={styles.filterCol}>
            <Text style={styles.filterLabel}>Select Crop:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {CROPS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chipBtn, crop === c && styles.chipBtnActive]}
                  onPress={() => setCrop(c)}
                >
                  <Text style={[styles.chipText, crop === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Market Selector */}
          <View style={styles.filterCol}>
            <Text style={styles.filterLabel}>Select Market:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {MARKETS.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.chipBtn, marketId === m.id && styles.chipBtnActive]}
                  onPress={() => setMarketId(m.id)}
                >
                  <Text style={[styles.chipText, marketId === m.id && styles.chipTextActive]}>
                    {m.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Historical Period Selector */}
          <View style={styles.filterCol}>
            <Text style={styles.filterLabel}>Historical Period:</Text>
            <View style={styles.optionRow}>
              {HISTORICAL_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optBtn,
                    historicalDays === opt.value && styles.optBtnActive,
                  ]}
                  onPress={() => setHistoricalDays(opt.value)}
                >
                  <Text
                    style={[
                      styles.optText,
                      historicalDays === opt.value && styles.optTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Future Prediction Period Selector */}
          <View style={styles.filterCol}>
            <Text style={styles.filterLabel}>Future Prediction Period (ML Forecast):</Text>
            <View style={styles.optionRow}>
              {FUTURE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optBtn,
                    futureDays === opt.value && styles.optBtnActive,
                  ]}
                  onPress={() => setFutureDays(opt.value)}
                >
                  <Text
                    style={[
                      styles.optText,
                      futureDays === opt.value && styles.optTextActive,
                    ]}
                  >
                    🤖 {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Main Content & Graph */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingTitle}>Analyzing Market Price Trend...</Text>
          <Text style={styles.loadingSub}>
            Fetching real historical records & running ML forecast model...
          </Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchTrendData}>
            <Text style={styles.retryBtnText}>🔄 Retry Analysis</Text>
          </TouchableOpacity>
        </View>
      ) : !trendData || !trendData.has_data ? (
        <View style={styles.insufficientDataBox}>
          <Text style={styles.insufficientIcon}>📊</Text>
          <Text style={styles.insufficientTitle}>Insufficient Data Available</Text>
          <Text style={styles.insufficientMsg}>
            {trendData?.message ||
              'Insufficient historical market data is available to generate a reliable trend analysis for this selection.'}
          </Text>
        </View>
      ) : (
        <View>
          {/* Latest Available Market Price Banner */}
          <View style={styles.latestPriceCard}>
            <View style={styles.latestPriceHeader}>
              <View style={styles.pulseDot} />
              <Text style={styles.latestBadgeText}>LATEST AVAILABLE MARKET PRICE</Text>
            </View>
            <View style={styles.latestValueRow}>
              <Text style={styles.latestPriceValue}>
                {getPriceVal(
                  trendData.latest_available_price.price_kg,
                  trendData.latest_available_price.price_quintal
                )}
              </Text>

              <View style={styles.latestMeta}>
                <Text style={styles.latestDateText}>
                  📅 Market Date: {trendData.latest_available_price.date}
                </Text>
                <Text style={styles.latestNotice}>
                  Verified real market data from {trendData.market_name}
                </Text>
              </View>
            </View>
          </View>

          {/* Dynamic Trend Summary Banner */}
          <View
            style={[
              styles.summaryBanner,
              trendData.summary.trend_direction === 'UPWARD'
                ? styles.summaryUp
                : trendData.summary.trend_direction === 'DOWNWARD'
                ? styles.summaryDown
                : styles.summaryStable,
            ]}
          >
            <Text style={styles.summaryTitle}>{trendData.summary.trend_label}</Text>
            <Text style={styles.summaryMessage}>{trendData.summary.trend_message}</Text>
          </View>

          {/* Interactive Line Chart */}
          <InteractiveTrendChart
            historicalPoints={trendData.historical_points}
            predictedPoints={trendData.predicted_points}
            latestDate={trendData.latest_available_price.date}
            unit={unit}
            onUnitToggle={setUnit}
          />

          {/* Key Insights Grid */}
          <View style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>💡 KEY TREND INSIGHTS</Text>

            <View style={styles.insightsGrid}>
              <View style={styles.insightTile}>
                <Text style={styles.tileLabel}>Highest Price (Historical)</Text>
                <Text style={styles.tileVal}>
                  {getPriceVal(
                    trendData.summary.highest_price_kg,
                    trendData.summary.highest_price_quintal
                  )}
                </Text>
              </View>

              <View style={styles.insightTile}>
                <Text style={styles.tileLabel}>Lowest Price (Historical)</Text>
                <Text style={styles.tileVal}>
                  {getPriceVal(
                    trendData.summary.lowest_price_kg,
                    trendData.summary.lowest_price_quintal
                  )}
                </Text>
              </View>

              <View style={styles.insightTile}>
                <Text style={styles.tileLabel}>Average Historical Price</Text>
                <Text style={styles.tileVal}>
                  {getPriceVal(
                    trendData.summary.avg_historical_price_kg,
                    trendData.summary.avg_historical_price_quintal
                  )}
                </Text>
              </View>

              <View style={styles.insightTile}>
                <Text style={styles.tileLabel}>Latest Available Price</Text>
                <Text style={styles.tileValGreen}>
                  {getPriceVal(
                    trendData.summary.latest_price_kg,
                    trendData.summary.latest_price_quintal
                  )}
                </Text>
              </View>

              <View style={styles.insightTile}>
                <Text style={styles.tileLabel}>ML Forecast (7 Days)</Text>
                <Text style={styles.tileValPred}>
                  {getPriceVal(
                    trendData.summary.pred_7d_kg,
                    trendData.summary.pred_7d_quintal
                  )}
                </Text>
              </View>

              <View style={styles.insightTile}>
                <Text style={styles.tileLabel}>ML Forecast (30 Days)</Text>
                <Text style={styles.tileValPred}>
                  {getPriceVal(
                    trendData.summary.pred_30d_kg,
                    trendData.summary.pred_30d_quintal
                  )}
                </Text>
              </View>

              <View style={[styles.insightTile, { width: '100%' }]}>
                <Text style={styles.tileLabel}>Expected Future Direction (ML Model)</Text>
                <Text style={styles.tileValBig}>{trendData.summary.expected_future_trend}</Text>
              </View>
            </View>
          </View>

          {/* Data Transparency Footer Card */}
          <View style={styles.transparencyCard}>
            <Text style={styles.transparencyTitle}>🛡️ DATA TRANSPARENCY & METHODOLOGY</Text>

            <View style={styles.transparencyGrid}>
              <View style={styles.transRow}>
                <Text style={styles.transLabel}>Data Source:</Text>
                <Text style={styles.transVal}>{trendData.transparency.data_source}</Text>
              </View>

              <View style={styles.transRow}>
                <Text style={styles.transLabel}>Historical Period:</Text>
                <Text style={styles.transVal}>
                  {trendData.transparency.historical_start_date} to{' '}
                  {trendData.transparency.historical_end_date}
                </Text>
              </View>

              <View style={styles.transRow}>
                <Text style={styles.transLabel}>Latest Available Market Date:</Text>
                <Text style={styles.transVal}>
                  {trendData.transparency.latest_available_date}
                </Text>
              </View>

              <View style={styles.transRow}>
                <Text style={styles.transLabel}>Future Prediction Pipeline:</Text>
                <Text style={styles.transVal}>
                  {trendData.transparency.prediction_model}
                </Text>
              </View>

              <View style={styles.transRow}>
                <Text style={styles.transLabel}>Supported Price Units:</Text>
                <Text style={styles.transVal}>
                  {trendData.transparency.supported_units.join(' and ')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#93C5FD',
    fontWeight: '600',
  },
  filtersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  filterGrid: {
    gap: 14,
  },
  filterCol: {
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  chipRow: {
    flexDirection: 'row',
  },
  chipBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipBtnActive: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0369A1',
  },
  optText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  optTextActive: {
    color: '#FFFFFF',
  },
  loadingBox: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
  },
  errorBox: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 14,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  insufficientDataBox: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  insufficientIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  insufficientTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#92400E',
    marginBottom: 6,
  },
  insufficientMsg: {
    fontSize: 13,
    color: '#B45309',
    textAlign: 'center',
    maxWidth: 500,
    lineHeight: 18,
  },
  latestPriceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    marginBottom: 16,
  },
  latestPriceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  latestBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  latestValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  latestPriceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  latestMeta: {
    alignItems: 'flex-end',
  },
  latestDateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  latestNotice: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  summaryBanner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  summaryUp: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  summaryDown: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  summaryStable: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  summaryMessage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 18,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
    marginBottom: 14,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightTile: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  tileVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  tileValGreen: {
    fontSize: 16,
    fontWeight: '900',
    color: '#16A34A',
  },
  tileValPred: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D97706',
  },
  tileValBig: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  transparencyCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  transparencyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 12,
  },
  transparencyGrid: {
    gap: 8,
  },
  transRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  transLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  transVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
});
