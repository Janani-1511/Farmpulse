import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  getGPSLocation,
  searchLocationByName,
  reverseGeocodeCoords,
} from '../../services/location';
import OptimizedMapPicker from './OptimizedMapPicker';
import LocationPreviewCard from './LocationPreviewCard';

export default function InteractiveMapModal({
  visible,
  currentLocation,
  onConfirmLocation,
  onClose,
}) {
  const mapPickerRef = useRef(null);

  // Active Selected Coordinates State
  const initialLat = currentLocation?.latitude || 11.0168;
  const initialLon = currentLocation?.longitude || 76.9558;

  const [selectedCoords, setSelectedCoords] = useState({
    latitude: initialLat,
    longitude: initialLon,
  });

  const [selectedAddress, setSelectedAddress] = useState(currentLocation?.name || 'Gandhipuram, Coimbatore');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // In-map Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // AbortController & Debounce Ref for Reverse Geocoding
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync state when modal becomes visible
  useEffect(() => {
    if (visible) {
      const lat = currentLocation?.latitude || 11.0168;
      const lon = currentLocation?.longitude || 76.9558;
      setSelectedCoords({ latitude: lat, longitude: lon });
      setSelectedAddress(currentLocation?.name || 'Selected Location');
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);

      if (mapPickerRef.current) {
        mapPickerRef.current.flyTo(lat, lon, 14);
      }
    }
  }, [visible, currentLocation]);

  // Handle map movement start (when user begins dragging)
  const handleMoveStart = useCallback(() => {
    setIsGeocoding(true);
    // Cancel pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    // Cancel pending HTTP request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Handle map movement end (when user finishes dragging/zooming)
  const handleMoveEnd = useCallback((center) => {
    const latFixed = parseFloat(center.latitude.toFixed(6));
    const lonFixed = parseFloat(center.longitude.toFixed(6));

    setSelectedCoords({ latitude: latFixed, longitude: lonFixed });
    setIsGeocoding(true);

    // 1. Cancel previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 2. Abort previous HTTP request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 3. Set new 600ms debounce timer
    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const addr = await reverseGeocodeCoords(latFixed, lonFixed, controller.signal);
      if (addr) {
        setSelectedAddress(addr);
      }
      setIsGeocoding(false);
    }, 600);
  }, []);

  // In-map Live Search Debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocationByName(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowSearchResults(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select Search Result -> Smooth Map FlyTo
  const handleSelectSearchResult = useCallback((item) => {
    setShowSearchResults(false);
    setSearchQuery(item.name.split(',')[0]);
    setSelectedCoords({ latitude: item.latitude, longitude: item.longitude });
    setSelectedAddress(item.name);
    setIsGeocoding(false);

    if (mapPickerRef.current) {
      mapPickerRef.current.flyTo(item.latitude, item.longitude, 15);
    }
  }, []);

  // Recenter Map on GPS Location
  const handleRecenterGPS = useCallback(async () => {
    setIsGeocoding(true);
    const res = await getGPSLocation();

    if (res.success) {
      const { latitude, longitude, locationName } = res.data;
      setSelectedCoords({ latitude, longitude });
      setSelectedAddress(locationName);
      setIsGeocoding(false);

      if (mapPickerRef.current) {
        mapPickerRef.current.flyTo(latitude, longitude, 15);
      }
    } else {
      setIsGeocoding(false);
    }
  }, []);

  // Confirm Final Selected Location
  const handleConfirm = useCallback(() => {
    onConfirmLocation({
      name: selectedAddress,
      latitude: selectedCoords.latitude,
      longitude: selectedCoords.longitude,
      isGps: false,
    });
    onClose();
  }, [onConfirmLocation, selectedAddress, selectedCoords, onClose]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* TOP BAR HEADER */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={styles.backBtnText}>← Select Location</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Interactive Map</Text>
        </View>

        {/* IN-MAP SEARCH BAR */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a city, area, address, or landmark..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {isSearching ? <ActivityIndicator size="small" color="#0284C7" style={{ marginRight: 8 }} /> : null}
            {searchQuery ? (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setShowSearchResults(false); }}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Autocomplete Suggestions Dropdown */}
          {showSearchResults && searchResults.length > 0 ? (
            <View style={styles.searchResultsDropdown}>
              <ScrollView style={styles.searchScroll} nestedScrollEnabled={true}>
                {searchResults.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.searchResultRow}
                    onPress={() => handleSelectSearchResult(item)}
                  >
                    <Text style={styles.searchResultName} numberOfLines={1}>📍 {item.name}</Text>
                    <Text style={styles.searchResultCoords}>
                      {item.latitude?.toFixed(4)}° N, {item.longitude?.toFixed(4)}° E
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        {/* UNCONTROLLED 60 FPS OPTIMIZED MAP PICKER */}
        <OptimizedMapPicker
          ref={mapPickerRef}
          initialCenter={{ latitude: initialLat, longitude: initialLon }}
          zoomLevel={14}
          onMoveStart={handleMoveStart}
          onMoveEnd={handleMoveEnd}
          onRecenterGPS={handleRecenterGPS}
        />

        {/* MEMOIZED LOCATION PREVIEW BOTTOM SHEET */}
        <LocationPreviewCard
          selectedAddress={selectedAddress}
          latitude={selectedCoords.latitude}
          longitude={selectedCoords.longitude}
          isGeocoding={isGeocoding}
          onRecenterGPS={handleRecenterGPS}
          onConfirm={handleConfirm}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    height: 54,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  backBtnText: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '800',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
    zIndex: 10,
  },
  searchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  clearSearchText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  searchResultsDropdown: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    maxHeight: 220,
    zIndex: 20,
  },
  searchScroll: {
    maxHeight: 210,
  },
  searchResultRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchResultName: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  searchResultCoords: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
});
