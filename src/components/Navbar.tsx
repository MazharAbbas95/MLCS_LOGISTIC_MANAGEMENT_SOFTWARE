import React, { useState, useEffect } from 'react';
import { Bell, Search, User, LogOut, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import NotificationTray from './NotificationTray';

const Navbar: React.FC = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const date = new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-US', options).format(new Date());
      setCurrentDate(date);
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [language]);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-sage-border h-20 px-8 flex items-center justify-between sticky top-0 z-40 navbar-wrapper">
      <div className={`flex items-center gap-4 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="w-10 h-10 bg-sage-dark rounded-xl flex items-center justify-center text-white shadow-lg shadow-sage-dark/20">
          <Truck size={24} />
        </div>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h1 className="text-xl font-serif text-natural-text font-urdu-title leading-tight">Madad Logistics</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage-medium opacity-60">Container Services</p>
        </div>
        
        <div className="h-6 w-px bg-sage-border mx-4 hidden lg:block"></div>
        <span className="text-sage-medium text-xs font-bold uppercase tracking-widest hidden lg:block font-urdu-body">{currentDate}</span>
      </div>

      <div className={`flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Language Switch */}
        <div className="flex items-center bg-natural-bg rounded-xl p-1 border border-sage-border/50">
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 text-[10px] font-black tracking-widest rounded-lg transition-all ${language === 'en' ? 'bg-white text-sage-dark shadow-sm border border-sage-border/50' : 'text-sage-medium hover:text-sage-dark'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ur')}
            className={`px-4 py-2 text-[10px] font-black tracking-widest rounded-lg transition-all font-urdu-body ${language === 'ur' ? 'bg-white text-sage-dark shadow-sm border border-sage-border/50' : 'text-sage-medium hover:text-sage-dark'}`}
          >
            اردو
          </button>
        </div>

        <NotificationTray />

        <div className="h-10 w-[1px] bg-sage-border mx-2 hidden md:block"></div>
        
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
          <div className="hidden md:block">
            <p className="text-[10px] font-black text-natural-text uppercase tracking-[0.2em] leading-none">Admin Panel</p>
            <p className="text-[10px] text-sage-medium font-bold opacity-60 font-urdu-body mt-1">{t('common.welcome')}</p>
          </div>
          <div className="w-10 h-10 bg-natural-bg rounded-full border border-sage-border flex items-center justify-center text-sage-medium shadow-inner">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

