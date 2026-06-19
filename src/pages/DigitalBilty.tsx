import React, { useState } from 'react';
import { ArrowLeft, Printer, Save, FileText, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { biltyApi } from '../services/api';
import jsPDF from 'jspdf';
import BiltyHeader from '../components/bilty/BiltyHeader';
import toast from 'react-hot-toast';

interface DigitalBiltyProps {
  onBack: () => void;
  onArchiveClick?: () => void;
}

const DigitalBilty: React.FC<DigitalBiltyProps> = ({ onBack, onArchiveClick }) => {
  const { t, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    biltyNo: '6499',
    date: new Date().toISOString().split('T')[0],
    truckNo: '',
    driverNo: '',
    cnic: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    origin: '',
    destination: '',
    sender: '',
    receiver: '',
    quantity: '',
    description: '',
    totalFare: '',
    advance: '',
    balance: '',
    financialNotes: '',
    containerNo: ['', '', '', '', '', '', '', '', '', '', ''],
    shippingLine: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDigitChange = (field: 'cnic' | 'containerNo', index: number, value: string) => {
    const val = value.slice(-1);
    const newList = [...formData[field]];
    newList[index] = val;
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  const handleDownloadPDF = () => {
    try {
      const d = formData;
      const doc = new jsPDF('l', 'mm', 'a4'); // landscape: 297 x 210 mm
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();

      // Colours
      const NAVY:  [number,number,number] = [26,35,126];
      const IND:   [number,number,number] = [40,53,147];
      const RED:   [number,number,number] = [211,47,47];
      const PINK:  [number,number,number] = [233,30,99];
      const DARK:  [number,number,number] = [45,62,80];
      const WHITE: [number,number,number] = [255,255,255];
      const BLK:   [number,number,number] = [30,30,30];

      // ── HEADER (0–52mm) ──────────────────────
      const HDR = 52;
      doc.setFillColor(...WHITE); doc.rect(0, 0, W, HDR, 'F');
      doc.setDrawColor(...NAVY);  doc.setLineWidth(0.5);
      doc.rect(0, 0, W, HDR, 'S');

      // Vertical dividers
      [90, 165, 210].forEach(x => doc.line(x, 0, x, HDR));

      // LEFT – company name
      doc.setFont('helvetica','bold'); doc.setFontSize(15); doc.setTextColor(...RED);
      doc.text('MADAD LOGISTICS CONTAINER', 4, 9);
      doc.setFontSize(8); doc.setTextColor(...NAVY);
      doc.text('SERVICES', 4, 14);
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...NAVY);
      ['0300-8632436','0300-8633436','0300-8617436','0302-6077364','0306-7154581']
        .forEach((p,i) => doc.text(p, 4, 21 + i*4.5));

      // CENTER-LEFT – contacts
      doc.setFillColor(...PINK); doc.roundedRect(91,3,22,5,1,1,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(6); doc.setTextColor(...WHITE);
      doc.text('Multan Office', 102,7,{align:'center'});
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(...BLK);
      doc.text('Malik Kamran Awan', 91,13);
      doc.text('0300-8629436 / 0301-2066565', 91,17.5);

      doc.setFillColor(56,142,60); doc.roundedRect(91,23,22,5,1,1,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(6); doc.setTextColor(...WHITE);
      doc.text('Karachi Office', 102,27,{align:'center'});
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(...BLK);
      doc.text('Malik Sufyan Awan', 91,33);
      doc.text('0321-8619436', 91,37.5);

      // LOGO SECTION
      doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(...NAVY);
      doc.text('MLCS', 187,22,{align:'center'});
      doc.setFontSize(7); doc.text('Madad Logistics Container', 187,28,{align:'center'});

      // RIGHT – English equivalent of Urdu branding
      doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(...RED);
      doc.text('MADAD', 293,9,{align:'right'});
      doc.setFontSize(9); doc.setTextColor(...NAVY);
      doc.text('Logistics Container Services', 293,15,{align:'right'});
      doc.text('(Registered)', 293,20,{align:'right'});
      doc.setFontSize(8); doc.text('Madad Khan Awan', 293,29,{align:'right'});
      doc.setFont('helvetica','normal'); doc.setFontSize(7);
      doc.text('0306-8637436', 293,34,{align:'right'});
      doc.text('0300-5637436', 293,38,{align:'right'});

      // ── ADDRESS BAR (52–64mm) ─────────────────
      doc.setFillColor(...IND); doc.rect(0,HDR,W*0.42,12,'F');
      doc.setFillColor(...WHITE); doc.rect(W*0.42,HDR,W*0.16,12,'F');
      doc.setFillColor(...IND); doc.rect(W*0.58,HDR,W*0.42,12,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...PINK);
      doc.text('NTN # C727312-4', W/2, HDR+7.5,{align:'center'});
      doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(...WHITE);
      doc.text('Gate No.3 Street No.3 Room No.4 Plot A-668 Near Quaid-e-Azam Bus Stop Hawksbay Road Karachi', W*0.21,HDR+7.5,{align:'center'});
      doc.text('Nag Shah Chok Muzaffargarh Road Near NHA Office Multan', W*0.79,HDR+7.5,{align:'center'});

      // ── BODY ─────────────────────────────────
      let Y = HDR + 14;
      const col = W / 4;

      const field = (lbl: string, val: string, x: number, y: number, w: number) => {
        doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(...DARK);
        doc.text(lbl, x, y);
        const lw = doc.getTextWidth(lbl)+1;
        doc.setFont('helvetica','normal'); doc.setTextColor(30,80,180);
        doc.text(val, x+lw, y);
        doc.setDrawColor(...DARK); doc.setLineWidth(0.3);
        doc.line(x, y+1, x+w, y+1);
      };

      field('Bilty No:',  d.biltyNo,             4,       Y, col-5);
      field('Date:',      d.date,                 col,     Y, col-5);
      field('Truck No:',  d.truckNo||'—',         col*2,   Y, col-5);
      field('Driver No:', d.driverNo||'—',        col*3,   Y, W-col*3-3);
      Y += 7;
      field('CNIC:',          d.cnic.join('')||'—',  4,     Y, col*2-5);
      field('Shipping Line:', d.shippingLine||'N/A', col*2, Y, col*2-3);
      Y += 7;
      field('Origin:',      d.origin||'—',      4,     Y, col*2-5);
      field('Destination:', d.destination||'—', col*2, Y, col*2-3);
      Y += 7;
      field('Sender:',   d.sender||'—',   4,     Y, col*2-5);
      field('Receiver:', d.receiver||'—', col*2, Y, col*2-3);
      Y += 6;

      // ── TABLE ─────────────────────────────────
      const TT = Y;
      const C1 = W*0.18, C2 = W*0.47, C3 = W-C1-C2;
      const TH = H - TT - 18;

      const hdr = (lbl: string, x: number, w: number) => {
        doc.setFillColor(...DARK); doc.rect(x,TT,w,7,'F');
        doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...WHITE);
        doc.text(lbl, x+w/2, TT+5, {align:'center'});
      };
      hdr('QUANTITY', 0, C1);
      hdr('DESCRIPTION / GOODS DETAILS', C1, C2);
      hdr('FINANCIAL DETAILS', C1+C2, C3);

      doc.setDrawColor(...DARK); doc.setLineWidth(0.5);
      doc.rect(0,TT,W,TH,'S');
      doc.line(C1,TT,C1,TT+TH);
      doc.line(C1+C2,TT,C1+C2,TT+TH);

      doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...DARK);
      if (d.quantity)      doc.text(doc.splitTextToSize(d.quantity,     C1-4), 2,       TT+11);
      if (d.description)   doc.text(doc.splitTextToSize(d.description,  C2-4), C1+2,    TT+11);
      if (d.financialNotes) doc.text(doc.splitTextToSize(d.financialNotes, C3-4), C1+C2+2, TT+11);

      // Financial rows
      const fY = TT+TH-22;
      doc.setLineWidth(0.4); doc.setDrawColor(...DARK);
      doc.line(C1+C2,fY,W,fY);
      doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(...DARK);
      doc.text('Total Fare:', C1+C2+2, fY+5);
      doc.setFont('helvetica','normal'); doc.text(d.totalFare||'—', W-3, fY+5, {align:'right'});

      doc.line(C1+C2,fY+8,W,fY+8);
      doc.setFont('helvetica','bold'); doc.text('Advance:', C1+C2+2, fY+13);
      doc.setFont('helvetica','normal'); doc.text(d.advance||'—', W-3, fY+13, {align:'right'});

      doc.line(C1+C2,fY+16,W,fY+16);
      doc.setFillColor(...DARK); doc.rect(C1+C2, fY+16, C3, 6, 'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...WHITE);
      doc.text('BALANCE:', C1+C2+2, fY+20.5);
      doc.text(d.balance||'—', W-3, fY+20.5, {align:'right'});

      // ── FOOTER ────────────────────────────────
      const FY = TT+TH+4;
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(...DARK);
      doc.text('Container No: '+(d.containerNo.join('')||''), 4, FY+4);

      ['Sender Signature','Receiver Signature','Authorized Signature'].forEach((s,i) => {
        const sx = 120 + i*60;
        doc.setDrawColor(...DARK); doc.setLineWidth(0.5);
        doc.line(sx, FY+5, sx+50, FY+5);
        doc.setFont('helvetica','bold'); doc.setFontSize(6.5); doc.setTextColor(...DARK);
        doc.text(s.toUpperCase(), sx+25, FY+9, {align:'center'});
      });

      doc.save(`MLCS_Bilty_${d.biltyNo||'document'}.pdf`);
      addNotification('success', 'Bilty PDF Downloaded!');
    } catch(err) {
      console.error('PDF error:', err);
      addNotification('error', 'PDF generation failed.');
    }
  };




  const handleSave = async () => {
    if (loading) return;
    try {
      setLoading(true);
      // Normalize array fields to strings before sending to API
      const payload = {
        ...formData,
        cnic: Array.isArray(formData.cnic) ? formData.cnic.join('') : formData.cnic,
        containerNo: Array.isArray(formData.containerNo) ? formData.containerNo.join('') : formData.containerNo,
        financialNotes: undefined, // not in schema — remove from payload
      };
      // Remove undefined keys
      Object.keys(payload).forEach(k => (payload as any)[k] === undefined && delete (payload as any)[k]);
      await biltyApi.create(payload);
      addNotification('success', t('common.notifications.messages.biltyGenerated'));
      onBack();
    } catch (error: any) {
      console.error('Bilty Save Error:', error);
      let errorMessage = 'Validation failed. Please fill all required fields correctly.';

      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        const firstError = error.errors[0];
        const fieldName = firstError.path ? firstError.path[firstError.path.length - 1] : 'Field';
        errorMessage = `${fieldName}: ${firstError.message}`;
      } else if (error.message && error.message !== 'Validation failed') {
        errorMessage = error.message;
      }

      addNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''} print:hidden`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-4xl font-serif text-natural-text font-urdu-title">
            {t('common.biltyPage.title')}
          </h2>
          <p className="text-sage-medium max-w-2xl text-sm font-urdu-body mt-2">
            {t('common.biltyPage.description')}
          </p>
        </div>
        
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
           <button 
             onClick={onArchiveClick}
             className="flex items-center gap-2 px-6 py-3 bg-natural-bg/50 border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm"
           >
             <FileText size={18} />
             <span>Archive</span>
           </button>
            <motion.button 
              onClick={handleDownloadPDF}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />}
              {loading ? 'Preparing...' : t('common.biltyPage.buttons.print')}
            </motion.button>
           <button 
            onClick={onBack}
            className={`flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            {t('common.biltyPage.buttons.back')}
          </button>
        </div>
      </div>

      {/* Bilty Container */}
      <div 
        id="bilty-to-print"
        className="bg-white border-2 border-[#1e3a8a] rounded-sm shadow-2xl overflow-hidden max-w-[1000px] mx-auto"
      >
        {/* BILTY CONTENT AREA */}
        <BiltyHeader />
        <div className="p-12 space-y-10 bg-white">
            
            {/* GRID FIELDS SECTION */}
            <div className="grid grid-cols-4 gap-y-8 gap-x-12">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-[#2d3e50] text-lg">Bilty No:</span>
                    <input 
                        type="text" 
                        value={formData.biltyNo}
                        onChange={(e) => handleInputChange('biltyNo', e.target.value)}
                        className="flex-1 bg-transparent border-b-2 border-gray-100 px-2 font-bold text-red-600 text-xl focus:outline-none focus:border-[#2d3e50] transition-colors"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-[#2d3e50] text-lg">Date:</span>
                    <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="flex-1 bg-transparent border-b-2 border-gray-100 px-2 focus:outline-none focus:border-[#2d3e50] transition-colors text-lg"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-[#2d3e50] text-lg">Truck No:</span>
                    <input 
                        type="text" 
                        placeholder="KAE-1234"
                        value={formData.truckNo}
                        onChange={(e) => handleInputChange('truckNo', e.target.value)}
                        className="flex-1 bg-transparent border-b-2 border-gray-100 px-2 focus:outline-none focus:border-[#2d3e50] transition-colors text-lg"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-[#2d3e50] text-lg">Driver No:</span>
                    <input 
                        type="tel" 
                        placeholder="0300-0000000"
                        value={formData.driverNo}
                        onChange={(e) => handleInputChange('driverNo', e.target.value)}
                        className="flex-1 bg-transparent border-b-2 border-gray-100 px-2 focus:outline-none focus:border-[#2d3e50] transition-colors text-lg"
                    />
                </div>

                <div className="flex items-center gap-3 col-span-2">
                    <span className="font-bold text-[#2d3e50] text-lg">CNIC:</span>
                    <input 
                        type="text" 
                        placeholder="42101-0000000-0"
                        value={formData.cnic.join('')}
                        onChange={(e) => handleInputChange('cnic', e.target.value)}
                        className="flex-1 bg-transparent border-b-2 border-gray-100 px-2 focus:outline-none focus:border-[#2d3e50] transition-colors text-lg tracking-widest"
                    />
                </div>
                <div className="flex items-center gap-3 col-span-2">
                    <span className="font-bold text-[#2d3e50] text-lg">Shipping Line:</span>
                    <input 
                        type="text" 
                        placeholder="N/A"
                        value={formData.shippingLine}
                        onChange={(e) => handleInputChange('shippingLine', e.target.value)}
                        className="flex-1 bg-transparent border-b-2 border-gray-100 px-2 focus:outline-none focus:border-[#2d3e50] transition-colors text-lg"
                    />
                </div>

                <div className="flex items-center gap-3 col-span-2">
                    <span className="font-bold text-[#2d3e50] text-lg">Origin:</span>
                    <input 
                        type="text" 
                        value={formData.origin}
                        onChange={(e) => handleInputChange('origin', e.target.value)}
                        className="flex-1 border-b-2 border-gray-100 focus:outline-none focus:border-[#2d3e50] px-2 text-lg" 
                    />
                </div>
                <div className="flex items-center gap-3 col-span-2">
                    <span className="font-bold text-[#2d3e50] text-lg">Destination:</span>
                    <input 
                        type="text" 
                        value={formData.destination}
                        onChange={(e) => handleInputChange('destination', e.target.value)}
                        className="flex-1 border-b-2 border-gray-100 focus:outline-none focus:border-[#2d3e50] px-2 text-lg" 
                    />
                </div>

                <div className="flex items-center gap-3 col-span-2">
                    <span className="font-bold text-[#2d3e50] text-lg">Sender:</span>
                    <input 
                        type="text" 
                        value={formData.sender}
                        onChange={(e) => handleInputChange('sender', e.target.value)}
                        className="flex-1 border-b-2 border-gray-100 focus:outline-none focus:border-[#2d3e50] px-2 text-lg" 
                    />
                </div>
                <div className="flex items-center gap-3 col-span-2">
                    <span className="font-bold text-[#2d3e50] text-lg">Receiver:</span>
                    <input 
                        type="text" 
                        value={formData.receiver}
                        onChange={(e) => handleInputChange('receiver', e.target.value)}
                        className="flex-1 border-b-2 border-gray-100 focus:outline-none focus:border-[#2d3e50] px-2 text-lg" 
                    />
                </div>
            </div>

            {/* MAIN TABLE AREA */}
            <div className="border-2 border-[#2d3e50] rounded-lg overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 bg-[#2d3e50] text-white font-bold text-center uppercase tracking-wider py-4">
                    <div className="col-span-2 border-r border-white/20">Quantity</div>
                    <div className="col-span-5 border-r border-white/20">Description / Goods Details</div>
                    <div className="col-span-5">Financial Details</div>
                </div>
                <div className="grid grid-cols-12 min-h-[400px] bg-white divide-x-2 divide-[#2d3e50]">
                    {/* Qty Column */}
                    <div className="col-span-2 p-0 flex flex-col">
                        <textarea 
                            value={formData.quantity}
                            onChange={(e) => handleInputChange('quantity', e.target.value)}
                            className="w-full h-full p-6 focus:outline-none resize-none text-center font-bold text-xl text-[#2d3e50]" 
                        />
                    </div>
                    {/* Description Column */}
                    <div className="col-span-5 p-0 flex flex-col">
                         <textarea 
                            placeholder="Enter goods details..."
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="w-full h-full p-6 focus:outline-none resize-none text-lg text-[#2d3e50]" 
                        />
                    </div>
                    {/* Financials Column */}
                    <div className="col-span-5 flex flex-col">
                        <div className="flex-1 flex flex-col">
                             <div className="flex-1 border-b-2 border-[#2d3e50]">
                                <textarea
                                    value={formData.financialNotes}
                                    onChange={(e) => handleInputChange('financialNotes', e.target.value)}
                                    placeholder="Enter additional financial details..."
                                    className="w-full h-full p-4 focus:outline-none resize-none bg-transparent"
                                />
                             </div>
                             {/* Calculated Fields */}
                             <div className="bg-gray-50">
                                <div className="grid grid-cols-2 border-b-2 border-[#2d3e50]">
                                    <div className="p-4 border-r-2 border-[#2d3e50] text-right font-bold text-[#2d3e50]">Total Fare:</div>
                                    <input 
                                        type="text" 
                                        value={formData.totalFare}
                                        onChange={(e) => handleInputChange('totalFare', e.target.value)}
                                        className="p-4 bg-white focus:outline-none text-center font-bold text-xl text-[#2d3e50]" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 border-b-2 border-[#2d3e50]">
                                    <div className="p-4 border-r-2 border-[#2d3e50] text-right font-bold text-[#2d3e50]">Advance:</div>
                                    <input 
                                        type="text" 
                                        value={formData.advance}
                                        onChange={(e) => handleInputChange('advance', e.target.value)}
                                        className="p-4 bg-white focus:outline-none text-center font-bold text-xl text-[#2d3e50]" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 bg-[#2d3e50] text-white">
                                    <div className="p-4 border-r border-white/20 text-right font-bold text-lg uppercase tracking-wider">Balance:</div>
                                    <input 
                                        type="text" 
                                        value={formData.balance}
                                        onChange={(e) => handleInputChange('balance', e.target.value)}
                                        className="p-4 bg-transparent focus:outline-none text-center font-bold text-2xl text-white" 
                                    />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER SECTION */}
            <div className="space-y-12">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-[#2d3e50] text-lg">Container No:</span>
                    <input 
                        type="text" 
                        value={formData.containerNo.join('')}
                        onChange={(e) => handleInputChange('containerNo', e.target.value)}
                        className="flex-1 bg-transparent border-b-2 border-gray-100 px-2 focus:outline-none focus:border-[#2d3e50] transition-colors text-lg tracking-widest"
                    />
                </div>

                <div className="flex justify-between items-center pt-8">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-64 border-b-2 border-[#2d3e50]"></div>
                        <span className="font-bold text-[#2d3e50] text-sm uppercase">Sender Signature</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-64 border-b-2 border-[#2d3e50]"></div>
                        <span className="font-bold text-[#2d3e50] text-sm uppercase">Receiver Signature</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-64 border-b-2 border-[#2d3e50]"></div>
                        <span className="font-bold text-[#2d3e50] text-sm uppercase">Authorized Signature</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className={`max-w-[1000px] mx-auto flex justify-end gap-4 ${isRTL ? 'flex-row-reverse' : ''} print:hidden`}>
        <motion.button 
          onClick={handleSave}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-10 py-4 bg-blue-900 text-white rounded-2xl font-bold flex items-center gap-2 shadow-2xl shadow-blue-900/20 hover:bg-black transition-all font-urdu-body ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {loading ? 'Generating...' : t('common.biltyPage.buttons.generate')}
        </motion.button>
      </div>
    </div>

  );
};

export default DigitalBilty;
