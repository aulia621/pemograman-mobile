import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSetting, setSetting } from '../database/db';
import { lightTheme, darkTheme } from '../constants/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await getSetting('theme');
      setTheme(saved === 'dark' ? darkTheme : lightTheme);
    } catch (e) {
      console.error('Load theme error:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme.mode === 'light' ? darkTheme : lightTheme;
    setTheme(newTheme);
    await setSetting('theme', newTheme.mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);