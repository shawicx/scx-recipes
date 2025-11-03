import React, { createContext, useContext, useState, useEffect } from "react";
import { HeroUIProvider } from "@heroui/react";

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface AppThemeProviderProps {
  children: React.ReactNode;
}

// HeroUI使用HeroUIProvider作为其主题和全局配置提供者
export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({
  children,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 从 localStorage 读取主题设置
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // 应用主题到 document
    document.documentElement.className = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <HeroUIProvider>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className={`${theme} text-foreground bg-background min-h-screen transition-colors duration-300`}>
          {children}
        </div>
      </ThemeContext.Provider>
    </HeroUIProvider>
  );
};
