import React, { useEffect, useRef, useImperativeHandle, forwardRef, memo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const OptimizedMapPicker = forwardRef(({ initialCenter, zoomLevel, onMoveStart, onMoveEnd, onRecenterGPS }, ref) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const currentCenterRef = useRef(initialCenter);

  // Expose imperative map controls to parent without triggering React re-renders
  useImperativeHandle(ref, () => ({
    flyTo: (lat, lon, zoom = 14) => {
      if (leafletMapRef.current) {
        leafletMapRef.current.flyTo([lat, lon], zoom, { duration: 1.2 });
      }
    },
    zoomIn: () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.zoomIn();
      }
    },
    zoomOut: () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.zoomOut();
      }
    },
    getCurrentCenter: () => currentCenterRef.current,
  }));

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Load Leaflet CSS dynamically if not present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS dynamically if not present
    const initLeafletMap = () => {
      if (leafletMapRef.current) return;

      const L = window.L;
      if (!L || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [initialCenter.latitude, initialCenter.longitude],
        zoom: zoomLevel || 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;

      // Event 1: move (drag/pan/zoom) -> update ref ONLY (0 React re-renders)
      map.on('movestart', () => {
        if (onMoveStart) onMoveStart();
      });

      map.on('move', () => {
        const center = map.getCenter();
        currentCenterRef.current = { latitude: center.lat, longitude: center.lng };
      });

      // Event 2: moveend -> notify parent ONCE to trigger debounced geocode
      map.on('moveend', () => {
        const center = map.getCenter();
        currentCenterRef.current = { latitude: center.lat, longitude: center.lng };
        if (onMoveEnd) {
          onMoveEnd({ latitude: center.lat, longitude: center.lng });
        }
      });
    };

    if (window.L) {
      initLeafletMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initLeafletMap;
      document.head.appendChild(script);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <View style={styles.mapViewportContainer}>
      {/* Instructions Overlay */}
      <View style={styles.instructionPill} pointerEvents="none">
        <Text style={styles.instructionText}>👇 Move the map underneath the pin</Text>
      </View>

      {/* Uncontrolled Leaflet Map Container */}
      {typeof window !== 'undefined' ? (
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
        />
      ) : (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>MAP AREA (TAMIL NADU REGION)</Text>
        </View>
      )}

      {/* FIXED VISUAL CENTER PIN (Pointer events disabled) */}
      <View style={styles.fixedCenterPinWrapper} pointerEvents="none">
        <View style={styles.pinBubble}>
          <Text style={styles.pinBubbleIcon}>📍</Text>
        </View>
        <View style={styles.pinShadow} />
      </View>

      {/* FLOATING ACTION CONTROLS */}
      <View style={styles.floatingControlsContainer}>
        <TouchableOpacity style={styles.floatingBtn} onPress={onRecenterGPS}>
          <Text style={styles.floatingBtnIcon}>📍</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => leafletMapRef.current && leafletMapRef.current.zoomIn()}
        >
          <Text style={styles.floatingBtnText}>➕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => leafletMapRef.current && leafletMapRef.current.zoomOut()}
        >
          <Text style={styles.floatingBtnText}>➖</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  mapViewportContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E0F2FE',
  },
  instructionPill: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#0369A1',
    fontWeight: '800',
    fontSize: 14,
  },
  fixedCenterPinWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  pinBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  pinBubbleIcon: {
    fontSize: 22,
  },
  pinShadow: {
    width: 8,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    marginTop: 2,
  },
  floatingControlsContainer: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    gap: 10,
    zIndex: 15,
  },
  floatingBtn: {
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingBtnIcon: {
    fontSize: 20,
  },
  floatingBtnText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '800',
  },
});

export default memo(OptimizedMapPicker);
