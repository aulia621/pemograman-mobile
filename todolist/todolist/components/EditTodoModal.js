import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLOR = { high: '#FF4757', medium: '#FFA502', low: '#2ED573' };

export default function EditTodoModal({ visible, todo, onClose, onSave }) {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority || 'medium');
    }
  }, [todo]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(todo.id, title.trim(), description.trim(), priority);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.sheet, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.text }]}>🔧 Edit Tugas</Text>

          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
            placeholder="Judul tugas..."
            placeholderTextColor={theme.placeholder}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.multiline, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
            placeholder="Deskripsi (opsional)..."
            placeholderTextColor={theme.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.label, { color: theme.subtext }]}>Prioritas</Text>
          <View style={styles.priorities}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.priorityBtn,
                  { borderColor: PRIORITY_COLOR[p] },
                  priority === p && { backgroundColor: PRIORITY_COLOR[p] },
                ]}
              >
                <Text style={[
                  styles.priorityText,
                  { color: priority === p ? '#fff' : PRIORITY_COLOR[p] },
                ]}>
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.inputBg }]}
              onPress={onClose}
            >
              <Text style={{ color: theme.text, fontWeight: '600' }}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000066',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    gap: 12,
  },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  multiline: { height: 80, textAlignVertical: 'top' },
  priorities: { flexDirection: 'row', gap: 10 },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityText: { fontWeight: '700', fontSize: 12 },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});