import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ChevronRight,
  Printer,
  FileText,
  PieChart,
  Save,
  Loader2,
  Archive
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';

interface ReportsProps {
  onBack: () => void;
}

const Reports: React.FC<ReportsProps> = ({ onBack }) => {
  const { t, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [archivedReports, setArchivedReports] = useState<any[]>([]);
  
  // Real Data State
  const [calculatedData, setCalculatedData] = useState<any>({
    period: "",
    revenue: 0,
    expenses: 0,
    breakdown: []
  });

  useEffect(() => {
    if (showArchive) {
      fetchArchives();
    } else {
      fetchRealData();
    }
  }, [activeTab, showArchive]);

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setArchivedReports(data);
      }
    } catch (error) {
      console.error('Archive Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealData = async () => {
    try {
      setLoading(true);
      const [vRes, eRes] = await Promise.all([
        fetch('/api/vehicle-records'),
        fetch('/api/expenses')
      ]);

      if (vRes.ok && eRes.ok) {
        const vData = await vRes.json();
        const vehicles = Array.isArray(vData.data) ? vData.data : [];
        const eData = await eRes.json();
        const expenses = Array.isArray(eData.data) ? eData.data : [];

        // Calculate based on current selection
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentYear = now.getFullYear().toString();

        const filterPeriod = activeTab === 'monthly' ? currentMonth : currentYear;
        
        // Filter vehicles
        const filteredVehicles = vehicles.filter((v: any) => {
          const date = v.createdAt ? v.createdAt.substring(0, activeTab === 'monthly' ? 7 : 4) : '';
          return date === filterPeriod;
        });

        // Filter expenses
        const filteredExpenses = expenses.filter((e: any) => {
          const date = e.date ? e.date.substring(0, activeTab === 'monthly' ? 7 : 4) : '';
          return date === filterPeriod;
        });

        const revenue = filteredVehicles.reduce((sum: number, v: any) => {
          return sum + (v.partyKariya || 0);
        }, 0);

        const vehicleCosts = filteredVehicles.reduce((sum: number, v: any) => {
          return sum + (v.vehicleKariya || 0);
        }, 0);

        const opertaionExpenses = filteredExpenses.reduce((sum: number, e: any) => {
          return sum + (parseFloat(e.amount) || 0);
        }, 0);

        const totalExpenses = vehicleCosts + opertaionExpenses;

        setCalculatedData({
          period: activeTab === 'monthly' ? `Current: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}` : `Current Year: ${currentYear}`,
          revenue,
          expenses: totalExpenses,
          breakdown: [
            { category: "Logistics Revenue", amount: revenue, type: 'income' },
            { category: "Transporter Payments", amount: vehicleCosts, type: 'expense' },
            { category: "Operational Expenses", amount: opertaionExpenses, type: 'expense' }
          ]
        });
      }
    } catch (error) {
      console.error('Data Fetch Error:', error);
      addNotification('error', 'Failed to calculate live report data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: calculatedData.period,
          revenue: calculatedData.revenue,
          expenses: calculatedData.expenses,
          net: calculatedData.revenue - calculatedData.expenses,
          type: activeTab,
          details: calculatedData.breakdown
        })
      });

      if (response.ok) {
        addNotification('success', 'Report archived successfully.');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      addNotification('error', 'Failed to save report record.');
    } finally {
      setSaving(false);
    }
  };

  // Dummy logic for "End of month" detection
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const isEndOfMonth = today.getDate() === lastDayOfMonth.getDate();

  const data = calculatedData;
  const net = data.revenue - data.expenses;

  if (showArchive) {
    return (
      <div className="space-y-6 pb-20">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-4xl font-serif text-natural-text font-urdu-title">Archive Records</h2>
          <button 
            onClick={() => setShowArchive(false)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-xl font-bold"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-20 text-center">
                <Loader2 className="animate-spin mx-auto text-sage-medium" size={40} />
             </div>
          ) : archivedReports.length === 0 ? (
            <div className="col-span-full py-20 text-center text-sage-medium border border-dashed border-sage-border rounded-3xl">
              No archived reports found.
            </div>
          ) : (
            archivedReports.map((report) => (
              <div key={report.id} className="bg-white border border-sage-border rounded-[2rem] p-6 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-sage-dark text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">{report.type}</span>
                  <span className="text-[10px] text-sage-medium font-bold">{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xl font-bold text-natural-text mb-4 truncate">{report.period}</h4>
                <div className="space-y-2 border-t border-sage-border pt-4">
                  <div className="flex justify-between text-xs font-bold text-sage-medium">
                    <span>REVENUE</span>
                    <span>Rs. {report.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-red-500">
                    <span>EXPENSES</span>
                    <span>Rs. {report.expenses.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between text-base font-black pt-2 ${report.net >= 0 ? 'text-emerald-600' : 'text-red-700'}`}>
                    <span>NET</span>
                    <span>Rs. {Math.abs(report.net).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-4xl font-serif text-natural-text font-urdu-title">
            {t('common.reportsPage.title')}
          </h2>
          <p className="text-sage-medium max-w-2xl text-sm font-urdu-body mt-2">
            {t('common.reportsPage.description')}
          </p>
        </div>
        
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
           <button 
             onClick={() => setShowArchive(true)}
             className="flex items-center gap-2 px-6 py-3 bg-natural-bg/50 border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all shadow-sm"
           >
             <Archive size={18} />
             <span>History</span>
           </button>
           <button 
            onClick={onBack}
            className={`flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            {t('common.reportsPage.buttons.back')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center p-1 bg-natural-bg rounded-2xl w-fit ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={() => setActiveTab('monthly')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all font-urdu-body ${activeTab === 'monthly' ? 'bg-white text-sage-dark shadow-sm' : 'text-sage-medium hover:bg-white/50'}`}
          >
            {t('common.reportsPage.monthly')}
          </button>
          <button 
            onClick={() => setActiveTab('yearly')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all font-urdu-body ${activeTab === 'yearly' ? 'bg-white text-sage-dark shadow-sm' : 'text-sage-medium hover:bg-white/50'}`}
          >
            {t('common.reportsPage.yearly')}
          </button>
        </div>

        <button 
          onClick={handleSaveReport}
          disabled={saving || loading}
          className={`flex items-center gap-2 px-8 py-3 bg-sage-dark text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all ${saving ? 'opacity-50' : ''}`}
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          <span>Archive This Report</span>
        </button>
      </div>

      {/* Notice Board */}
      <div className={`bg-sage-dark/5 border border-sage-border rounded-2xl p-6 flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
        <div className="p-2 bg-sage-dark text-white rounded-lg">
          <Calendar size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sage-dark font-urdu-title tracking-tight text-lg">
            {isEndOfMonth ? "THIS MONTH REPORT (FINAL)" : t('common.reportsPage.previousMonth')}
          </h4>
          <p className="text-xs text-sage-medium font-urdu-body mt-1">
            {loading ? "Calculating fresh metrics from secure vault..." : (isEndOfMonth 
              ? <span className="text-emerald-600 font-bold uppercase tracking-wider">Note: Today is the end of the month. Displaying the finalized report for this cycle.</span> 
              : `Showing live financial status for current ${activeTab} period.`)}
          </p>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Summary Stats */}
        <div className="space-y-6">
          <div className="bg-white border border-sage-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
                <Loader2 className="animate-spin text-sage-medium" size={32} />
              </div>
            )}
            <h3 className="text-xl font-serif text-natural-text mb-6 font-urdu-title">{t('common.reportsPage.summary')}</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-sage-border pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-sage-medium">{t('common.reportsPage.revenue')}</span>
                <span className="text-2xl font-black text-sage-dark">Rs. {data.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end border-b border-sage-border pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-sage-medium">{t('common.reportsPage.expenses')}</span>
                <span className="text-2xl font-black text-red-500">Rs. {data.expenses.toLocaleString()}</span>
              </div>
              <div className={`p-6 rounded-3xl mt-4 ${net >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                <div className="flex items-center justify-between mb-2">
                   <span className={`text-[10px] font-black uppercase tracking-widest ${net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {net >= 0 ? t('common.reportsPage.netProfit') : t('common.reportsPage.netLoss')}
                   </span>
                   {net >= 0 ? <TrendingUp size={16} className="text-emerald-600" /> : <TrendingDown size={16} className="text-red-600" />}
                </div>
                <div className={`text-4xl font-black ${net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  Rs. {Math.abs(net).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-sage-dark text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
              <PieChart size={120} />
            </div>
            <h3 className="text-lg font-serif mb-4 font-urdu-title">{t('common.reportsPage.status')}</h3>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${net >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`}>
                <div className="w-8 h-8 rounded-full bg-sage-dark flex items-center justify-center font-black text-[10px]">
                  {net >= 0 ? 'OK' : '!!'}
                </div>
              </div>
              <div>
                <p className="text-2xl font-black uppercase tracking-tighter">
                  {net >= 0 ? t('common.reportsPage.profit') : t('common.reportsPage.loss')}
                </p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">{activeTab.toUpperCase()} MARGIN: {data.revenue > 0 ? ((Math.abs(net)/data.revenue)*100).toFixed(1) : '0'}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Spreadsheet Breakdown */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-sage-border rounded-[2.5rem] shadow-xl overflow-hidden h-full flex flex-col relative">
             {loading && (
              <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
                <Loader2 className="animate-spin text-sage-medium" size={32} />
              </div>
             )}
            <div className="bg-natural-bg/50 p-6 border-b border-sage-border flex items-center justify-between">
              <div>
                <h3 className="font-serif text-sage-dark font-urdu-title">{t('common.reportsPage.period')}</h3>
                <p className="text-2xl font-black tracking-tighter text-natural-text uppercase">{data.period}</p>
              </div>
              <div className="px-4 py-1.5 bg-white border border-sage-border rounded-lg text-[10px] font-black uppercase tracking-widest text-sage-medium">
                Verified Ledger
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-natural-bg/30 text-left border-b border-sage-border">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-sage-medium font-urdu-title text-center w-20">Type</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-sage-medium font-urdu-title">Category</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-sage-medium font-urdu-title text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-border">
                  {data.breakdown.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-natural-bg/20 transition-colors group">
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {item.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          </div>
                          <span className="font-bold text-natural-text font-urdu-body">{item.category}</span>
                        </div>
                      </td>
                      <td className={`px-8 py-5 text-right font-black ${item.type === 'income' ? 'text-sage-dark' : 'text-red-500'}`}>
                        {item.type === 'income' ? '+' : '-'} {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {/* Empty Fillers */}
                  {[1, 2].map(i => (
                    <tr key={`empty-${i}`} className="h-16">
                      <td colSpan={3} className="bg-natural-bg/10 border-dashed border-b border-sage-border"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-sage-dark text-white/40 text-[10px] font-black uppercase tracking-widest flex justify-between">
              <span>Financial Audit Trail: SECURE</span>
              <span className={activeTab === 'monthly' ? 'text-emerald-400' : ''}>
                {isEndOfMonth && activeTab === 'monthly' ? 'FINALIZED REPORT FOR THIS MONTH' : 'INTERIM ANALYSIS'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
