import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

const Layout: React.FC<{ children: React.ReactNode, activeView: string, setActiveView: (view: string) => void }> = ({ children, activeView, setActiveView }) => {
  const { settings } = useSettings();
  const [isCollapsed, setIsCollapsed] = useState(settings.sidebarBehavior === 'always-collapsed');
  const { isRTL, setLanguage } = useLanguage();

  // Sync LanguageContext with SettingsContext
  useEffect(() => {
    if (settings.language) {
      setLanguage(settings.language);
    }
  }, [settings.language, setLanguage]);

  // Sync Sidebar with SettingsContext behavior
  useEffect(() => {
    if (settings.sidebarBehavior === 'always-collapsed') setIsCollapsed(true);
    else if (settings.sidebarBehavior === 'always-open') setIsCollapsed(false);
  }, [settings.sidebarBehavior]);

  return (
    <div className={`flex min-h-screen bg-natural-bg transition-colors duration-300 ${isRTL ? 'font-urdu' : 'font-sans'}`}>
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={settings.sidebarBehavior === 'auto' ? setIsCollapsed : () => {}} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Navbar />
        <main className={`flex-1 overflow-y-auto ${settings.compactMode ? 'p-4' : 'p-8'}`}>
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
