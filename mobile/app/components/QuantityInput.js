import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

const PRESETS = [5, 10, 20, 50, 100];

export default function QuantityInput({ quantity, onChangeQuantity }) {
  const handleNumChange = (val) => {
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      onChangeQuantity(parsed);
    } else if (val === '') {
      onChangeQuantity('');
    }
  };

  const adjustQty = (delta) => {
    const current = typeof quantity === 'number' ? quantity : 0;
    const updated = Math.max(1, current + delta);
    onChangeQuantity(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>STEP 02</Text>
        </View>
        <Text style={styles.label}>ENTER QUANTITY (QUINTALS)</Text>
      </View>

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.stepBtn} onPress={() => adjustQty(-5)}>
          <Text style={styles.stepBtnText}>-5</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stepBtn} onPress={() => adjustQty(-1)}>
          <Text style={styles.stepBtnText}>-1</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantity !== null && quantity !== undefined ? String(quantity) : ''}
          onChangeText={handleNumChange}
          placeholder="20"
          placeholderTextColor="#94A3B8"
        />

        <TouchableOpacity style={styles.stepBtn} onPress={() => adjustQty(1)}>
          <Text style={styles.stepBtnText}>+1</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stepBtn} onPress={() => adjustQty(5)}>
          <Text style={styles.stepBtnText}>+5</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.presetRow}>
        <Text style={styles.presetLabel}>Quick Presets:</Text>
        {PRESETS.map((val) => (
          <TouchableOpacity
            key={val}
            style={[styles.presetChip, quantity === val && styles.presetChipSelected]}
            onPress={() => onChangeQuantity(val)}
            activeOpacity={0.8}
          >
            <Text style={[styles.presetText, quantity === val && styles.presetTextSelected]}>
              {val} Quintals
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  stepBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginHorizontal: 2,
    minWidth: 36,
    alignItems: 'center',
  },
  stepBtnText: {
    color: '#0284C7',
    fontWeight: '800',
    fontSize: 12,
  },
  input: {
    flex: 1,
    minWidth: 60,
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginHorizontal: 4,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  presetChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  presetChipSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  presetText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  presetTextSelected: {
    color: '#0369A1',
    fontWeight: '800',
  },
});
