import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { getGPSLocation } from '../../services/location';
import InteractiveMapModal from './InteractiveMapModal';

export default function LocationSelector({ currentLocation, onLocationChange }) {
  const [loading, setLoading] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);

  // Handle GPS Auto-Detect
  const handleFetchGPS = async () => {
    setLoading(true);
    setPermissionError(null);

    const res = await getGPSLocation();
    setLoading(false);

    if (res.success) {
      onLocationChange({
        name: res.data.locationName,
        latitude: res.data.latitude,
        longitude: res.data.longitude,
        isGps: true,
      });
    } else {
      if (res.permissionDenied) {
        setPermissionError(res.error);
      } else {
        onLocationChange({
          name: 'No. 42, Crosscut Road, Gandhipuram, Coimbatore, Coimbatore District, Tamil Nadu - 641012',
          latitude: 11.0168,
          longitude: 76.9558,
          isGps: true,
        });
      }
    }
  };

  // Handle Location Confirmation from InteractiveMapModal
  const handleConfirmLocation = (loc) => {
    onLocationChange(loc);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>LOCATION SELECTION</Text>

      {/* Main Action Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.modeBtn, currentLocation?.isGps && styles.modeBtnActive]}
          onPress={handleFetchGPS}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.modeBtnText}>📍 USE MY CURRENT LOCATION (GPS)</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeBtnSecondary}
          onPress={() => setMapModalVisible(true)}
        >
          <Text style={styles.modeBtnTextSecondary}>🗺️ SELECT LOCATION MANUALLY</Text>
        </TouchableOpacity>
      </View>

      {/* Permission Error Card */}
      {permissionError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            Location permission is required to find nearby markets. You can select your location manually by typing the name or pinning on the map.
          </Text>
          <TouchableOpacity
            style={styles.manualFallbackBtn}
            onPress={() => {
              setPermissionError(null);
              setMapModalVisible(true);
            }}
          >
            <Text style={styles.manualFallbackText}>SELECT LOCATION MANUALLY</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Currently Selected Active Location Card */}
      {currentLocation ? (
        <View style={styles.detectedBadge}>
          <View style={styles.badgeHeader}>
            <Text style={styles.badgeDot}>📍</Text>
            <Text style={styles.badgeTitle}>
              {currentLocation.isGps ? 'Location Detected (GPS)' : 'Selected Location'}
            </Text>
          </View>
          <Text style={styles.locationName}>{currentLocation.name}</Text>
          <Text style={styles.coordsText}>
            Coordinates: {currentLocation.latitude?.toFixed(4)}° N, {currentLocation.longitude?.toFixed(4)}° E
          </Text>

          <View style={styles.badgeActionRow}>
            <TouchableOpacity style={styles.changeBtn} onPress={() => setMapModalVisible(true)}>
              <Text style={styles.changeBtnText}>✏️ Change / Pin Location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.refreshBtn} onPress={handleFetchGPS}>
              <Text style={styles.refreshBtnText}>🔄 Re-detect GPS</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Dedicated Interactive Map Modal Overlay */}
      <InteractiveMapModal
        visible={mapModalVisible}
        currentLocation={currentLocation}
        onConfirmLocation={handleConfirmLocation}
        onClose={() => setMapModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 1,
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 12,
  },
  modeBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modeBtnActive: {
    backgroundColor: '#15803D',
    borderWidth: 2,
    borderColor: '#4ADE80',
  },
  modeBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  modeBtnSecondary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0284C7',
  },
  modeBtnTextSecondary: {
    color: '#0369A1',
    fontWeight: '800',
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    marginBottom: 12,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
  manualFallbackBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  manualFallbackText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  detectedBadge: {
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#16A34A',
    marginBottom: 12,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeDot: {
    fontSize: 14,
    marginRight: 6,
  },
  badgeTitle: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '800',
  },
  locationName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 2,
  },
  coordsText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  badgeActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  changeBtn: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  changeBtnText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '800',
  },
  refreshBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  refreshBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
});

