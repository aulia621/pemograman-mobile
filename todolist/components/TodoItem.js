import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const PRIORITY_COLOR = {
  high:   '#FF4757',
  medium: '#FFA502',
  low:    '#2ED573',
};

const PRIORITY_META = {
  high:   { hours: 2,  emoji: '🔥', urgency: 'Segera kerjakan!' },
  medium: { hours: 6,  emoji: '⚡', urgency: 'Jangan ditunda!' },
  low:    { hours: 24, emoji: '🌿', urgency: 'Selesaikan hari ini' },
};

function calcProgress(todo) {
  if (todo.completed) return 100;
  const meta     = PRIORITY_META[todo.priority] || PRIORITY_META.medium;
  const created  = new Date(todo.created_at).getTime();
  const elapsed  = Date.now() - created;
  const deadline = meta.hours * 3600000;
  return Math.min(Math.round((elapsed / deadline) * 100), 99);
}

function getTimeLeft(todo) {
  if (todo.completed) return null;
  const meta      = PRIORITY_META[todo.priority] || PRIORITY_META.medium;
  const created   = new Date(todo.created_at).getTime();
  const remaining = meta.hours * 3600000 - (Date.now() - created);
  if (remaining <= 0) return { text: 'Waktu habis!', urgent: true };
  const mins  = Math.floor(remaining / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return { text: `${days} hari lagi`,  urgent: false };
  if (hours > 0) return { text: `${hours} jam lagi`,  urgent: hours < 2 };
  return              { text: `${mins} menit lagi`,    urgent: true };
}

function getBarColor(pct) {
  if (pct >= 80) return '#FF4757';
  if (pct >= 50) return '#FFA502';
  return '#2ED573';
}

function getMotivasi(pct) {
  if (pct < 30) return '💪 Baru mulai — kamu pasti bisa!';
  if (pct < 60) return '🏃 Terus semangat, hampir setengah jalan!';
  if (pct < 85) return '⚡ Hampir selesai, jangan berhenti!';
  return              '🔥 Waktu hampir habis — sekarang atau tidak sama sekali!';
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const { theme } = useTheme();
  const pct      = calcProgress(todo);
  const timeLeft = getTimeLeft(todo);
  const barColor = todo.completed ? '#2ED573' : getBarColor(pct);
  const meta     = PRIORITY_META[todo.priority] || PRIORITY_META.medium;
  const barAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: todo.completed ? 100 : pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct, todo.completed]);

  const confirmDelete = () => {
    Alert.alert('Hapus Tugas', `Hapus "${todo.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => onDelete(todo.id) },
    ]);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
      {/* Priority bar kiri */}
      <View style={[styles.priorityBar, { backgroundColor: PRIORITY_COLOR[todo.priority] }]} />

      <View style={styles.inner}>
        {/* Top row */}
        <View style={styles.topRow}>
          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => onToggle(todo.id, !todo.completed)}
            style={[styles.checkbox, {
              backgroundColor: todo.completed ? theme.checkboxBg : 'transparent',
              borderColor: todo.completed ? theme.checkboxBg : theme.border,
            }]}
          >
            {todo.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
          </TouchableOpacity>

          {/* Teks */}
          <View style={styles.textWrap}>
            <Text style={[styles.title, { color: theme.text }, todo.completed && styles.strikethrough]} numberOfLines={2}>
              {meta.emoji} {todo.title}
            </Text>
            {!!todo.description && (
              <Text style={[styles.desc, { color: theme.subtext }]} numberOfLines={2}>{todo.description}</Text>
            )}
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: PRIORITY_COLOR[todo.priority] + '22' }]}>
                <Text style={[styles.badgeText, { color: PRIORITY_COLOR[todo.priority] }]}>
                  {todo.priority.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.date, { color: theme.subtext }]}>{todo.created_at?.slice(0, 10)}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(todo)} style={styles.actionBtn}>
              <Ionicons name="pencil" size={18} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
              <Ionicons name="trash" size={18} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress section — hanya tampil kalau belum selesai */}
        {!todo.completed && (
          <View style={[styles.progressSection, { borderTopColor: theme.border }]}>
            {/* Timer & persen */}
            <View style={styles.progressHeader}>
              <View style={styles.timeRow}>
                <Ionicons name="timer-outline" size={12} color={timeLeft?.urgent ? '#FF4757' : theme.subtext} />
                <Text style={[styles.timeText, { color: timeLeft?.urgent ? '#FF4757' : theme.subtext }, timeLeft?.urgent && styles.timeUrgent]}>
                  {timeLeft?.text ?? '—'}
                </Text>
                {timeLeft?.urgent && (
                  <Text style={styles.urgencyBadge}>{meta.urgency}</Text>
                )}
              </View>
              <Text style={[styles.pctLabel, { color: barColor }]}>{pct}%</Text>
            </View>

            {/* Bar */}
            <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
              <Animated.View style={[styles.barFill, {
                backgroundColor: barColor,
                width: barAnim.interpolate({ inputRange: [0,100], outputRange: ['0%','100%'] }),
              }]} />
            </View>

            {/* Motivasi */}
            <Text style={[styles.motivasi, { color: theme.subtext }]}>{getMotivasi(pct)}</Text>
          </View>
        )}

        {/* Done banner */}
        {todo.completed && (
          <View style={[styles.doneBanner, { borderTopColor: theme.border }]}>
            <Ionicons name="checkmark-circle" size={14} color="#2ED573" />
            <Text style={styles.doneText}>Luar biasa! Tugas selesai dikerjakan 🎉</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:            { borderRadius: 14, marginHorizontal: 16, marginVertical: 6, borderWidth: 1, flexDirection: 'row', overflow: 'hidden', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  priorityBar:     { width: 5 },
  inner:           { flex: 1, padding: 14 },
  topRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox:        { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  textWrap:        { flex: 1 },
  title:           { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  strikethrough:   { textDecorationLine: 'line-through', opacity: 0.5 },
  desc:            { fontSize: 13, marginBottom: 6 },
  metaRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge:           { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText:       { fontSize: 10, fontWeight: '700' },
  date:            { fontSize: 11 },
  actions:         { flexDirection: 'column', gap: 8 },
  actionBtn:       { padding: 4 },
  progressSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  progressHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  timeRow:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText:        { fontSize: 12, fontWeight: '500' },
  timeUrgent:      { fontWeight: '700' },
  urgencyBadge:    { fontSize: 10, color: '#FF4757', fontWeight: '700', backgroundColor: '#FF475722', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 4 },
  pctLabel:        { fontSize: 13, fontWeight: '800' },
  barTrack:        { height: 7, borderRadius: 99, overflow: 'hidden' },
  barFill:         { height: '100%', borderRadius: 99 },
  motivasi:        { fontSize: 11, marginTop: 6, fontStyle: 'italic' },
  doneBanner:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  doneText:        { fontSize: 12, color: '#2ED573', fontWeight: '600' },
});