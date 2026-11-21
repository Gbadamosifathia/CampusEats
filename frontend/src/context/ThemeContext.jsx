import React, { createContext, useState, useEffect, useContext } from 'react';

const defaultThemeValue = {
  theme: (typeof window !== 'undefined' && localStorage.getItem('campuseats_theme')) || 'light',
  toggleTheme: () => {}
};

const ThemeContext = createContext(defaultThemeValue);

export const useTheme = () => useContext(ThemeContext) || defaultThemeValue;

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('campuseats_theme')) || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('campuseats_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
