import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Printer, 
  FileText, 
  Loader2, 
  Calendar,
  Truck,
  MapPin,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { biltyApi } from '../services/api';
import jsPDF from 'jspdf';

import { FixedSizeList as List } from 'react-window';

interface BiltyArchiveProps {
  onBack: () => void;
  onViewBilty?: (bilty: any) => void;
}

const BiltyArchive: React.FC<BiltyArchiveProps> = ({ onBack }) => {
  const { t, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const [bilties, setBilties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBilties();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchBilties = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const result = await biltyApi.getAll(
        isLoadMore ? nextCursor || undefined : undefined,
        20,
        searchTerm || undefined
      );
      
      const data = Array.isArray(result.data) ? result.data : [];
      
      if (isLoadMore) {
        setBilties(prev => [...prev, ...data]);
      } else {
        setBilties(data);
      }
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Fetch Error:', error);
      addNotification('error', 'Failed to load bilty archive.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this record forever?')) return;
    try {
      setDeletingId(id);
      await biltyApi.delete(id);
      addNotification('success', 'Bilty record deleted.');
      fetchBilties();
    } catch (error) {
      addNotification('error', 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrint = (bilty: any) => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Background Border
      doc.setDrawColor(44, 62, 80);
      doc.setLineWidth(0.8);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');

      // HEADER SECTION
      // Top Navy Bar
      doc.setFillColor(44, 62, 80);
      doc.rect(5, 5, pageWidth - 10, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("Head Office: Nag Shah Chowk, Muzaffargarh Road near NHA Office Multan", pageWidth / 2, 14.5, { align: 'center' });

      // Main Branding
      doc.setTextColor(44, 62, 80);
      doc.setFontSize(32);
      doc.text("Madad Logistic container services", pageWidth / 2, 35, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text("NTN # C727312-4  |  Contact: 0300-8632436, 0300-8633436, 0301-2066565", pageWidth / 2, 42, { align: 'center' });

      // LOGO CIRCLE (Simulation)
      doc.setDrawColor(39, 174, 96);
      doc.setLineWidth(1);
      doc.circle(25, 32, 12);
      doc.setFontSize(6);
      doc.setTextColor(44, 62, 80);
      doc.text("MADAD", 25, 31, { align: 'center' });
      doc.text("LOGISTICS", 25, 34, { align: 'center' });

      // Content Layout Divider
      doc.setDrawColor(44, 62, 80);
      doc.setLineWidth(0.3);
      doc.line(10, 50, pageWidth - 10, 50);

      // Row 1: Bilty Date and Truck Info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Bilty No:`, 15, 60);
      doc.setTextColor(231, 76, 60); // Red for Bilty No
      doc.text(bilty.biltyNo || '', 35, 60);
      
      doc.setTextColor(44, 62, 80);
      doc.text(`Date:`, 80, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(bilty.date || '', 95, 60);

      doc.setFont('helvetica', 'bold');
      doc.text(`Truck No:`, 150, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(bilty.truckNo || '', 175, 60);

      doc.setFont('helvetica', 'bold');
      doc.text(`Driver No:`, 220, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(bilty.driverNo || '', 245, 60);

      // Row 2: CNIC and Shipping Line
      doc.setFont('helvetica', 'bold');
      doc.text(`CNIC:`, 15, 70);
      doc.setFont('helvetica', 'normal');
      doc.text(Array.isArray(bilty.cnic) ? bilty.cnic.join('') : (bilty.cnic || ''), 35, 70);

      doc.setFont('helvetica', 'bold');
      doc.text(`Shipping Line:`, 150, 70);
      doc.setFont('helvetica', 'normal');
      doc.text(bilty.shippingLine || 'N/A', 185, 70);

      // Row 3: Locations
      doc.setFont('helvetica', 'bold');
      doc.text(`Origin:`, 15, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(bilty.origin || '', 35, 80);

      doc.setFont('helvetica', 'bold');
      doc.text(`Destination:`, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(bilty.destination || '', 110, 80);

      // Row 4: Partners
      doc.setFont('helvetica', 'bold');
      doc.text(`Sender:`, 15, 90);
      doc.setFont('helvetica', 'normal');
      doc.text(bilty.sender || '', 35, 90);

      doc.setFont('helvetica', 'bold');
      doc.text(`Receiver:`, 150, 90);
      doc.setFont('helvetica', 'normal');
      doc.text(bilty.receiver || '', 175, 90);
      
      // Note under Receiver
      doc.setFontSize(8);
      doc.setTextColor(231, 76, 60);
      doc.text("NOTE: Your goods' safety is our priority. Terms and conditions are on the reverse side.", 150, 94);
      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80);

      // MAIN TABLE
      // Table Header
      doc.setFillColor(44, 62, 80);
      doc.rect(10, 100, pageWidth - 20, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text("QUANTITY", 30, 106.5, { align: 'center' });
      doc.text("DESCRIPTION / GOODS DETAILS", 110, 106.5, { align: 'center' });
      doc.text("FINANCIAL DETAILS", 240, 106.5, { align: 'center' });

      // Table Body Box
      doc.setDrawColor(44, 62, 80);
      doc.setLineWidth(0.5);
      doc.rect(10, 110, pageWidth - 20, 60, 'S');
      doc.line(50, 110, 50, 170); // Qty divider
      doc.line(180, 110, 180, 170); // Desc divider

      // Data in Table
      doc.setTextColor(44, 62, 80);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(bilty.quantity || '', 30, 120, { align: 'center' });
      
      const descLines = doc.splitTextToSize(bilty.description || '', 120);
      doc.text(descLines, 55, 120);

      // Financials Sub-table on right side of main table
      const finX = 180;
      doc.line(finX, 130, pageWidth - 10, 130);
      doc.line(finX, 140, pageWidth - 10, 140);
      doc.line(finX, 150, pageWidth - 10, 150);
      doc.line(finX, 160, pageWidth - 10, 160);
      doc.line(240, 130, 240, 170); // Vertical divider in fin box

      doc.setFont('helvetica', 'bold');
      doc.text("Total Fare:", finX + 5, 146.5);
      doc.text(String(bilty.totalFare || '0'), 245, 146.5);
      
      doc.text("Advance:", finX + 5, 156.5);
      doc.text(String(bilty.advance || '0'), 245, 156.5);
      
      doc.setFillColor(44, 62, 80);
      doc.rect(finX, 160, pageWidth - 10 - finX, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text("BALANCE:", finX + 5, 166.5);
      doc.setFontSize(12);
      doc.text(String(bilty.balance || '0'), 245, 166.5);

      // Container No Area
      doc.setTextColor(44, 62, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("Container No:", 15, 180);
      doc.setFont('helvetica', 'normal');
      doc.text(Array.isArray(bilty.containerNo) ? bilty.containerNo.join('') : (bilty.containerNo || ''), 45, 180);

      // FOOTER
      const footerY = 195;
      doc.line(15, footerY, 65, footerY);
      doc.text("Sender Signature", 40, footerY + 5, { align: 'center' });

      doc.line(115, footerY, 165, footerY);
      doc.text("Receiver Signature", 140, footerY + 5, { align: 'center' });

      doc.line(215, footerY, 265, footerY);
      doc.text("Authorized Signature", 240, footerY + 5, { align: 'center' });

      doc.save(`bilty_${bilty.biltyNo}.pdf`);
      addNotification('success', 'Professional PDF Downloaded');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      addNotification('error', 'PDF Download failed.');
    }
  };

  const displayBilties = bilties;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-4xl font-serif text-natural-text font-urdu-title">
            Bilty Archive / ریکارڈ بلٹی
          </h2>
          <p className="text-sage-medium max-w-2xl text-sm font-urdu-body mt-2">
            Centralized digital storage for all generated Goods Forwarding Notes.
          </p>
        </div>
        
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
           <button 
            onClick={onBack}
            className={`flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            {t('common.reportsPage.buttons.back')}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto md:mx-0">
        <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-sage-medium`} size={18} />
        <input 
          type="text" 
          placeholder="Search by Bilty #, Truck, or Party Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full bg-white border border-sage-border rounded-2xl py-4 ${isRTL ? 'pr-12 pl-6' : 'pl-12 pr-6'} text-sm focus:outline-none focus:ring-4 focus:ring-sage-light/10 font-urdu-body shadow-lg shadow-black/5`}
        />
      </div>

      {/* Virtualized List of Bilties */}
      <div className="bg-white border border-sage-border rounded-[3rem] shadow-xl overflow-hidden" style={{ height: '70vh' }}>
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-sage-medium mb-4" size={40} />
            <p className="text-sm text-sage-medium font-black uppercase tracking-[0.3em]">Accessing Bilty Vault...</p>
          </div>
        ) : displayBilties.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-natural-bg rounded-full flex items-center justify-center mx-auto mb-6 text-sage-border opacity-50">
              <FileText size={40} />
            </div>
            <p className="text-lg text-sage-medium font-urdu-body">No matching bilties found in archive.</p>
          </div>
        ) : (
          <List
            height={600}
            itemCount={displayBilties.length}
            itemSize={350}
            width="100%"
          >
            {({ index, style }) => {
              const bilty = displayBilties[index];
              return (
                <div style={style} className="px-6 py-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-sage-border rounded-[2.5rem] p-6 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-sage-dark text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                          Bilty # {bilty.biltyNo}
                        </div>
                        <span className="text-[10px] text-sage-medium font-bold uppercase">{bilty.date}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="w-10 h-10 bg-natural-bg rounded-xl flex items-center justify-center text-sage-medium">
                            <Truck size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-sage-medium leading-none">Vehicle</p>
                            <p className="text-sm font-bold text-natural-text">{bilty.truckNo}</p>
                          </div>
                        </div>

                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="w-10 h-10 bg-natural-bg rounded-xl flex items-center justify-center text-sage-medium">
                            <MapPin size={18} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-sage-medium leading-none">Route</p>
                            <p className="text-xs font-bold text-natural-text truncate uppercase">
                              {bilty.origin} <span className="text-sage-border mx-1">→</span> {bilty.destination}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-natural-bg/50 p-4 rounded-2xl border border-sage-border/50">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="font-black opacity-50">SENDER</span>
                          <span className="font-black opacity-50">RECEIVER</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-sage-dark gap-4">
                          <span className="truncate">{bilty.sender}</span>
                          <span className="truncate text-right">{bilty.receiver}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button 
                        onClick={() => handlePrint(bilty)}
                        className="flex-1 bg-sage-dark text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                      >
                        <Printer size={14} /> Print
                      </button>
                      <button 
                        onClick={() => handleDelete(bilty.id)}
                        disabled={deletingId === bilty.id}
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
                      >
                        {deletingId === bilty.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </motion.div>
                </div>
              );
            }}
          </List>
        )}
      </div>

      {nextCursor && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => fetchBilties(true)}
            disabled={loadingMore}
            className="flex items-center gap-2 px-10 py-4 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold hover:bg-natural-bg transition-all shadow-lg disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Loading more...</span>
              </>
            ) : (
              <span>Load More Records</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BiltyArchive;
