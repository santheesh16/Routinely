import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    showMotivation: true,
    enabledWidgets: {
      streaks: true,
      budget: true,
      recentActivity: true,
      motivation: true,
    },
  });

  // Apply settings function
  const applySettings = (newSettings) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Apply theme
    if (newSettings.theme) {
      if (newSettings.theme === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
        body.style.backgroundColor = '#111827'; // gray-900
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        body.style.backgroundColor = '#f9fafb'; // gray-50
      }
    }
    
    // Apply font size
    if (newSettings.fontSize) {
      const fontSizeMap = {
        small: '14px',
        medium: '16px',
        large: '18px',
        'extra-large': '20px',
      };
      root.style.fontSize = fontSizeMap[newSettings.fontSize] || '16px';
    }
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('routinely-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => {
          const updated = { ...prev, ...parsed };
          applySettings(updated);
          return updated;
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        applySettings(settings);
      }
    } else {
      // Apply default settings if none saved
      applySettings(settings);
    }
  }, []);

  // Update settings and save to localStorage
  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('routinely-settings', JSON.stringify(updated));
      applySettings(updated);
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
