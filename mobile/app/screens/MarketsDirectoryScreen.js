import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';

const MARKETS_LIST = [
  {
    name: 'Coimbatore Central Market',
    searchQuery: 'Coimbatore Central Market, MGR Wholesale Market, Coimbatore, Tamil Nadu',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    latitude: 11.0168,
    longitude: 76.9558,
    coords: '11.0168° N, 76.9558° E',
    type: 'Wholesale Regulated Market',
    crops: ['Tomato', 'Potato', 'Onion', 'Chilly', 'Rice', 'Wheat', 'Maize'],
  },
  {
    name: 'Pollachi Agricultural Market',
    searchQuery: 'Pollachi Uzhavar Sandhai Vegetable Market, Pollachi, Tamil Nadu',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    latitude: 10.6609,
    longitude: 77.0048,
    coords: '10.6609° N, 77.0048° E',
    type: 'Regulated Farmer Market (Uzhavar Sandhai)',
    crops: ['Tomato', 'Coconut', 'Onion', 'Chilly', 'Maize', 'Cotton'],
  },
  {
    name: 'Mettupalayam Produce Yard',
    searchQuery: 'Mettupalayam Vegetable Market Yard, Mettupalayam, Tamil Nadu',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    latitude: 11.2996,
    longitude: 76.9400,
    coords: '11.2996° N, 76.9400° E',
    type: 'Vegetable & Spices Hub',
    crops: ['Tomato', 'Potato', 'Chilly', 'Onion'],
  },
  {
    name: 'Tiruppur District Commodity Market',
    searchQuery: 'Tiruppur Regulated Market Yard, Tiruppur, Tamil Nadu',
    district: 'Tiruppur',
    state: 'Tamil Nadu',
    latitude: 11.1085,
    longitude: 77.3411,
    coords: '11.1085° N, 77.3411° E',
    type: 'Wholesale Market',
    crops: ['Tomato', 'Cotton', 'Maize', 'Rice', 'Onion'],
  },
  {
    name: 'Erode Turmeric & Grain Market',
    searchQuery: 'Erode Semmathur Turmeric Market Yard, Erode, Tamil Nadu',
    district: 'Erode',
    state: 'Tamil Nadu',
    latitude: 11.3410,
    longitude: 77.7172,
    coords: '11.3410° N, 77.7172° E',
    type: 'Major Terminal Market',
    crops: ['Tomato', 'Turmeric', 'Rice', 'Maize', 'Onion', 'Chilly'],
  },
  {
    name: 'Salem APMC Market',
    searchQuery: 'Salem Regulated Market Yard, Salem, Tamil Nadu',
    district: 'Salem',
    state: 'Tamil Nadu',
    latitude: 11.6643,
    longitude: 78.1460,
    coords: '11.6643° N, 78.1460° E',
    type: 'Wholesale Agricultural Yard',
    crops: ['Tomato', 'Potato', 'Onion', 'Rice', 'Wheat'],
  },
  {
    name: 'Madurai Mattuthavani Market',
    searchQuery: 'Mattuthavani Central Vegetable Market, Madurai, Tamil Nadu',
    district: 'Madurai',
    state: 'Tamil Nadu',
    latitude: 9.9252,
    longitude: 78.1198,
    coords: '9.9252° N, 78.1198° E',
    type: 'Integrated Farmers Market',
    crops: ['Tomato', 'Onion', 'Chilly', 'Rice', 'Cotton'],
  },
  {
    name: 'Dindigul Vegetable Market',
    searchQuery: 'Dindigul Central Vegetable Market, Dindigul, Tamil Nadu',
    district: 'Dindigul',
    state: 'Tamil Nadu',
    latitude: 10.3673,
    longitude: 77.9803,
    coords: '10.3673° N, 77.9803° E',
    type: 'District Agricultural Market',
    crops: ['Tomato', 'Onion', 'Potato', 'Chilly'],
  },
];

export default function MarketsDirectoryScreen() {
  const openGoogleMaps = (mkt) => {
    // Exact Market Place Location Query
    const placeQuery = mkt.searchQuery || `${mkt.name}, ${mkt.district}, ${mkt.state}`;
    const encodedQuery = encodeURIComponent(placeQuery);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
    
    if (typeof window !== 'undefined' && window.open) {
      window.open(mapsUrl, '_blank');
    } else {
      Linking.openURL(mapsUrl);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>🏢 REGIONAL AGRICULTURAL MARKETS NETWORK</Text>
        <Text style={styles.sub}>
          Tap any market to view its exact place location, photos, and driving directions on Google Maps
        </Text>
      </View>

      <View style={styles.grid}>
        {MARKETS_LIST.map((mkt, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.marketCard}
            onPress={() => openGoogleMaps(mkt)}
          >
            <View style={styles.badgeRow}>
              <Text style={styles.typeBadge}>{mkt.type}</Text>
            </View>

            <Text style={styles.marketName}>{mkt.name}</Text>
            <Text style={styles.districtText}>
              📍 {mkt.district}, {mkt.state} ({mkt.coords})
            </Text>

            <Text style={styles.cropsLabel}>Supported Crops:</Text>
            <View style={styles.cropTagRow}>
              {mkt.crops.map((c, cIdx) => (
                <View key={cIdx} style={styles.cropTag}>
                  <Text style={styles.cropTagText}>{c}</Text>
                </View>
              ))}
            </View>

            {/* Google Maps Action Link Button */}
            <TouchableOpacity
              style={styles.mapsBtn}
              onPress={() => openGoogleMaps(mkt)}
            >
              <Text style={styles.mapsBtnText}>📍 Open Market Location in Google Maps →</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
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
    color: '#15803D',
    letterSpacing: 0.5,
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  marketCard: {
    width: '48%',
    minWidth: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  marketName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  districtText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 12,
  },
  cropsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 6,
  },
  cropTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 14,
  },
  cropTag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cropTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  mapsBtn: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  mapsBtnText: {
    color: '#0369A1',
    fontWeight: '800',
    fontSize: 12,
  },
});
