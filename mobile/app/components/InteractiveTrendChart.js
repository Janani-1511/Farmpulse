import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';

export default function InteractiveTrendChart({
  historicalPoints = [],
  predictedPoints = [],
  latestDate = '',
  unit = 'kg', // 'kg' or 'quintal'
  onUnitToggle,
}) {
  const [activePoint, setActivePoint] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1); // 1, 1.5, 2

  const unitLabel = unit === 'kg' ? '₹/kg' : '₹/quintal';
  const getPrice = (pt) => (unit === 'kg' ? pt.price_kg : pt.price_quintal);

  // Combine historical and predicted points
  // The last historical point is the "TODAY / LATEST" point
  const allPoints = [...historicalPoints, ...predictedPoints];

  if (!allPoints.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No price data available to render chart.</Text>
      </View>
    );
  }

  // Calculate min and max for Y-axis
  const prices = allPoints.map((p) => getPrice(p));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const pricePadding = Math.max((maxPrice - minPrice) * 0.15, unit === 'kg' ? 2 : 200);
  const yMin = Math.max(0, minPrice - pricePadding);
  const yMax = maxPrice + pricePadding;
  const yRange = yMax - yMin || 1;

  // Chart dimensions
  const basePointWidth = 40 * zoomLevel;
  const chartHeight = 260;
  const svgWidth = Math.max(700, allPoints.length * basePointWidth);
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate pixel coordinates for each point
  const pointsWithCoords = allPoints.map((pt, idx) => {
    const x = paddingLeft + (idx / (allPoints.length - 1 || 1)) * plotWidth;
    const val = getPrice(pt);
    const y = paddingTop + plotHeight - ((val - yMin) / yRange) * plotHeight;
    const isHistorical = pt.data_type === 'Historical Market Data';
    const isLatest = pt.date === latestDate;
    return { ...pt, x, y, val, isHistorical, isLatest, idx };
  });

  const histCoords = pointsWithCoords.filter((p) => p.isHistorical);
  const predCoords = pointsWithCoords.filter((p) => !p.isHistorical);

  // Build SVG path strings
  const histPath = histCoords.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`, '');

  // Connect last historical point to first predicted point for continuous line
  const lastHist = histCoords[histCoords.length - 1];
  const predPathInput = lastHist ? [lastHist, ...predCoords] : predCoords;
  const predPath = predPathInput.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`, '');

  // Find latest point for divider line
  const latestCoord = lastHist || pointsWithCoords[0];

  // Y-axis Ticks (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => {
    const val = yMin + ratio * yRange;
    const y = paddingTop + plotHeight - ratio * plotHeight;
    return { val, y };
  });

  return (
    <View style={styles.container}>
      {/* Chart Toolbar & Controls */}
      <View style={styles.headerRow}>
        <View style={styles.legendGroup}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
            <Text style={styles.legendText}>Historical Modal Price</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#D97706', borderRadius: 2 }]} />
            <Text style={styles.legendText}>ML Predicted Future Price</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { borderColor: '#2563EB' }]} />
            <Text style={styles.legendText}>Latest Market Date</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          {/* Unit Toggle Switch */}
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'kg' && styles.unitBtnActive]}
              onPress={() => onUnitToggle && onUnitToggle('kg')}
            >
              <Text style={[styles.unitBtnText, unit === 'kg' && styles.unitBtnTextActive]}>₹/kg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'quintal' && styles.unitBtnActive]}
              onPress={() => onUnitToggle && onUnitToggle('quintal')}
            >
              <Text style={[styles.unitBtnText, unit === 'quintal' && styles.unitBtnTextActive]}>₹/quintal</Text>
            </TouchableOpacity>
          </View>

          {/* Zoom Buttons */}
          <View style={styles.zoomGroup}>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => setZoomLevel((z) => Math.min(2.5, z + 0.3))}
            >
              <Text style={styles.zoomBtnText}>🔍 +</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => setZoomLevel((z) => Math.max(0.8, z - 0.3))}
            >
              <Text style={styles.zoomBtnText}>🔍 -</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => setZoomLevel(1)}
            >
              <Text style={styles.zoomBtnText}>↺ Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Interactive Hover Tooltip Display */}
      <View style={styles.tooltipContainer}>
        {activePoint ? (
          <View
            style={[
              styles.tooltipBadge,
              activePoint.isHistorical ? styles.tooltipHist : styles.tooltipPred,
            ]}
          >
            <Text style={styles.tooltipDate}>📅 {activePoint.date}</Text>
            <Text style={styles.tooltipPrice}>
              ₹{activePoint.val.toLocaleString('en-IN')} {unitLabel}
            </Text>
            <Text style={styles.tooltipType}>
              {activePoint.isHistorical ? '🏛️ Historical Market Data' : '🤖 ML Model Prediction'}
            </Text>
          </View>
        ) : (
          <Text style={styles.tooltipPrompt}>
            💡 Hover over or tap any data point on the graph to inspect exact price & data type.
          </Text>
        )}
      </View>

      {/* Horizontally Scrollable SVG Graph Wrapper */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.scrollWrapper}>
        <View style={{ width: svgWidth, height: chartHeight, position: 'relative' }}>

          {/* Web SVG Rendering */}
          {Platform.OS === 'web' ? (
            <svg
              width={svgWidth}
              height={chartHeight}
              style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={tick.y}
                    x2={svgWidth - paddingRight}
                    y2={tick.y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={tick.y + 4}
                    textAnchor="end"
                    fill="#64748B"
                    fontSize="11"
                    fontWeight="600"
                  >
                    ₹{tick.val >= 100 ? Math.round(tick.val) : tick.val.toFixed(1)}
                  </text>
                </g>
              ))}

              {/* Historical Path */}
              {histPath ? (
                <path
                  d={histPath}
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {/* Predicted Path (Dashed) */}
              {predPath ? (
                <path
                  d={predPath}
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="3.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {/* Vertical TODAY / LATEST DATA Divider */}
              {latestCoord ? (
                <g>
                  <line
                    x1={latestCoord.x}
                    y1={paddingTop}
                    x2={latestCoord.x}
                    y2={paddingTop + plotHeight}
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={latestCoord.x - 45}
                    y={paddingTop - 24}
                    width="90"
                    height="20"
                    rx="10"
                    fill="#2563EB"
                  />
                  <text
                    x={latestCoord.x}
                    y={paddingTop - 10}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="800"
                  >
                    TODAY / LATEST
                  </text>
                </g>
              ) : null}

              {/* Interactive Data Points */}
              {pointsWithCoords.map((pt, i) => {
                const isHovered = activePoint?.idx === pt.idx;
                const radius = pt.isLatest ? 7 : isHovered ? 8 : 5;
                const strokeColor = pt.isLatest ? '#2563EB' : pt.isHistorical ? '#15803D' : '#B45309';
                const fillColor = pt.isLatest ? '#3B82F6' : pt.isHistorical ? '#22C55E' : '#F59E0B';

                return (
                  <g
                    key={i}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setActivePoint(pt)}
                    onClick={() => setActivePoint(pt)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={radius}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isHovered ? 3 : 2}
                    />
                    {/* X-axis Date Labels (Render subset based on zoom) */}
                    {(i === 0 ||
                      i === pointsWithCoords.length - 1 ||
                      pt.isLatest ||
                      i % Math.ceil(8 / zoomLevel) === 0) && (
                      <text
                        x={pt.x}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        fill={pt.isLatest ? '#2563EB' : '#475569'}
                        fontSize="10"
                        fontWeight={pt.isLatest ? '800' : '600'}
                      >
                        {pt.date.slice(5)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          ) : (
            /* Native Fallback for Mobile App */
            <View style={{ flex: 1, paddingLeft: 60, justifyContent: 'center' }}>
              <Text style={{ color: '#64748B', fontSize: 13 }}>
                Interactive SVG chart optimized for web view.
              </Text>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  legendGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLine: {
    width: 14,
    height: 0,
    borderBottomWidth: 2.5,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  unitBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  unitBtnActive: {
    backgroundColor: '#16A34A',
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  unitBtnTextActive: {
    color: '#FFFFFF',
  },
  zoomGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zoomBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  zoomBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  tooltipContainer: {
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tooltipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  tooltipHist: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  tooltipPred: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  tooltipDate: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  tooltipPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#15803D',
  },
  tooltipType: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tooltipPrompt: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  scrollWrapper: {
    backgroundColor: '#FAFDFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});
