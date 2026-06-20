import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import { getDB } from './database/db';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  const { theme, loading } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer
        theme={{
          dark: theme.mode === 'dark',
          colors: {
            primary: theme.primary,
            background: theme.background,
            card: theme.card,
            text: theme.text,
            border: theme.border,
            notification: theme.primary,
          },
        }}
      >
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.tabBar,
              borderTopColor: theme.border,
              height: 60,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: theme.tabBarActive,
            tabBarInactiveTintColor: theme.tabBarInactive,
            tabBarIcon: ({ focused, color, size }) => {
              const icons = {
                Home: focused ? 'checkmark-circle' : 'checkmark-circle-outline',
                Settings: focused ? 'settings' : 'settings-outline',
              };
              return <Ionicons name={icons[route.name]} size={size} color={color} />;
            },
            tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Tugas' }} />
          <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Pengaturan' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Inisialisasi DB duluan sebelum render apapun
    getDB()
      .then(() => setDbReady(true))
      .catch((e) => {
        console.error('DB init error:', e);
        setDbReady(true); // tetap lanjut meski error
      });
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}