import React, { memo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

function LocationPreviewCard({
  selectedAddress,
  latitude,
  longitude,
  isGeocoding,
  onRecenterGPS,
  onConfirm,
}) {
  return (
    <View style={styles.bottomSheet}>
      <Text style={styles.sheetHeader}>📍 SELECTED LOCATION</Text>

      <View style={styles.sheetContentRow}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          {isGeocoding ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
              <ActivityIndicator size="small" color="#0284C7" />
              <Text style={styles.geocodingText}> Finding location...</Text>
            </View>
          ) : (
            <Text style={styles.selectedAddressText} numberOfLines={2}>
              {selectedAddress || 'Selected Location'}
            </Text>
          )}

          <Text style={styles.selectedCoordsText}>
            Latitude: {latitude ? latitude.toFixed(6) : '0.000000'} • Longitude: {longitude ? longitude.toFixed(6) : '0.000000'}
          </Text>
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionBtnRow}>
        <TouchableOpacity style={styles.gpsActionBtn} onPress={onRecenterGPS}>
          <Text style={styles.gpsActionBtnText}>📍 Use My GPS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmActionBtn} onPress={onConfirm}>
          <Text style={styles.confirmActionBtnText}>✓ CONFIRM THIS LOCATION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sheetHeader: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sheetContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  selectedAddressText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  selectedCoordsText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  geocodingText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gpsActionBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  gpsActionBtnText: {
    color: '#334155',
    fontWeight: '800',
    fontSize: 13,
  },
  confirmActionBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
});

export default memo(LocationPreviewCard);
