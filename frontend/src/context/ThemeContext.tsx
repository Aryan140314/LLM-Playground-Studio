'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to dark
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (t: Theme) => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    if (t === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('bg-slate-950', 'text-slate-100');
      body.classList.remove('bg-slate-50', 'text-slate-900');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('bg-slate-50', 'text-slate-900');
      body.classList.remove('bg-slate-950', 'text-slate-100');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
