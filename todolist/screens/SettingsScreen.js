import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ← tambah ini
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets(); // ← ambil safe area
  const isDark = theme.mode === 'dark';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 8 }} // ← fix notif bar
    >
      <Text style={[styles.heading, { color: theme.text }]}>⚙️ Pengaturan</Text>

      {/* Theme Section */}
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.subtext }]}>TAMPILAN</Text>

        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: theme.primary + '22' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.rowTitle, { color: theme.text }]}>Mode Gelap</Text>
              <Text style={[styles.rowSub, { color: theme.subtext }]}>
                {isDark ? 'Aktif — tema gelap' : 'Nonaktif — tema terang'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary + '88' }}
            thumbColor={isDark ? theme.primary : '#ccc'}
          />
        </View>
      </View>

      {/* Info Section */}
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.subtext }]}>TENTANG</Text>

        {[
          { icon: 'server', label: 'Database', value: 'SQLite (expo-sqlite)' },
          { icon: 'phone-portrait', label: 'Framework', value: 'Expo React Native' },
          { icon: 'code-slash', label: 'Versi App', value: '1.0.0' },
        ].map((item, i, arr) => (
          <View
            key={item.label}
            style={[
              styles.infoRow,
              i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: theme.primary + '22' }]}>
                <Ionicons name={item.icon} size={18} color={theme.primary} />
              </View>
              <Text style={[styles.rowTitle, { color: theme.text }]}>{item.label}</Text>
            </View>
            <Text style={[styles.rowSub, { color: theme.subtext }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Theme preview card */}
      <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.previewTitle, { color: theme.text }]}>
          {isDark ? '🌙 Dark Mode Aktif' : '☀️ Light Mode Aktif'}
        </Text>
        <Text style={[styles.previewSub, { color: theme.subtext }]}>
          Preferensi tema disimpan ke SQLite dan akan diingat saat aplikasi dibuka kembali.
        </Text>
        <View style={[styles.previewPill, { backgroundColor: theme.primary }]}>
          <Text style={styles.previewPillText}>Tersimpan di SQLite ✓</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { fontSize: 24, fontWeight: '800', margin: 20, marginBottom: 12 },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontWeight: '600', fontSize: 15 },
  rowSub: { fontSize: 12, marginTop: 1 },
  previewCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 8,
  },
  previewTitle: { fontSize: 17, fontWeight: '700' },
  previewSub: { fontSize: 13, lineHeight: 20 },
  previewPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  previewPillText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});