import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Animated, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { getAllTodos, addTodo, updateTodo, toggleTodo, deleteTodo } from '../database/db';
import TodoItem from '../components/TodoItem';
import AddTodoModal from '../components/AddTodoModal';
import EditTodoModal from '../components/EditTodoModal';

const QUOTES = [
  { text: "Perjalanan seribu mil dimulai dari satu langkah kecil.", author: "Lao Tzu" },
  { text: "Produktivitas bukan soal sibuk, tapi soal selesai.", author: "Tim Ferriss" },
  { text: "Tuliskan tugasmu, karena yang tercatat akan terselesaikan.", author: "" },
  { text: "Setiap tugas kecil yang selesai adalah kemenangan besar.", author: "" },
  { text: "Hari ini kamu lebih kuat dari yang kamu kira.", author: "" },
];

const FEATURES = [
  { icon: 'checkmark-circle', color: '#10B981', text: 'Catat & selesaikan tugas' },
  { icon: 'timer-outline',    color: '#F59E0B', text: 'Pantau waktu & progress' },
  { icon: 'trending-up',      color: '#6C63FF', text: 'Tingkatkan produktivitasmu' },
];

const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

// ─── Welcome Screen ───────────────────────────────────────────────────────────
function WelcomeView({ onStart, theme }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5,   useNativeDriver: true }),
      ]),
      Animated.stagger(150, [
        Animated.timing(card1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(card2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(card3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const cardAnims = [card1Anim, card2Anim, card3Anim];

  return (
    <View style={[ws.container, { backgroundColor: theme.background }]}>
      <View style={[ws.blob, ws.blob1, { backgroundColor: theme.primary }]} />
      <View style={[ws.blob, ws.blob2, { backgroundColor: '#FF6584' }]} />

      <Animated.View style={[ws.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        <Animated.View style={[ws.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.View style={[ws.iconPulse, { backgroundColor: theme.primary, transform: [{ scale: pulseAnim }] }]} />
          <View style={[ws.iconCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="journal" size={48} color="#fff" />
          </View>
        </Animated.View>

        <Text style={[ws.greeting, { color: theme.subtext }]}>✨ Selamat Datang di</Text>
        <Text style={[ws.appName, { color: theme.text }]}>Tugas Harianku 📋</Text>
        <Text style={[ws.tagline, { color: theme.subtext }]}>
          Wujudkan impianmu satu tugas dalam satu waktu.{'\n'}
          Konsisten adalah kunci kesuksesan!
        </Text>

        <View style={[ws.quoteCard, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: theme.primary }]}>
          <Ionicons name="chatbubble-ellipses" size={16} color={theme.primary} style={{ marginBottom: 6 }} />
          <Text style={[ws.quoteText, { color: theme.text }]}>"{quote.text}"</Text>
          {!!quote.author && <Text style={[ws.quoteAuthor, { color: theme.primary }]}>— {quote.author}</Text>}
        </View>

        <View style={ws.features}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={i}
              style={[ws.featureRow, { backgroundColor: theme.card, borderColor: theme.border }, {
                opacity: cardAnims[i],
                transform: [{ translateX: cardAnims[i].interpolate({ inputRange: [0,1], outputRange: [-30,0] }) }],
              }]}
            >
              <View style={[ws.featureIcon, { backgroundColor: f.color + '22' }]}>
                <Ionicons name={f.icon} size={20} color={f.color} />
              </View>
              <Text style={[ws.featureText, { color: theme.text }]}>{f.text}</Text>
            </Animated.View>
          ))}
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
          <TouchableOpacity
            style={[ws.btn, { backgroundColor: theme.primary }]}
            onPress={onStart}
            activeOpacity={0.85}
          >
            <Text style={ws.btnText}>Mulai Produktif Sekarang 🚀</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <Text style={[ws.footer, { color: theme.subtext }]}>
          🔒 Semua data tersimpan aman di perangkatmu
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showWelcome, setShowWelcome] = useState(true);
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

  const handleAdd    = async (title, desc, priority) => { await addTodo(title, desc, priority); fetchTodos(); };
  const handleToggle = async (id, completed) => { await toggleTodo(id, completed); fetchTodos(); };
  const handleEdit   = (todo) => setEditTodo(todo);
  const handleSave   = async (id, title, desc, priority) => { await updateTodo(id, title, desc, priority); fetchTodos(); };
  const handleDelete = async (id) => { await deleteTodo(id); fetchTodos(); };

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done')   return t.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    done: todos.filter(t => t.completed).length,
  };

  // Tampilkan welcome screen dulu
  if (showWelcome) {
    return <WelcomeView theme={theme} onStart={() => setShowWelcome(false)} />;
  }

  if (loading) {
    return (
      <View style={[hs.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[hs.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[hs.header, {
        backgroundColor: theme.card,
        borderBottomColor: theme.border,
        paddingTop: insets.top + 12,
      }]}>
        <View>
          <Text style={[hs.headerTitle, { color: theme.text }]}>📋 Tugas Saya</Text>
          <Text style={[hs.headerSub, { color: theme.subtext }]}>{stats.done}/{stats.total} selesai</Text>
        </View>
        <TouchableOpacity
          style={[hs.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => setAddVisible(true)}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      {stats.total > 0 && (
        <View style={[hs.progressWrap, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View style={[hs.progressBg, { backgroundColor: theme.border }]}>
            <View style={[hs.progressFill, {
              backgroundColor: theme.primary,
              width: `${Math.round((stats.done / stats.total) * 100)}%`,
            }]} />
          </View>
          <Text style={[hs.progressText, { color: theme.subtext }]}>
            {Math.round((stats.done / stats.total) * 100)}%
          </Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={[hs.tabs, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        {['all', 'active', 'done'].map(f => (
          <TouchableOpacity
            key={f}
            style={[hs.tab, filter === f && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[hs.tabText, { color: filter === f ? theme.primary : theme.subtext }]}>
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
        contentContainerStyle={filtered.length === 0 ? hs.centered : { paddingVertical: 10 }}
        ListEmptyComponent={
          <View style={hs.empty}>
            <Text style={{ fontSize: 50 }}>🎉</Text>
            <Text style={[hs.emptyText, { color: theme.subtext }]}>
              {filter === 'done' ? 'Belum ada tugas selesai' : 'Tidak ada tugas! Tambah sekarang.'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTodos(); }} tintColor={theme.primary} />
        }
      />

      <AddTodoModal visible={addVisible} onClose={() => setAddVisible(false)} onAdd={handleAdd} />
      <EditTodoModal visible={!!editTodo} todo={editTodo} onClose={() => setEditTodo(null)} onSave={handleSave} />
    </View>
  );
}

// ─── Welcome Styles ───────────────────────────────────────────────────────────
const ws = StyleSheet.create({
  container:   { flex: 1, overflow: 'hidden' },
  blob:        { position: 'absolute', borderRadius: 999, opacity: 0.12 },
  blob1:       { width: 320, height: 320, top: -80,  right: -80 },
  blob2:       { width: 240, height: 240, bottom: 60, left: -60 },
  inner:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 20 },
  iconWrap:    { alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  iconPulse:   { position: 'absolute', width: 100, height: 100, borderRadius: 30, opacity: 0.2 },
  iconCircle:  { width: 88, height: 88, borderRadius: 26, alignItems: 'center', justifyContent: 'center', elevation: 12, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16 },
  greeting:    { fontSize: 15, fontWeight: '500', letterSpacing: 0.5 },
  appName:     { fontSize: 32, fontWeight: '900', textAlign: 'center', marginTop: 4, marginBottom: 10 },
  tagline:     { fontSize: 13, textAlign: 'center', lineHeight: 21, marginBottom: 18 },
  quoteCard:   { borderRadius: 16, padding: 14, borderLeftWidth: 4, borderWidth: 1, width: '100%', marginBottom: 18 },
  quoteText:   { fontSize: 13, fontStyle: 'italic', lineHeight: 20 },
  quoteAuthor: { fontSize: 11, fontWeight: '700', marginTop: 6 },
  features:    { width: '100%', gap: 8, marginBottom: 24 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, borderWidth: 1 },
  featureIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 14, fontWeight: '600' },
  btn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 18, paddingVertical: 16, width: '100%', elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  btnText:     { fontSize: 16, fontWeight: '800', color: '#fff' },
  footer:      { fontSize: 11, marginTop: 14, textAlign: 'center' },
});

// ─── Home Styles ──────────────────────────────────────────────────────────────
const hs = StyleSheet.create({
  container:    { flex: 1 },
  centered:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle:  { fontSize: 22, fontWeight: '800' },
  headerSub:    { fontSize: 13, marginTop: 2 },
  addBtn:       { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  progressWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 10, borderBottomWidth: 1 },
  progressBg:   { flex: 1, height: 6, borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10 },
  progressText: { fontSize: 12, fontWeight: '600', width: 36 },
  tabs:         { flexDirection: 'row', borderBottomWidth: 1 },
  tab:          { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText:      { fontWeight: '600', fontSize: 13 },
  empty:        { alignItems: 'center', gap: 12, marginTop: 60 },
  emptyText:    { fontSize: 15 },
});