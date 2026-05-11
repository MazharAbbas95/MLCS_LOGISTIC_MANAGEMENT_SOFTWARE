import React, { useEffect, useState } from 'react';
import { ArrowLeft, Printer, Search, Receipt, Loader2, Calendar, Trash2, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { expenseApi } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FixedSizeList as List } from 'react-window';

interface ViewDailyExpensesProps {
  onBack: () => void;
}

const ViewDailyExpenses: React.FC<ViewDailyExpensesProps> = ({ onBack }) => {
  const { t, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const result = await expenseApi.getAll(isLoadMore ? nextCursor || undefined : undefined);
      const dataArray = Array.isArray(result.data) ? result.data : [];
      
      if (isLoadMore) {
        setExpenses(prev => [...prev, ...dataArray]);
      } else {
        setExpenses(dataArray);
      }
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Fetch Error:', error);
      addNotification('error', 'Failed to load expenses from database.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handlePrint = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Add Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text("Madad Logistic container services", 105, 18, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(`Total Monthly Sum: Rs. ${totalAmount.toLocaleString()}`, 196, 28, { align: 'right' });

      const tableData = filteredExpenses.map((exp) => [
        exp.date || '',
        exp.description || '',
        `Rs. ${parseFloat(exp.amount).toLocaleString()}`,
        exp.category || 'General',
        exp.expenseMonth || ''
      ]);

      const tableHeaders = [['Date', 'Description', 'Amount (PKR)', 'Category', 'Month']];

      autoTable(doc, {
        head: tableHeaders,
        body: tableData,
        startY: 34,
        theme: 'striped',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        }
      });

      doc.save(`expense_report_${new Date().toISOString().split('T')[0]}.pdf`);
      addNotification('success', 'Professional Expense Report downloaded');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      addNotification('error', 'PDF Generation failed. Using standard browser print.');
      window.print();
    }
  };

  const handleDownloadCSV = () => {
    if (filteredExpenses.length === 0) return;

    const headers = ['Date', 'Description', 'Amount', 'Category', 'Month'];
    const csvContent = filteredExpenses.map(exp => {
      return [
        exp.date || '',
        `"${(exp.description || '').replace(/"/g, '""')}"`,
        exp.amount || 0,
        exp.category || 'General',
        exp.expenseMonth || ''
      ].join(',');
    }).join('\n');

    const blob = new Blob([`${headers.join(',')}\n${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      setDeletingId(id);
      await expenseApi.delete(id);
      addNotification('success', 'Expense deleted successfully.');
      fetchExpenses();
    } catch (error) {
      addNotification('error', 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.expenseMonth?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Print Only Header */}
      <div className="hidden print:block mb-8 text-center border-b-2 border-sage-dark pb-6">
        <h1 className="text-3xl font-serif font-bold text-natural-text uppercase tracking-widest">
          Madad Logistic container services
        </h1>
        <div className="flex justify-between mt-4 text-[10px] font-bold text-sage-medium px-4">
          <span>Printed on: {new Date().toLocaleDateString()}</span>
          <span>Total Monthly Sum: Rs. {totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-4xl font-serif text-natural-text font-urdu-title">
            {t('common.expensePage.viewTitle')}
          </h2>
          <p className="text-sage-medium max-w-2xl text-sm font-urdu-body mt-2">
            Historical audit of daily organizational expenditures categorized by monthly cycles.
          </p>
        </div>
        
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''} print:hidden`}>
           <button 
             onClick={handlePrint}
             className="p-3 bg-white border border-sage-border rounded-xl text-sage-medium hover:text-sage-dark transition-all"
             title="Print Ledger"
           >
             <Printer size={20} />
           </button>
           <button 
             onClick={handleDownloadCSV}
             className="p-3 bg-white border border-sage-border rounded-xl text-sage-medium hover:text-sage-dark transition-all"
             title="Download CSV"
           >
             <Download size={20} />
           </button>
           <button 
            onClick={onBack}
            className={`flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            {t('common.expensePage.buttons.back')}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className="bg-sage-dark text-white p-8 rounded-[2rem] shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Total Displayed Expense</p>
            <h3 className="text-3xl font-black">Rs. {totalAmount.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <Receipt size={24} />
          </div>
        </div>
        <div className="bg-white border border-sage-border p-8 rounded-[2rem] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sage-medium mb-2">Total Records</p>
            <h3 className="text-3xl font-black text-natural-text">{filteredExpenses.length}</h3>
          </div>
          <div className="w-12 h-12 bg-natural-bg rounded-full flex items-center justify-center text-sage-medium">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
        <div className="relative w-full md:w-96">
          <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-sage-medium`} size={16} />
          <input 
            type="text" 
            placeholder="Search by description or month..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-white border border-sage-border rounded-xl py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm focus:outline-none focus:ring-2 focus:ring-sage-light/20 font-urdu-body shadow-sm`}
          />
        </div>
      </div>

      {/* Data Table Container with Virtualization */}
      <div className="bg-white border border-sage-border rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="bg-natural-bg/50 px-8 py-5 border-b border-sage-border">
          <div className="flex text-[10px] font-black uppercase tracking-[0.2em] text-sage-medium">
            <div className="w-[15%]">Date</div>
            <div className="w-[45%]">Description</div>
            <div className="w-[15%]">Amount (PKR)</div>
            <div className="w-[15%] italic">Reporting Month</div>
            <div className="w-[10%] text-right print:hidden">Actions</div>
          </div>
        </div>

        <div style={{ height: '500px' }}>
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-sage-medium mb-4" size={32} />
              <p className="text-sm text-sage-medium font-bold uppercase tracking-widest">Opening Ledger Vault...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="py-20 text-center text-sage-medium">
              <div className="w-16 h-16 bg-natural-bg rounded-full flex items-center justify-center mx-auto mb-4 text-sage-border opacity-50">
                <Receipt size={32} />
              </div>
              No expense records found.
            </div>
          ) : (
            <List
              height={500}
              itemCount={filteredExpenses.length}
              itemSize={70}
              width="100%"
            >
              {({ index, style }) => {
                const expense = filteredExpenses[index];
                return (
                  <div style={style} className="border-b border-sage-border hover:bg-natural-bg/20 transition-colors flex items-center px-8 text-sm">
                    <div className="w-[15%] font-bold text-sage-medium">{expense.date}</div>
                    <div className="w-[45%] text-natural-text font-urdu-body font-medium truncate pr-4">{expense.description}</div>
                    <div className="w-[15%] font-black text-red-500">Rs. {parseFloat(expense.amount).toLocaleString()}</div>
                    <div className="w-[15%]">
                       <span className="px-3 py-1 bg-natural-bg border border-sage-border rounded-lg text-[10px] font-black uppercase tracking-widest text-sage-medium">
                        {expense.expenseMonth}
                      </span>
                    </div>
                    <div className="w-[10%] text-right print:hidden">
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        {deletingId === expense.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                );
              }}
            </List>
          )}
        </div>

        {nextCursor && (
          <div className="p-4 flex justify-center bg-natural-bg/10 border-t border-sage-border">
            <button
              onClick={() => fetchExpenses(true)}
              disabled={loadingMore}
              className="flex items-center gap-2 px-8 py-2 bg-white border border-sage-border rounded-xl text-sage-dark font-bold text-xs hover:bg-natural-bg transition-all shadow-sm disabled:opacity-50"
            >
              {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>{loadingMore ? 'Loading...' : 'Load More History'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDailyExpenses;
