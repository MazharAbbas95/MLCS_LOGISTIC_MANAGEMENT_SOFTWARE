import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Receipt, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, setIsCollapsed }) => {
  const { t, isRTL } = useLanguage();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, labelPath: 'common.dashboard', active: true },
    { id: 'vehicleRecord', icon: Truck, labelPath: 'common.vehicleRecord', active: true },
    { id: 'expense', icon: Receipt, labelPath: 'common.dailyExpense', active: true },
    { id: 'bilty', icon: FileText, labelPath: 'common.digitalBilty', active: true },
    { id: 'letterpad', icon: ClipboardList, labelPath: 'common.letterPad', active: true },
    { id: 'reports', icon: BarChart3, labelPath: 'common.reports', active: true },
    { id: 'settings', icon: Settings, labelPath: 'common.settings', active: true },
  ];

  return (
    <motion.aside
      id="sidebar"
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="bg-sage-dark text-white/90 border-e border-white/5 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-50 overflow-hidden shadow-xl"
    >
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/10 h-20">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-sage-light rounded-lg flex items-center justify-center font-bold text-sage-dark text-xl shadow-inner">
              M
            </div>
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">MLCS Admin</span>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
        >
          {isCollapsed ? (isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />) : (isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />)}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isButtonDisabled = !item.active;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => item.active && setActiveView(item.id)}
                disabled={isButtonDisabled}
                className={`
                  w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300
                  ${isActive ? 'bg-sage-light text-sage-dark shadow-lg font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                  ${isButtonDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`${isActive ? 'text-sage-dark' : 'group-hover:scale-110 transition-transform'}`}>
                  <Icon size={20} />
                </div>
                
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 flex items-center justify-between overflow-hidden"
                  >
                    <span className="text-sm whitespace-nowrap font-urdu-body">{t(item.labelPath)}</span>
                    {isButtonDisabled && (
                      <span className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                        Soon
                      </span>
                    )}
                  </motion.div>
                )}

                {isCollapsed && isButtonDisabled && (
                  <div className="absolute top-1 end-1 w-1.5 h-1.5 bg-white/20 rounded-full" />
                )}
              </button>
              
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className={`
                  absolute ${isRTL ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 
                  bg-sage-dark text-white px-3 py-1.5 rounded text-xs whitespace-nowrap shadow-xl border border-white/10
                  opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100]
                `}>
                  {t(item.labelPath)} {isButtonDisabled && `(${t('common.comingSoon')})`}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 bg-sage-dark/50 border-t border-white/5 mt-auto">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center text-sage-dark font-bold text-xs shadow-sm shadow-black/20">
            MA
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-xs font-bold text-white truncate">Mazhar Abbas / مظہر عباس</p>
              <p className="text-[10px] text-white/40 truncate">Administrator</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
