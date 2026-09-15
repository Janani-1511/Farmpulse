import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';


export default function WeatherForecast({ weather, recommendedMarketName, targetDate }) {
  const [expanded, setExpanded] = useState(false);

  // 1. UNAVAILABLE OR MISSING FORECAST CARD
  if (!weather || !weather.available) {
    return (
      <View style={styles.cardUnavailable}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>🌦️ WEATHER FORECAST</Text>
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableBadgeText}>Forecast Unavailable</Text>
          </View>
        </View>

        <Text style={styles.marketSub}>
          Recommended Market: <Text style={styles.boldText}>{recommendedMarketName || 'Selected Market'}</Text> • Selling Date: <Text style={styles.boldText}>{targetDate}</Text>
        </Text>

        <View style={styles.unavailableBody}>
          <Text style={styles.unavailableIcon}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.unavailableTitle}>
              {weather?.message || 'Reliable weather forecast is not available for the selected selling date.'}
            </Text>
            <Text style={styles.unavailableSub}>
              {weather?.reason || 'Weather forecasts are available only within the supported forecast period (14-day window). Market price prediction and revenue estimation continue normally.'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // 2. REAL WEATHER FORECAST CARD
  const riskColorMap = {
    Low: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
    Medium: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
    High: { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
  };

  const riskStyle = riskColorMap[weather.weather_risk] || riskColorMap.Low;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>🌦️ WEATHER FORECAST</Text>
        <View style={[styles.riskBadge, { backgroundColor: riskStyle.bg, borderColor: riskStyle.border }]}>
          <Text style={[styles.riskBadgeText, { color: riskStyle.text }]}>
            ⚠️ Risk: {weather.weather_risk}
          </Text>
        </View>
      </View>

      <Text style={styles.marketSub}>
        📍 Recommended Market: <Text style={styles.boldText}>{weather.location || recommendedMarketName}</Text> • 📅 Date: <Text style={styles.boldText}>{weather.date || targetDate}</Text>
      </Text>

      {/* METRICS GRID */}
      <View style={styles.metricsGrid}>
        {/* Temp */}
        <View style={styles.metricItem}>
          <Text style={styles.metricIcon}>🌡️</Text>
          <Text style={styles.metricValue}>{weather.temperature_c}°C</Text>
          <Text style={styles.metricLabel}>Max Temp ({weather.temperature_min_c || 20}°C Min)</Text>
        </View>

        {/* Rain Prob */}
        <View style={styles.metricItem}>
          <Text style={styles.metricIcon}>🌧️</Text>
          <Text style={styles.metricValue}>{weather.rain_probability}%</Text>
          <Text style={styles.metricLabel}>Rain Prob ({weather.rainfall_mm}mm)</Text>
        </View>

        {/* Extended Metrics shown when expanded */}
        {expanded ? (
          <>
            {/* Humidity */}
            <View style={styles.metricItem}>
              <Text style={styles.metricIcon}>💧</Text>
              <Text style={styles.metricValue}>{weather.humidity}%</Text>
              <Text style={styles.metricLabel}>Relative Humidity</Text>
            </View>

            {/* Wind Speed */}
            <View style={styles.metricItem}>
              <Text style={styles.metricIcon}>💨</Text>
              <Text style={styles.metricValue}>{weather.wind_speed} km/h</Text>
              <Text style={styles.metricLabel}>Wind Speed</Text>
            </View>
          </>
        ) : null}
      </View>

      {/* Expand / Collapse Toggle Button */}
      <TouchableOpacity style={styles.toggleBtn} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.toggleBtnText}>
          {expanded ? '🔼 Hide Secondary Weather Metrics' : '🔽 View Complete Humidity & Wind Details'}
        </Text>
      </TouchableOpacity>

      {/* CONDITION BANNER */}
      <View style={styles.conditionBanner}>
        <Text style={styles.conditionIcon}>☁️</Text>
        <Text style={styles.conditionText}>
          Forecasted Condition: <Text style={styles.boldText}>{weather.weather_condition}</Text>
        </Text>
      </View>

      {/* WEATHER IMPACT SECTION */}
      <View style={styles.impactContainer}>
        <Text style={styles.impactTitle}>WEATHER IMPACT</Text>
        <Text style={styles.impactBody}>
          "{weather.impact_assessment || 'Weather conditions may affect transportation and market arrivals.'}"
        </Text>
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
    borderColor: '#38BDF8',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardUnavailable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  marketSub: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 14,
  },
  boldText: {
    fontWeight: '800',
    color: '#0F172A',
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0369A1',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  conditionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleBtn: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  toggleBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '800',
  },

  conditionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  conditionText: {
    color: '#334155',
    fontSize: 12,
  },
  impactContainer: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
  },
  impactTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0369A1',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  impactBody: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  unavailableBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  unavailableBadgeText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },
  unavailableBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  unavailableIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  unavailableTitle: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  unavailableSub: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
  },
});
