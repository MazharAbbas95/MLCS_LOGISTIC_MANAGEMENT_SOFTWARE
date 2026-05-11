import React, { useState } from 'react';
import { Bell, X, Check, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const NotificationTray: React.FC = () => {
  const { notifications, removeNotification, markAsRead, clearAll, unreadCount } = useNotifications();
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return { icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'warning': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' };
      default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' };
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white border border-sage-border rounded-xl text-sage-medium hover:text-sage-dark transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Tray Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/5" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute top-full mt-4 ${isRTL ? 'left-0' : 'right-0'} w-80 md:w-96 bg-white border border-sage-border rounded-[2rem] shadow-2xl z-50 overflow-hidden outline-none`}
            >
              {/* Header */}
              <div className={`p-6 border-b border-sage-border flex items-center justify-between bg-natural-bg/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="font-serif text-sage-dark font-urdu-title">{t('common.notifications.title')}</h3>
                <button 
                  onClick={clearAll}
                  className="text-[10px] font-black uppercase tracking-widest text-sage-medium hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} /> {t('common.notifications.clearAll')}
                </button>
              </div>

              {/* List */}
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-natural-bg rounded-full flex items-center justify-center mx-auto mb-4 text-sage-border">
                      <Bell size={32} />
                    </div>
                    <p className="text-sm text-sage-medium font-urdu-body">{t('common.notifications.empty')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-sage-border">
                    {notifications.map((n) => {
                      const styles = getTypeStyles(n.type);
                      return (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          className={`p-5 hover:bg-natural-bg/30 transition-colors cursor-pointer relative group ${!n.read ? 'bg-blue-50/10' : ''} ${isRTL ? 'text-right' : 'text-left'}`}
                        >
                          <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`mt-1 p-2 rounded-lg ${styles.bg} ${styles.color} shrink-0`}>
                              <styles.icon size={16} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className={`text-sm text-natural-text font-urdu-body leading-relaxed ${!n.read ? 'font-bold' : ''}`}>
                                {n.message}
                              </p>
                              <p className="text-[10px] text-sage-medium font-bold uppercase tracking-widest">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(n.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-sage-medium hover:text-red-500 transition-all self-start"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          {!n.read && (
                            <div className={`absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-sage-dark rounded-full ${isRTL ? 'right-0' : 'left-0'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-sage-dark text-white/40 text-[9px] font-black uppercase tracking-widest text-center">
                System Intelligence Logs • Real-time Feedback
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationTray;
