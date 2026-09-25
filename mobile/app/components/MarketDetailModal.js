import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';

export default function MarketDetailModal({ visible, market, crop, quantity, onClose }) {
  if (!market) return null;

  const openGoogleMaps = () => {
    const placeQuery = `${market.market_name}, ${market.district}, ${market.state}`;
    const encodedQuery = encodeURIComponent(placeQuery);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
    
    if (typeof window !== 'undefined' && window.open) {
      window.open(mapsUrl, '_blank');
    } else {
      Linking.openURL(mapsUrl);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.marketTitle}>{market.market_name}</Text>
              <Text style={styles.marketSub}>
                {market.district}, {market.state} • {market.market_type}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            {/* Distance & Predicted Price Highlights */}
            <View style={styles.badgeRow}>
              <View style={styles.badgeBox}>
                <Text style={styles.badgeLabel}>
                  {market.distance_type === 'estimated' ? 'Est. Distance (Haversine)' : 'Road Distance (OSRM)'}
                </Text>
                <Text style={styles.badgeVal}>{market.distance_km} km</Text>
              </View>
              <View style={styles.badgeBox}>
                <Text style={styles.badgeLabel}>Predicted Price (ML Model)</Text>
                <Text style={styles.badgeValHighlight}>₹{market.predicted_price?.toLocaleString('en-IN')}/q</Text>
              </View>
            </View>

            {/* Weather Forecast Section */}
            {market.weather ? (
              <View style={styles.weatherCard}>
                <Text style={styles.weatherTitle}>🌤️ LIVE WEATHER FORECAST FOR TARGET DATE</Text>
                <Text style={styles.weatherBody}>{market.weather.weather_summary}</Text>
                <Text style={styles.weatherDisclaimer}>{market.weather.disclaimer}</Text>
              </View>
            ) : null}

            {/* Google Maps Directions Action Button */}
            <TouchableOpacity style={styles.mapsBtn} onPress={openGoogleMaps}>
              <Text style={styles.mapsBtnText}>🗺️ Open Location in Google Maps for Driving Directions →</Text>
            </TouchableOpacity>

            {/* Financial Breakdown Table */}
            <Text style={styles.sectionHeader}>FINANCIAL BREAKDOWN ({crop} - {quantity} Quintals)</Text>

            <View style={styles.breakdownTable}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Current Real Market Price:</Text>
                <Text style={styles.rowVal}>₹{market.current_price?.toLocaleString('en-IN')} / quintal</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Predicted ML Target Price:</Text>
                <Text style={styles.rowValPred}>₹{market.predicted_price?.toLocaleString('en-IN')} / quintal</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Quantity Being Sold:</Text>
                <Text style={styles.rowVal}>{quantity} Quintals</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Expected Gross Revenue:</Text>
                <Text style={styles.rowValGross}>₹{market.expected_revenue?.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>
                  {market.distance_type === 'estimated' ? 'Estimated Transport Cost (Haversine):' : 'Transport Cost (Road Route):'}
                </Text>
                <Text style={styles.rowValCost}>- ₹{market.transport_cost?.toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.rowTotal}>
                <Text style={styles.totalLabel}>Estimated Net Revenue:</Text>
                <Text style={styles.totalVal}>₹{market.estimated_net_revenue?.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <Text style={styles.disclaimerText}>
              Transport cost calculated at ₹25/km using {market.distance_method || (market.distance_type === 'estimated' ? 'Haversine straight-line estimation' : 'OSRM road driving distance routing')}. Gross revenue = ML predicted price × quantity.
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Close Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 999999,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    boxSizing: 'border-box',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  marketTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },
  marketSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    backgroundColor: '#F1F5F9',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  badgeBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeLabel: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '600',
  },
  badgeVal: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  badgeValHighlight: {
    color: '#15803D',
    fontSize: 16,
    fontWeight: '800',
  },
  mapsBtn: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  mapsBtnText: {
    color: '#0369A1',
    fontWeight: '800',
    fontSize: 12,
  },
  weatherCard: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  weatherTitle: {
    color: '#0369A1',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  weatherBody: {
    color: '#0C4A6E',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  weatherDisclaimer: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '500',
  },
  sectionHeader: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  breakdownTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
  },
  rowVal: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  rowValPred: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '800',
  },
  rowValGross: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  rowValCost: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  rowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    color: '#15803D',
    fontSize: 15,
    fontWeight: '800',
  },
  totalVal: {
    color: '#15803D',
    fontSize: 18,
    fontWeight: '800',
  },
  disclaimerText: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
  },
  doneBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
