import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const PRIORITY_COLOR = {
  high: '#FF4757',
  medium: '#FFA502',
  low: '#2ED573',
};

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const { theme } = useTheme();

  const confirmDelete = () => {
    Alert.alert('Hapus Tugas', `Hapus "${todo.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => onDelete(todo.id) },
    ]);
  };

  return (
    <View style={[styles.card, {
      backgroundColor: theme.card,
      borderColor: theme.border,
      shadowColor: theme.shadow,
    }]}>
      {/* Priority bar */}
      <View style={[styles.priorityBar, { backgroundColor: PRIORITY_COLOR[todo.priority] }]} />

      <View style={styles.content}>
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

        {/* Text */}
        <View style={styles.textWrap}>
          <Text style={[
            styles.title,
            { color: theme.text },
            todo.completed && styles.strikethrough,
          ]}>
            {todo.title}
          </Text>
          {todo.description ? (
            <Text style={[styles.desc, { color: theme.subtext }]} numberOfLines={2}>
              {todo.description}
            </Text>
          ) : null}
          <View style={styles.meta}>
            <View style={[styles.badge, { backgroundColor: PRIORITY_COLOR[todo.priority] + '22' }]}>
              <Text style={[styles.badgeText, { color: PRIORITY_COLOR[todo.priority] }]}>
                {todo.priority.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.date, { color: theme.subtext }]}>
              {todo.created_at?.slice(0, 10)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(todo)} style={styles.actionBtn}>
            <Ionicons name="pencil" size={18} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
            <Ionicons name="trash" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  priorityBar: { width: 5 },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.5 },
  desc: { fontSize: 13, marginBottom: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  date: { fontSize: 11 },
  actions: { flexDirection: 'column', gap: 8 },
  actionBtn: { padding: 4 },
});