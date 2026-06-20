import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { getAllTodos, addTodo, updateTodo, toggleTodo, deleteTodo } from '../database/db';
import TodoItem from '../components/TodoItem';
import AddTodoModal from '../components/AddTodoModal';
import EditTodoModal from '../components/EditTodoModal';

export default function HomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // ← ambil safe area
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchTodos = async () => {
    try {
      const data = await getAllTodos();
      setTodos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTodos(); }, []));

  const handleAdd = async (title, desc, priority) => {
    await addTodo(title, desc, priority);
    fetchTodos();
  };

  const handleToggle = async (id, completed) => {
    await toggleTodo(id, completed);
    fetchTodos();
  };

  const handleEdit = (todo) => setEditTodo(todo);

  const handleSave = async (id, title, desc, priority) => {
    await updateTodo(id, title, desc, priority);
    fetchTodos();
  };

  const handleDelete = async (id) => {
    await deleteTodo(id);
    fetchTodos();
  };

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    done: todos.filter(t => t.completed).length,
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header dengan paddingTop dari safe area */}
      <View style={[styles.header, {
        backgroundColor: theme.card,
        borderBottomColor: theme.border,
        paddingTop: insets.top + 12, // ← ini yang fix notif bar
      }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>📋 Tugas Saya</Text>
          <Text style={[styles.headerSub, { color: theme.subtext }]}>
            {stats.done}/{stats.total} selesai
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => setAddVisible(true)}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      {stats.total > 0 && (
        <View style={[styles.progressWrap, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
            <View style={[
              styles.progressFill,
              {
                backgroundColor: theme.primary,
                width: `${(stats.done / stats.total) * 100}%`,
              },
            ]} />
          </View>
          <Text style={[styles.progressText, { color: theme.subtext }]}>
            {Math.round((stats.done / stats.total) * 100)}%
          </Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        {['all', 'active', 'done'].map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.tab,
              filter === f && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.tabText,
              { color: filter === f ? theme.primary : theme.subtext },
            ]}>
              {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Selesai'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={filtered.length === 0 ? styles.centered : { paddingVertical: 10 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 50 }}>🎉</Text>
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              {filter === 'done' ? 'Belum ada tugas selesai' : 'Tidak ada tugas! Tambah sekarang.'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchTodos(); }}
            tintColor={theme.primary}
          />
        }
      />

      <AddTodoModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onAdd={handleAdd}
      />
      <EditTodoModal
        visible={!!editTodo}
        todo={editTodo}
        onClose={() => setEditTodo(null)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  progressBg: { flex: 1, height: 6, borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10 },
  progressText: { fontSize: 12, fontWeight: '600', width: 36 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: { fontWeight: '600', fontSize: 13 },
  empty: { alignItems: 'center', gap: 12, marginTop: 60 },
  emptyText: { fontSize: 15 },
});