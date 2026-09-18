import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DateSelector({ targetDate, onChangeDate }) {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (targetDate && targetDate.length === 10) {
      const parts = targetDate.split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, 1);
    }
    return new Date();
  });

  const formatDateStr = (year, monthZeroIdx, day) => {
    const y = year;
    const m = String(monthZeroIdx + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const parseDateStr = (str) => {
    if (!str || str.length !== 10) return new Date();
    const parts = str.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const selectedDt = parseDateStr(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Auto-correct any past targetDate back to today
  useEffect(() => {
    if (targetDate && targetDate.length === 10) {
      const parts = targetDate.split('-').map(Number);
      const chosenDt = new Date(parts[0], parts[1] - 1, parts[2]);
      chosenDt.setHours(0, 0, 0, 0);

      const todayNoTime = new Date();
      todayNoTime.setHours(0, 0, 0, 0);

      if (chosenDt < todayNoTime) {
        const y = todayNoTime.getFullYear();
        const m = String(todayNoTime.getMonth() + 1).padStart(2, '0');
        const d = String(todayNoTime.getDate()).padStart(2, '0');
        onChangeDate(`${y}-${m}-${d}`);
      }
    }
  }, [targetDate]);

  // Calendar calculations for viewDate
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const currentMonthFirstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const isPrevMonthDisabled = new Date(viewYear, viewMonth - 1, 1) < currentMonthFirstDay;

  const handlePrevMonth = () => {
    const newMonth = new Date(viewYear, viewMonth - 1, 1);
    if (newMonth < currentMonthFirstDay) {
      return;
    }
    setViewDate(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(viewYear, viewMonth + 1, 1);
    setViewDate(newMonth);
  };

  const handleSelectDay = (day) => {
    const chosenDt = new Date(viewYear, viewMonth, day);
    chosenDt.setHours(0, 0, 0, 0);

    if (chosenDt < today) {
      return; // Cannot select past dates
    }

    const formatted = formatDateStr(viewYear, viewMonth, day);
    onChangeDate(formatted);
    setCalendarVisible(false);
  };

  const handlePreset = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const formatted = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
    onChangeDate(formatted);
    setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  // Format readable label: e.g. "15 September 2026"
  const getReadableSelectedDate = () => {
    if (!targetDate || targetDate.length !== 10) return targetDate;
    const parts = targetDate.split('-').map(Number);
    const mName = MONTH_NAMES[parts[1] - 1] || '';
    return `${parts[2]} ${mName} ${parts[0]}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>FUTURE SELLING DATE</Text>

      {/* Main Selected Date Display & Open Calendar Button */}
      <TouchableOpacity
        style={styles.datePickerBtn}
        onPress={() => setCalendarVisible(true)}
      >
        <View style={styles.datePickerBtnLeft}>
          <Text style={styles.calendarIcon}>📅</Text>
          <View>
            <Text style={styles.selectedDateTitle}>{getReadableSelectedDate()}</Text>
            <Text style={styles.selectedDateSub}>Formatted: {targetDate}</Text>
          </View>
        </View>
        <View style={styles.openCalBadge}>
          <Text style={styles.openCalBadgeText}>Open Calendar 🗓️</Text>
        </View>
      </TouchableOpacity>

      {/* Quick Preset Date Chips */}
      <View style={styles.presetRow}>
        <TouchableOpacity style={styles.presetBtn} onPress={() => handlePreset(0)}>
          <Text style={styles.presetBtnText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.presetBtn} onPress={() => handlePreset(7)}>
          <Text style={styles.presetBtnText}>+7 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.presetBtn} onPress={() => handlePreset(15)}>
          <Text style={styles.presetBtnText}>+15 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.presetBtn} onPress={() => handlePreset(30)}>
          <Text style={styles.presetBtnText}>+30 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.presetBtn} onPress={() => handlePreset(45)}>
          <Text style={styles.presetBtnText}>+45 Days</Text>
        </TouchableOpacity>
      </View>

      {/* INTERACTIVE CALENDAR MODAL */}
      <Modal
        visible={calendarVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            
            {/* Calendar Header with Prev/Next Month Controls */}
            <View style={styles.monthHeader}>
              <TouchableOpacity
                style={[styles.navBtn, isPrevMonthDisabled && { opacity: 0.3 }]}
                onPress={handlePrevMonth}
                disabled={isPrevMonthDisabled}
              >
                <Text style={styles.navBtnText}>◀</Text>
              </TouchableOpacity>

              <Text style={styles.monthTitle}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>

              <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
                <Text style={styles.navBtnText}>▶</Text>
              </TouchableOpacity>
            </View>

            {/* Days of Week Header Bar */}
            <View style={styles.weekRow}>
              {DAYS_OF_WEEK.map((d, i) => (
                <Text key={i} style={styles.weekText}>{d}</Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View style={styles.daysGrid}>
              {/* Empty leading offset cells for first day of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <View key={`empty-${idx}`} style={styles.dayCellEmpty} />
              ))}

              {/* Month Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const cellDt = new Date(viewYear, viewMonth, dayNum);
                cellDt.setHours(0, 0, 0, 0);

                const isPast = cellDt < today;
                const isSelected =
                  selectedDt.getFullYear() === viewYear &&
                  selectedDt.getMonth() === viewMonth &&
                  selectedDt.getDate() === dayNum;

                const isToday =
                  today.getFullYear() === viewYear &&
                  today.getMonth() === viewMonth &&
                  today.getDate() === dayNum;

                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    style={[
                      styles.dayCell,
                      isPast && styles.dayCellPast,
                      isToday && !isSelected && styles.dayCellToday,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => handleSelectDay(dayNum)}
                    disabled={isPast}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isPast && styles.dayTextPast,
                        isToday && !isSelected && styles.dayTextToday,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Calendar Footer Info */}
            <View style={styles.calendarFooter}>
              <Text style={styles.footerInfo}>
                * Past dates are disabled. Please select today or a future selling date.
              </Text>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setCalendarVisible(false)}
              >
                <Text style={styles.closeModalBtnText}>Close Calendar</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
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
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderColor: '#16A34A',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  datePickerBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  selectedDateTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  selectedDateSub: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  openCalBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  openCalBadgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '800',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  presetBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  presetBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  navBtn: {
    backgroundColor: '#F1F5F9',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  navBtnText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  weekText: {
    width: '14.28%',
    textAlign: 'center',
    color: '#15803D',
    fontWeight: '800',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 40,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayCellPast: {
    backgroundColor: '#F8FAFC',
    opacity: 0.4,
  },
  dayCellToday: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  dayCellSelected: {
    backgroundColor: '#16A34A',
  },
  dayText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  dayTextPast: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  dayTextToday: {
    color: '#166534',
    fontWeight: '800',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  calendarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  footerInfo: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 12,
    textAlign: 'center',
  },
  closeModalBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
