import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { expenseApi } from '../services/api';

interface AddDailyExpenseProps {
  onBack: () => void;
}

const AddDailyExpense: React.FC<AddDailyExpenseProps> = ({ onBack }) => {
  const { t, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState('');
  const [rows, setRows] = useState([
    { date: new Date().toISOString().split('T')[0], description: '', amount: '' }
  ]);

  const handleInputChange = (index: number, field: string, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const addNewRow = () => {
    setRows([...rows, { date: new Date().toISOString().split('T')[0], description: '', amount: '' }]);
  };

  const handleSave = async () => {
    if (!month) {
      addNotification('warning', 'Please select a month.');
      return;
    }

    const validRows = rows.filter(r => r.description && r.amount);
    if (validRows.length === 0) {
      addNotification('warning', 'Please add at least one expense description and amount.');
      return;
    }

    try {
      setLoading(true);
      await Promise.all(validRows.map(row => 
        expenseApi.create({
          expenseMonth: month,
          date: row.date,
          description: row.description,
          amount: parseFloat(row.amount)
        })
      ));

      addNotification('success', t('common.notifications.messages.expenseAdded'));
      onBack();
    } catch (error: any) {
      console.error('Save Error:', error);
      addNotification('error', error.message || 'Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-4xl font-serif text-natural-text font-urdu-title">
            {t('common.expensePage.addTitle')}
          </h2>
          <p className="text-sage-medium max-w-2xl text-sm font-urdu-body mt-2">
            {t('common.expensePage.description')}
          </p>
        </div>
        
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
          {t('common.expensePage.buttons.back')}
        </button>
      </div>

      <div className="bg-white border border-sage-border rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="bg-sage-dark text-white p-6 border-b border-white/10 text-center">
          <h1 className="text-2xl font-serif tracking-widest uppercase font-urdu-title">
            {t('common.vehiclePage.form.excelHeader')}
          </h1>
          <p className="text-white/40 text-[10px] mt-1 font-bold uppercase tracking-[0.2em]">Company Daily Expenses Entry</p>
        </div>

        <div className={`p-6 border-b border-sage-border bg-natural-bg/30 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex flex-col gap-1 flex-1 max-w-xs">
            <label className={`text-[10px] font-bold uppercase text-sage-medium font-urdu-title ${isRTL ? 'text-right' : ''}`}>
              {t('common.expensePage.month')}
            </label>
            <div className="relative">
              <input 
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="e.g. May 2026"
                className={`w-full bg-transparent border-b-2 border-sage-border py-1 text-lg font-serif focus:outline-none focus:border-sage-dark transition-all ${isRTL ? 'text-right' : ''} font-urdu-body`}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-natural-bg/80 border-b border-sage-border">
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-sage-medium border-x border-sage-border font-urdu-title min-w-[150px]">
                  {t('common.expensePage.fields.date')}
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-sage-medium border-x border-sage-border font-urdu-title min-w-[400px]">
                  {t('common.expensePage.fields.description')}
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-sage-medium border-x border-sage-border font-urdu-title min-w-[150px]">
                  {t('common.expensePage.fields.amount')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b border-sage-border hover:bg-natural-bg/20 transition-colors">
                  <td className="p-0 border-x border-sage-border">
                    <input 
                      type="date"
                      value={row.date}
                      onChange={(e) => handleInputChange(index, 'date', e.target.value)}
                      className={`w-full px-4 py-3 text-sm bg-transparent focus:outline-none ${isRTL ? 'text-right' : ''} font-urdu-body`}
                    />
                  </td>
                  <td className="p-0 border-x border-sage-border">
                    <input 
                      type="text"
                      value={row.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      className={`w-full px-4 py-3 text-sm bg-transparent focus:outline-none ${isRTL ? 'text-right' : ''} font-urdu-body`}
                    />
                  </td>
                  <td className="p-0 border-x border-sage-border">
                    <input 
                      type="number"
                      value={row.amount}
                      onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                      className={`w-full px-4 py-3 text-sm bg-transparent focus:outline-none font-bold ${isRTL ? 'text-right' : ''} font-urdu-body`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`p-4 bg-natural-bg/50 border-t border-sage-border flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={addNewRow}
            className="flex items-center gap-2 px-6 py-2 bg-white border border-sage-border rounded-xl text-xs font-bold text-sage-dark hover:bg-natural-bg transition-all shadow-sm"
          >
            <Plus size={16} /> Add Daily Entry
          </button>
          <div className="text-sage-medium text-[10px] font-bold uppercase tracking-widest">
            Logistics Operational Expense Sheet
          </div>
        </div>
      </div>

      <div className={`flex justify-end gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <motion.button 
          onClick={handleSave}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-10 py-4 bg-sage-dark text-white rounded-2xl font-bold flex items-center gap-2 shadow-2xl shadow-sage-dark/20 hover:bg-natural-text transition-all font-urdu-body ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {loading ? 'Saving...' : t('common.expensePage.buttons.save')}
        </motion.button>
      </div>
    </div>
  );
};

export default AddDailyExpense;
