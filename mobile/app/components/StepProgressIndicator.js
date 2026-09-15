import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function StepProgressIndicator({ crop, quantity, location, targetDate }) {
  const steps = [
    { num: 1, title: 'Crop', completed: !!crop },
    { num: 2, title: 'Quantity', completed: quantity > 0 },
    { num: 3, title: 'Location', completed: !!location?.latitude && !!location?.longitude },
    { num: 4, title: 'Date', completed: !!targetDate },
    { num: 5, title: 'Analyze', completed: false },
  ];

  const completedCount = steps.filter((s) => s.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.trackerTitle}>MARKET ANALYSIS WORKFLOW</Text>
        <Text style={styles.trackerStepText}>Step {Math.min(5, completedCount + 1)} of 5</Text>
      </View>

      {/* Progress Line */}
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${Math.min(100, (completedCount / 4) * 100)}%` }]} />
      </View>

      {/* Step Badges */}
      <View style={styles.stepsRow}>
        {steps.map((step) => (
          <View key={step.num} style={styles.stepCol}>
            <View style={[styles.stepCircle, step.completed && styles.stepCircleCompleted]}>
              <Text style={[styles.stepNum, step.completed && styles.stepNumCompleted]}>
                {step.completed ? '✓' : step.num}
              </Text>
            </View>
            <Text style={[styles.stepTitle, step.completed && styles.stepTitleCompleted]}>
              {step.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackerTitle: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  trackerStepText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '800',
  },
  barBackground: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 14,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepCol: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleCompleted: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  stepNumCompleted: {
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  stepTitleCompleted: {
    color: '#059669',
    fontWeight: '800',
  },
});
