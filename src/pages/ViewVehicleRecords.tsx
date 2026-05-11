import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Download,
  Printer,
  Search,
  Loader2,
  Trash2,
  Edit,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { vehicleApi } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FixedSizeList as List } from 'react-window';

interface ViewVehicleRecordsProps {
  onBack: () => void;
}

const ViewVehicleRecords: React.FC<ViewVehicleRecordsProps> = ({ onBack }) => {
  const { t, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const result = await vehicleApi.getAll(isLoadMore ? nextCursor || undefined : undefined);
      const recordsArray = Array.isArray(result.data) ? result.data : [];
      
      if (isLoadMore) {
        setRecords(prev => [...prev, ...recordsArray]);
      } else {
        setRecords(recordsArray);
      }
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Fetch Error:', error);
      addNotification('error', 'Failed to load records from database.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleEditClick = (record: any) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm) return;
    try {
      const { srNo, ...updateData } = editForm;
      await vehicleApi.update(editingId, updateData);
      addNotification('success', 'Record updated successfully.');
      setEditingId(null);
      fetchRecords();
    } catch (error: any) {
      addNotification('error', error.message || 'Failed to update record');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      setDeletingId(id);
      await vehicleApi.delete(id);
      addNotification('success', 'Record deleted successfully.');
      fetchRecords();
    } catch (error) {
      addNotification('error', 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRecords = records.filter(row => 
    row.biltyNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.truckNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.partyMillName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'srNo', label: 'Sr#', width: '60px' },
    { key: 'biltyNo', label: 'Bilty#', width: '100px' },
    { key: 'truckNo', label: 'Truck#', width: '150px' },
    { key: 'driverNo', label: 'Driver#', width: '150px' },
    { key: 'partyKariya', label: 'Party Rent', width: '120px' },
    { key: 'mlcsKariya', label: 'MLCS Rent', width: '120px' },
    { key: 'vehicleKariya', label: 'Veh. Rent', width: '120px' },
    { key: 'commission', label: 'Comm.', width: '100px' },
    { key: 'commissionStatus', label: 'Status', width: '100px' },
    { key: 'description', label: 'Description', width: '250px' },
    { key: 'loadingStation', label: 'Loading', width: '150px' },
    { key: 'unloadingStation', label: 'Unloading', width: '150px' },
    { key: 'partyMillName', label: 'Party/Mill', width: '200px' },
    { key: 'broker', label: 'Broker', width: '150px' },
    { key: 'tafseelAkhrajat', label: 'Expenses', width: '200px' },
  ];

  const handlePrint = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text("Madad Logistic container services", 14, 18);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 26);
      doc.text(`Total Count: ${filteredRecords.length}`, 283, 26, { align: 'right' });

      const pdfHeaders = columns.map(c => c.label);
      const tableData = filteredRecords.map((row) => columns.map(col => row[col.key] || ''));

      autoTable(doc, {
        head: [pdfHeaders],
        body: tableData,
        startY: 32,
        theme: 'striped',
        styles: { fontSize: 6.5, cellPadding: 1.5, overflow: 'linebreak', font: 'helvetica' },
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      });

      doc.save(`vehicle_ledger_${new Date().toISOString().split('T')[0]}.pdf`);
      addNotification('success', 'Professional PDF Ledger downloaded');
    } catch (error) {
      addNotification('error', 'PDF Generation failed.');
    }
  };

  const handleDownloadCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = columns.map(col => col.label).join(',');
    const csvContent = filteredRecords.map(row => 
      columns.map(col => `"${(row[col.key] || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([`${headers}\n${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vehicle_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6 pb-20">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-4xl font-serif text-natural-text font-urdu-title">{t('common.vehiclePage.viewVehicles')}</h2>
          <p className="text-sage-medium max-w-2xl text-sm font-urdu-body mt-2">Enterprise-grade virtualized transaction ledger.</p>
        </div>
        
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''} print:hidden`}>
           <button onClick={handlePrint} className="p-3 bg-white border border-sage-border rounded-xl text-sage-medium hover:text-sage-dark"><Printer size={20} /></button>
           <button onClick={handleDownloadCSV} className="p-3 bg-white border border-sage-border rounded-xl text-sage-medium hover:text-sage-dark"><Download size={20} /></button>
           <button onClick={onBack} className={`flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            {t('common.vehiclePage.form.buttons.back')}
          </button>
        </div>
      </div>

      <div className="bg-white border border-sage-border rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="bg-sage-dark text-white p-6 text-center">
          <h1 className="text-2xl font-serif tracking-widest uppercase font-urdu-title">{t('common.vehiclePage.form.excelHeader')}</h1>
        </div>

        <div className={`p-4 border-b border-sage-border flex items-center justify-between bg-natural-bg/50 print:hidden ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="relative w-full max-w-xs">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-sage-medium`} size={16} />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-white border border-sage-border rounded-lg py-2 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-xs focus:outline-none font-urdu-body`}
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[1800px]">
            <div className="flex bg-natural-bg/80 border-b border-sage-border sticky top-0 z-20">
              {columns.map((col) => (
                <div key={col.key} style={{ width: col.width }} className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-sage-medium border-x border-sage-border">
                  {col.label}
                </div>
              ))}
              <div className="w-[100px] px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-sage-medium border-x border-sage-border">Actions</div>
            </div>

            <div style={{ height: '600px' }}>
              {loading ? (
                <div className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-sage-medium mb-4" size={32} />
                  <p className="text-sm font-bold uppercase text-sage-medium">Loading Vault...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="py-20 text-center text-sage-medium">No records found.</div>
              ) : (
                <List height={600} itemCount={filteredRecords.length} itemSize={55} width="100%">
                  {({ index, style }) => {
                    const row = filteredRecords[index];
                    const isEditing = editingId === row.id;
                    return (
                      <div style={style} className="flex border-b border-sage-border group hover:bg-natural-bg/20 transition-colors items-center">
                        {columns.map((col) => (
                          <div key={col.key} style={{ width: col.width }} className={`px-4 py-2 text-xs border-x border-sage-border truncate font-urdu-body ${col.key === 'srNo' ? 'font-bold text-center' : ''}`}>
                            {isEditing && col.key !== 'srNo' ? (
                              <input 
                                value={editForm[col.key] || ''} 
                                onChange={(e) => setEditForm({...editForm, [col.key]: e.target.value})}
                                className="w-full bg-white border border-sage-light/30 rounded px-1 py-1 focus:outline-none"
                              />
                            ) : (
                              col.key === 'srNo' ? (index + 1) : row[col.key]
                            )}
                          </div>
                        ))}
                        <div className="w-[100px] px-4 py-2 flex items-center gap-2 justify-center border-x border-sage-border">
                          {isEditing ? (
                            <button onClick={handleSaveEdit} className="p-1 bg-emerald-50 text-emerald-600 rounded"><Check size={14} /></button>
                          ) : (
                            <button onClick={() => handleEditClick(row)} className="p-1 bg-sage-light/30 rounded"><Edit size={14} /></button>
                          )}
                          <button onClick={() => handleDelete(row.id)} className="p-1 bg-red-50 text-red-600 rounded"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    );
                  }}
                </List>
              )}
            </div>
          </div>
        </div>

        {nextCursor && (
          <div className="p-6 flex justify-center bg-natural-bg/10 border-t border-sage-border">
            <button onClick={() => fetchRecords(true)} disabled={loadingMore} className="px-10 py-3 bg-white border border-sage-border rounded-xl text-sage-dark font-bold text-sm hover:bg-natural-bg disabled:opacity-50">
              {loadingMore ? <Loader2 size={16} className="animate-spin" /> : 'Load More Records'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewVehicleRecords;
