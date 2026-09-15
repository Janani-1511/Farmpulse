import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

const CROPS = [
  { id: 'Tomato', name: 'Tomato 🍅', category: 'Vegetable' },
  { id: 'Potato', name: 'Potato 🥔', category: 'Vegetable' },
  { id: 'Onion', name: 'Onion 🧅', category: 'Vegetable' },
  { id: 'Chilly', name: 'Chilly 🌶️', category: 'Spice' },
  { id: 'Rice', name: 'Rice 🌾', category: 'Grain' },
  { id: 'Wheat', name: 'Wheat 🌾', category: 'Grain' },
  { id: 'Maize', name: 'Maize 🌽', category: 'Grain' },
  { id: 'Cotton', name: 'Cotton ☁️', category: 'Commercial' },
];

export default function CropSelector({ selectedCrop, onSelectCrop }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>STEP 01</Text>
        </View>
        <Text style={styles.label}>CHOOSE CROP</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {CROPS.map((item) => {
          const isSelected = selectedCrop === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={[styles.cropCard, isSelected && styles.cropCardSelected]}
              onPress={() => onSelectCrop(item.id)}
            >
              <Text style={[styles.cropText, isSelected && styles.cropTextSelected]}>
                {item.name}
              </Text>
              <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                {item.category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  stepBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  scroll: {
    paddingRight: 10,
  },
  cropCard: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    minWidth: 120,
  },
  cropCardSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  cropText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  cropTextSelected: {
    color: '#047857',
  },
  categoryText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  categoryTextSelected: {
    color: '#059669',
    fontWeight: '700',
  },
});
