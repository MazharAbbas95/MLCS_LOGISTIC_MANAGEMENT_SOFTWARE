import React, { useEffect, useState } from 'react';
import { 
  Truck, 
  Activity, 
  Receipt, 
  CreditCard, 
  FileText, 
  ClipboardList, 
  BarChart3,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { vehicleApi, expenseApi } from '../services/api';

interface DashboardProps {
  onAction: (view: string) => void;
}

const StatCard: React.FC<{ title: string, value: string, icon: any, color: string, trend: string }> = ({ title, value, icon: Icon, color, trend }) => {
  const { isRTL } = useLanguage();
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white transition-all group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${color} text-white`}>
          <Icon size={18} />
        </div>
        <p className="text-[10px] font-bold text-sage-light uppercase tracking-wider font-urdu-body">{title}</p>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-serif text-sage-dark font-urdu-title">{value}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          trend.startsWith('+') ? 'bg-green-50 text-green-600' : 
          trend === 'Real-time' ? 'bg-blue-50 text-blue-600' : 
          trend === 'Action Needed' ? 'bg-amber-50 text-amber-600' :
          'bg-blue-50 text-blue-600'
        }`}>
          {trend}
        </span>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onAction }) => {
  const { t, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [recentVehicles, setRecentVehicles] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalMonthlyVehicles: 0,
    todayVehicles: 0,
    totalMonthlyExpenses: 0,
    pendingPayments: 0,
    totalMonthlyRevenue: 0,
    totalCommission: 0
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Background polling for real-time sync every 30 seconds
    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const isLastDayOfMonth = now.getDate() === lastDayOfMonth;
    
    if (isLastDayOfMonth) {
      const monthStr = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      addNotification('info', t('common.notifications.messages.monthlyReport').replace('{period}', monthStr));
    }

    return () => clearInterval(intervalId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      // Single server-side call — aggregates across ALL records in the DB
      const stats = await vehicleApi.getStats();

      setRecentVehicles(stats.recentVehicles ?? []);
      setMetrics({
        totalMonthlyVehicles: stats.totalMonthlyVehicles ?? 0,
        todayVehicles: stats.todayVehicles ?? 0,
        totalMonthlyExpenses: 0, // fetched separately below
        pendingPayments: stats.pendingPayments ?? 0,
        totalMonthlyRevenue: stats.totalMonthlyRevenue ?? 0,
        totalCommission: stats.totalCommission ?? 0,
      });

      // Fetch monthly expenses total from expenses API
      try {
        const expensesResponse = await expenseApi.getAll();
        const expenses = Array.isArray(expensesResponse.data) ? expensesResponse.data : [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyExpensesTotal = expenses
          .filter((e: any) => {
            const d = new Date(e.date || e.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);

        setMetrics(prev => ({ ...prev, totalMonthlyExpenses: monthlyExpensesTotal }));
      } catch {
        // expenses not critical, keep 0
      }
    } catch (error: any) {
      console.error('Dashboard Data Fetch Error Details:', {
        message: error.message,
        status: error.status,
        errors: error.errors
      });
      addNotification('error', `Failed to sync dashboard metrics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: t('common.stats.totalVehicles'), 
      value: metrics.totalMonthlyVehicles.toString(), 
      icon: Truck, 
      color: 'bg-sage-dark', 
      trend: 'Monthly' 
    },
    { 
      title: 'Today Vehicles / آج کی گاڑیاں', 
      value: metrics.todayVehicles.toString(), 
      icon: Activity, 
      color: 'bg-emerald-600', 
      trend: 'Today' 
    },
    { 
      title: t('common.stats.totalExpenses'), 
      value: `Rs. ${(metrics.totalMonthlyExpenses / 1000).toFixed(1)}k`, 
      icon: Receipt, 
      color: 'bg-sage-dark', 
      trend: 'This Month' 
    },
    { 
      title: t('common.stats.pendingPayments'), 
      value: `Rs. ${(metrics.pendingPayments / 1000).toFixed(1)}k`, 
      icon: CreditCard, 
      color: 'bg-amber-600', 
      trend: metrics.pendingPayments > 0 ? 'Action Needed' : 'Paid' 
    },
  ];

  const quickActions = [
    { id: 'vehicleRecord', labelPath: 'common.vehiclePage.title', icon: Truck, color: 'bg-sage-light', active: true },
    { id: 'addDailyExpense', labelPath: 'common.expensePage.addTitle', icon: Receipt, color: 'bg-natural-bg', active: true },
    { id: 'letterpad', labelPath: 'common.letterPad', icon: ClipboardList, color: 'bg-natural-bg', active: true },
    { id: 'bilty', labelPath: 'common.digitalBilty', icon: FileText, color: 'bg-natural-bg', active: true },
    { id: 'reports', labelPath: 'common.reports', icon: BarChart3, color: 'bg-natural-bg', active: true },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section className="mb-0">
        <h2 className="text-4xl font-serif text-natural-text leading-tight mb-2 font-urdu-title">
          Overview of this month logistic activity
        </h2>
        <p className="text-sage-medium text-sm font-urdu-body">
          {isRTL ? 'اس ماہ کی لاجسٹک سرگرمی کا جائزہ' : 'Real-time calculation of your business operations for this month.'}
        </p>
      </section>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-sage-border h-32 flex items-center justify-center">
              <Loader2 className="animate-spin text-sage-light" size={24} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      )}

      {/* Quick Actions Section */}

      <section>
        <h3 className="text-xl font-serif text-natural-text mb-6 font-urdu-title">Quick Actions / فوری رسائی</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={action.active ? { y: -4, scale: 1.02 } : {}}
              whileTap={action.active ? { scale: 0.98 } : {}}
              onClick={() => action.active && onAction(action.id)}
              className={`
                flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all
                ${action.active 
                  ? 'bg-white border-sage-border shadow-sm hover:border-sage-light cursor-pointer' 
                  : 'bg-zinc-50 border-zinc-100 opacity-50 cursor-not-allowed'}
              `}
            >
              <div className={`p-3 rounded-2xl ${action.active ? 'bg-sage-light/10 text-sage-dark' : 'bg-zinc-100 text-zinc-400'} mb-3`}>
                <action.icon size={24} />
              </div>
              <span className="text-xs font-bold text-natural-text text-center font-urdu-body">
                {t(action.labelPath)}
              </span>
              {!action.active && (
                <span className="text-[8px] uppercase tracking-tighter text-zinc-400 mt-1 font-bold">Soon</span>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Main Feature Block */}
      <section className="bg-sage-dark rounded-[40px] p-10 flex flex-col lg:flex-row items-center justify-between text-white overflow-hidden relative shadow-2xl shadow-sage-dark/20">
        <div className="max-w-xl relative z-10">
          <h3 className="text-3xl font-serif mb-4 leading-tight font-urdu-title">
            {t('common.vehiclePage.title')} / گاڑیوں کا ریکارڈ
          </h3>
          <p className="text-white/70 mb-8 text-sm leading-relaxed font-urdu-body">
            Access centralized management for your fleet, driver details, and registration logs. Switch between list views or add new assets to the system.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onAction('addVehicleRecord')}
              className="px-8 py-4 bg-sage-light text-sage-dark rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform font-urdu-body"
            >
              <Truck size={20} />
              <span>Add Vehicle / گاڑی شامل کریں</span>
            </button>
            <button 
              onClick={() => onAction('viewVehicleRecords')}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all font-urdu-body"
            >
              View Records / ریکارڈ دیکھیں
            </button>
          </div>
        </div>
        
        {/* Decorative Element */}
        <div className={`absolute ${isRTL ? 'left-[-40px]' : 'right-[-40px]'} bottom-[-40px] w-80 h-80 bg-sage-light opacity-20 rounded-full blur-3xl`}></div>
        <div className="relative z-10 flex items-center justify-center w-64 h-64 border-4 border-white/10 rounded-full mt-10 lg:mt-0">
          <Truck size={128} className="text-white/20" />
        </div>
      </section>

      {/* Sub Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-sage-border p-8 shadow-sm">
          <h3 className="text-xl font-serif text-natural-text mb-6 font-urdu-title">Recent Logistic Activity</h3>
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-natural-bg/20 animate-pulse rounded-2xl"></div>
              ))
            ) : recentVehicles.length > 0 ? (
              recentVehicles.map((record: any) => (
                <div key={record.id} className={`flex items-center justify-between p-4 rounded-2xl bg-natural-bg/30 border border-sage-border/50 hover:bg-natural-bg/60 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-sage-light/20 rounded-xl flex items-center justify-center text-sage-dark border border-sage-light/30">
                      <Truck size={24} />
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h4 className="font-bold text-natural-text text-sm">Truck #{record.truckNo}</h4>
                      <p className="text-xs text-sage-medium">
                        {record.loadingStation} → {record.unloadingStation} • {record.partyMillName}
                      </p>
                    </div>
                  </div>
                  <div className={isRTL ? 'text-left' : 'text-right'}>
                    <p className="text-[10px] font-bold text-sage-dark bg-sage-light/20 px-2 py-1 rounded-md">
                      {record.date}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sage-light italic text-sm">No recent activity found.</div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-3xl border border-sage-border p-8 shadow-sm">
          <h3 className="text-xl font-serif text-natural-text mb-6 font-urdu-title">Monthly Overview</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-bold tracking-widest text-sage-medium uppercase font-urdu-body">
              <span>Commission Flow</span>
              <span>{metrics.totalMonthlyVehicles > 0 ? 'Active' : 'Idle'}</span>
            </div>
            
            <div className="mt-8 pt-2">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-natural-bg rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-sage-medium mb-1 font-urdu-body">Month Total Revenue</p>
                  <p className="text-2xl font-serif text-sage-dark">Rs. {metrics.totalMonthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-natural-bg rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-sage-medium mb-1 font-urdu-body">Net Commission (All)</p>
                  <p className="text-2xl font-serif text-emerald-600">Rs. {metrics.totalCommission.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
