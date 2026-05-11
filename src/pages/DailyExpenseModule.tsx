import React, { useEffect, useState } from 'react';
import { PlusCircle, List, Info, ChevronRight, Receipt, Loader2, Calendar, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { expenseApi } from '../services/api';

interface DailyExpenseModuleProps {
  onAddClick: () => void;
  onViewClick: () => void;
}

const DailyExpenseModule: React.FC<DailyExpenseModuleProps> = ({ onAddClick, onViewClick }) => {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayTotal: 0,
    monthTotal: 0,
    recentExpenses: [] as any[],
    topCategory: 'N/A'
  });

  useEffect(() => {
    fetchExpenseStats();
  }, []);

  const fetchExpenseStats = async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getAll();
      const expenses = Array.isArray(data) ? data : [];
      
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let todaySum = 0;
      let monthSum = 0;
      const categoryCounts: Record<string, number> = {};

      expenses.forEach((exp: any) => {
        const amount = parseFloat(exp.amount) || 0;
        const expDate = new Date(exp.date || exp.createdAt);
        const expDateStr = (exp.date || exp.createdAt).split('T')[0];

        if (expDateStr === todayStr) {
          todaySum += amount;
        }

        if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
          monthSum += amount;
          const cat = exp.category || 'General';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + amount;
        }
      });

      // Find top category
      let topCat = 'General';
      let maxAmount = 0;
      Object.entries(categoryCounts).forEach(([cat, amt]) => {
        if (amt > maxAmount) {
          maxAmount = amt;
          topCat = cat;
        }
      });

      setStats({
        todayTotal: todaySum,
        monthTotal: monthSum,
        recentExpenses: expenses.slice(0, 3),
        topCategory: topCat
      });
    } catch (error) {
      console.error('Fetch Expense Stats Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      id: 'add',
      title: t('common.expensePage.addTitle'),
      description: 'Log new company expenditures, monthly bills, and fleet maintenance costs.',
      icon: PlusCircle,
      color: 'bg-sage-light',
      textColor: 'text-sage-dark',
      onClick: onAddClick
    },
    {
      id: 'view',
      title: t('common.expensePage.viewTitle'),
      description: 'Review historical operational costs and monthly financial summaries.',
      icon: List,
      color: 'bg-sage-dark',
      textColor: 'text-white',
      onClick: onViewClick
    }
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-serif text-natural-text font-urdu-title text-center md:text-left">
          {t('common.expensePage.title')}
        </h2>
        <p className="text-sage-medium max-w-2xl text-sm font-urdu-body text-center md:text-left mx-auto md:mx-0">
          {t('common.expensePage.description')}
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className="group flex flex-col items-start p-10 bg-white border border-sage-border rounded-[2.5rem] text-left hover:border-sage-light hover:shadow-xl hover:shadow-sage-light/5 transition-all w-full shadow-sm"
          >
            <div className={`p-4 rounded-3xl ${action.color} ${action.textColor} mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-black/5`}>
              <action.icon size={32} />
            </div>
            <h3 className="text-2xl font-serif text-natural-text mb-4 font-urdu-title">{action.title}</h3>
            <p className="text-sage-medium mb-8 font-urdu-body text-sm leading-relaxed">{action.description}</p>
            
            <div className="mt-auto flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-sage-dark group-hover:text-sage-light transition-colors">
              <span>{isRTL ? 'ریکارڈ دیکھیں' : 'Access Records'}</span>
              <ChevronRight size={18} className={`${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-[2.5rem] border border-sage-border p-8 md:p-12 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-natural-bg rounded-2xl flex items-center justify-center text-sage-dark border border-sage-light/20">
              <Receipt size={28} />
            </div>
            <div>
              <h4 className="text-2xl font-serif text-natural-text font-urdu-title">Expense Summary / اخراجات کا خلاصہ</h4>
              <p className="text-sage-medium text-xs font-bold uppercase tracking-widest mt-1">Real-time Financial Audit</p>
            </div>
          </div>
          <button 
            onClick={onViewClick}
            className="px-6 py-3 bg-sage-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-sage-light transition-colors shadow-lg shadow-sage-dark/10"
          >
            {isRTL ? 'مکمل رپورٹ' : 'View Full Report'}
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-sage-light">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Analyzing Financial Records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-8 bg-natural-bg/50 rounded-3xl border border-sage-border/50">
              <div className="flex items-center gap-2 text-sage-medium mb-4">
                <Calendar size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Today's Spend</span>
              </div>
              <p className="text-3xl font-serif text-sage-dark">Rs. {stats.todayTotal.toLocaleString()}</p>
              <div className="mt-4 flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                <span>Verified</span>
              </div>
            </div>

            <div className="p-8 bg-sage-dark rounded-3xl text-white shadow-xl shadow-sage-dark/10">
              <div className="flex items-center gap-2 text-white/60 mb-4">
                <TrendingDown size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Total</span>
              </div>
              <p className="text-3xl font-serif">Rs. {stats.monthTotal.toLocaleString()}</p>
              <div className="mt-4 flex items-center gap-1 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                <span>Current Cycle</span>
              </div>
            </div>

            <div className="p-8 bg-white border border-sage-border rounded-3xl">
              <div className="flex items-center gap-2 text-sage-medium mb-4">
                <div className="w-2 h-2 rounded-full bg-sage-light"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Major Category</span>
              </div>
              <p className="text-xl font-bold text-natural-text font-urdu-body">{stats.topCategory}</p>
              <p className="text-[10px] text-sage-medium mt-2 font-urdu-body">Highest recurring cost area</p>
            </div>
          </div>
        )}

        {!loading && stats.recentExpenses.length > 0 && (
          <div className="mt-12 pt-10 border-t border-sage-border/50">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-sage-medium mb-6">Recent Transactions</h5>
            <div className="space-y-3">
              {stats.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 rounded-2xl bg-natural-bg/30 border border-sage-border/30 hover:bg-natural-bg/60 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sage-medium border border-sage-border/50">
                      <Receipt size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-natural-text">{expense.description || expense.category}</p>
                      <p className="text-[10px] text-sage-medium uppercase tracking-tight">{expense.date || 'Recient'}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-sage-dark">Rs. {parseFloat(expense.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyExpenseModule;
