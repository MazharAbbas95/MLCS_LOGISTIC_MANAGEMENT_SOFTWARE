import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ArrowLeft, Printer, Save, FileText, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { letterpadApi } from '../services/api';
import jsPDF from 'jspdf';

interface LetterPadProps {
  onBack: () => void;
  onArchiveClick?: () => void;
  initialData?: any;
}

const LetterPad: React.FC<LetterPadProps> = ({ onBack, onArchiveClick, initialData }) => {
  const { t, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const [content, setContent] = useState(initialData?.content || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [saving, setSaving] = useState(false);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const handlePrint = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // --- HEADER DESIGN ---
      // 1. Blue Background (Top Bar)
      doc.setFillColor(40, 53, 147); // #283593 (Indigo 800)
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // 2. Magenta Trapeze (The branding shape)
      doc.setFillColor(216, 27, 96); // #d81b60 (Pink 600)
      const trapWidth = pageWidth * 0.75;
      const startX = (pageWidth - trapWidth) / 2;
      const endX = startX + trapWidth;
      
      // Main body of trapeze
      doc.rect(startX, 0, trapWidth, 32, 'F');
      // Slanted sides and bottom point
      doc.triangle(startX, 32, startX + trapWidth * 0.15, 32, startX, 0, 'F'); // Not quite right
      
      // Corrected Trapeze Polygon
      // doc.triangle(x1, y1, x2, y2, x3, y3, style)
      // We want: Top(startX to endX), Sides slant in at bottom to a point at center
      // polygon(15% 0%, 85% 0%, 100% 85%, 50% 100%, 0% 85%) on a 75% width container
      
      const p1x = startX + (trapWidth * 0.15); // Top Left
      const p1y = 0;
      const p2x = endX - (trapWidth * 0.15); // Top Right
      const p2y = 0;
      const p3x = endX; // Right point
      const p3y = 35;
      const p4x = pageWidth / 2; // Bottom tip
      const p4y = 42;
      const p5x = startX; // Left point
      const p5y = 35;

      // Draw the complex shape with triangles
      doc.triangle(p1x, p1y, p2x, p2y, p3x, p3y, 'F');
      doc.triangle(p1x, p1y, p3x, p3y, p5x, p5y, 'F');
      doc.triangle(p5x, p5y, p3x, p3y, p4x, p4y, 'F');

      // Branding Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.text("Madad Logistic", pageWidth / 2, 18, { align: 'center' });
      
      doc.setFontSize(20);
      doc.text("container services", pageWidth / 2, 28, { align: 'center' });
      
      // NTN White Box
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth / 2 - 25, 32, 50, 7, 1, 1, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text("NTN # 727312-4", pageWidth / 2, 37, { align: 'center' });

      // Address Line
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      const address = "Nag Shah Chok Muzaffargarh Road Near NHA Office Multan, Contact: 0300-8632436, 0300-8633436";
      doc.text(address, pageWidth / 2, 50, { align: 'center' });
      
      // Date on right side
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 60, { align: 'right' });

      doc.setDrawColor(200, 200, 200);
      doc.line(15, 62, pageWidth - 15, 62);

      // --- DOCUMENT CONTENT ---
      // Robust cleaning of Quill HTML
      const cleanedText = content
        .replace(/&nbsp;/g, ' ') // Replace HTML spaces with real spaces
        .replace(/<\/p>/g, '\n\n') // Double newline for paragraphs
        .replace(/<br\s*\/?>/g, '\n') // Single newline for breaks
        .replace(/<[^>]*>/g, '') // Strip all remaining tags
        .trim();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      
      // Split by paragraphs to maintain structure
      const paragraphs = cleanedText.split('\n\n').filter(p => p.trim());
      
      let cursorY = 75;
      const margin = 20;
      const maxLineWidth = pageWidth - (margin * 2);

      paragraphs.forEach(para => {
        const lines = doc.splitTextToSize(para.trim(), maxLineWidth);
        
        // Check for page overflow
        if (cursorY + (lines.length * 6) > 280) {
          doc.addPage();
          cursorY = 20;
        }

        doc.text(lines, margin, cursorY);
        cursorY += (lines.length * 6) + 6; // Move cursor for next paragraph
      });

      // --- FOOTER DESIGN ---
      const footerY_start = 275;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const footerText = "Gate No.3 Street No.4 Room No.3 Plot No. A-668 New Quaid-e- Azam Truck Stand Hawksbay Road Karachi 0302-8637436,0317-7153636";
      doc.text(footerText, pageWidth / 2, footerY_start, { align: 'center' });
      
      doc.setDrawColor(40, 53, 147);
      doc.setLineWidth(0.8);
      doc.line(10, footerY_start + 2, pageWidth - 10, footerY_start + 2);

      // Footer Triangles
      const drawTriangle = (x: number, y: number, width: number, height: number, color: [number, number, number]) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.triangle(x, y + height, x + width / 2, y, x + width, y + height, 'F');
      };

      // Left Magenta
      drawTriangle(30, footerY_start + 8, 30, 8, [216, 27, 96]);
      // Center Blue
      drawTriangle(pageWidth / 2 - 25, footerY_start + 5, 50, 12, [40, 53, 147]);
      // Right Magenta
      drawTriangle(pageWidth - 60, footerY_start + 8, 30, 8, [216, 27, 96]);

      doc.save(`${(title || 'Letter').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      addNotification('success', 'Professional Document Downloaded');
    } catch (error) {
      console.error('PDF Error:', error);
      addNotification('error', 'PDF Generation failed. Using browser print.');
      window.print();
    }
  };

  const handleSave = async () => {
    if (!content || content === '<p><br></p>') {
      addNotification('warning', 'Document is empty.');
      return;
    }

    try {
      setSaving(true);
      await letterpadApi.create({ title: title || 'Untitled Document', content });
      addNotification('success', t('common.notifications.messages.letterSaved'));
      onBack();
    } catch (error: any) {
      console.error('Save Error:', error);
      let errorMessage = 'Failed to save document to database.';
      
      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        const firstError = error.errors[0];
        const fieldName = firstError.path ? firstError.path[firstError.path.length - 1] : 'Field';
        errorMessage = `Validation Error (${fieldName}): ${firstError.message}`;
      } else if (error.message && error.message !== 'Validation failed') {
        errorMessage = error.message;
      }
      
      addNotification('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-4xl font-serif text-natural-text font-urdu-title">
            {t('common.letterPadPage.title')}
          </h2>
          <p className="text-sage-medium max-w-2xl text-sm font-urdu-body mt-2">
            {t('common.letterPadPage.description')}
          </p>
        </div>
        
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
           <button 
             onClick={onArchiveClick}
             className="flex items-center gap-2 px-6 py-3 bg-natural-bg/50 border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm"
           >
             <FileText size={18} />
             Archive
           </button>
           <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm"
          >
             <Printer size={18} />
             {t('common.letterPadPage.buttons.print')}
           </button>
           <button 
            onClick={onBack}
            className={`flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            {t('common.letterPadPage.buttons.back')}
          </button>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto mb-4 print:hidden">
        <input 
          type="text" 
          placeholder="Document Title (e.g. Agreement Multan-Karachi)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full bg-white border border-sage-border rounded-xl py-4 px-6 text-xl font-serif focus:outline-none focus:ring-4 focus:ring-sage-light/10 shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}
        />
      </div>

      {/* Letter Pad Container */}
      <div className="bg-white border border-sage-border rounded-[2.5rem] shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none letter-pad-main">
        
        {/* The Letterhead Custom Header - Recreated from Image */}
        <div className="w-full bg-white pt-4">
          <div className="relative h-48 w-full overflow-hidden">
            {/* Blue Background Wings */}
            <div className="absolute inset-0 bg-[#283593]"></div>
            
            {/* The Pink/Magenta Center Trapezoid */}
            <div 
              className="absolute inset-x-0 bottom-0 top-0 bg-[#d81b60] mx-auto z-10 shadow-2xl"
              style={{
                clipPath: 'polygon(15% 0%, 85% 0%, 100% 85%, 50% 100%, 0% 85%)',
                width: '75%'
              }}
            >
              <div className="flex flex-col items-center justify-center h-full text-white pt-2">
                <h1 className="text-5xl font-black tracking-tighter uppercase font-urdu-title leading-none">
                  Madad Logistic
                </h1>
                <h2 className="text-3xl font-bold tracking-tight uppercase font-urdu-title mt-1">
                  container services
                </h2>
                <div className="mt-2 bg-white text-black px-4 py-0.5 rounded-sm font-bold text-sm border-2 border-black/10">
                  NTN # 727312-4
                </div>
              </div>
            </div>
          </div>
          
          {/* Address Line from Image */}
          <div className="text-center py-4 px-6 border-b border-black/5">
            <p className="text-[14px] font-bold text-black tracking-tight font-urdu-body">
              Nag Shah Chowk, Muzaffargarh Road near NHA Office Multan, Contact: 0300-8632436, 0300-8633436
            </p>
          </div>
        </div>

        {/* Editor Container */}
        <div className="p-8 md:p-12 lg:p-16 min-h-[600px] bg-white quill-container">
          <style>{`
            .letter-pad-main {
              max-width: 900px;
              margin: 0 auto;
            }
            .quill-container .ql-toolbar.ql-snow {
              border: none;
              border-bottom: 1px solid #E0E0D6;
              padding: 12px;
              background: #F5F5F0;
              border-radius: 8px;
              margin-bottom: 20px;
              position: sticky;
              top: 0;
              z-index: 50;
            }
            .quill-container .ql-container.ql-snow {
              border: none;
              font-family: 'Inter', 'Noto Sans Arabic', sans-serif;
              font-size: 16px;
            }
            .quill-container .ql-editor {
              min-height: 600px;
              padding: 20px 0;
              line-height: 1.8;
              color: #1a1a1a;
            }
            @media print {
              .sidebar-wrapper, .navbar-wrapper, .ql-toolbar, .header-controls {
                display: none !important;
              }
              body {
                background: white !important;
              }
              .main-wrapper {
                padding: 0 !important;
                margin: 0 !important;
              }
              .letter-pad-main {
                border: none !important;
                box-shadow: none !important;
                width: 100% !important;
                max-width: none !important;
              }
            }
          `}</style>
          <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent} 
            modules={modules}
            placeholder={t('common.letterPadPage.placeholder')}
            className={isRTL ? 'ql-rtl' : ''}
          />
        </div>

        {/* Stylized Footer from Image */}
        <div className="px-8 pb-10 bg-white">
          <div className="flex flex-col items-center">
            <p className="text-[11px] font-bold text-black mb-1 text-center">
                Gate No.3 Street No.4 Room No.3 Plot No. A-668 New Quaid-e-Azam Truck Stand Hawksbay Road Karachi 0302-8637436, 0317-7153636
            </p>
            <div className="w-full h-[1.5px] bg-[#283593] mb-6"></div>
            <div className="flex items-end justify-center gap-24 w-full h-12">
              <div 
                className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[18px] border-[#d81b60]"
                style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.1))' }}
              ></div>
              <div 
                className="w-0 h-0 border-l-[55px] border-l-transparent border-r-[55px] border-r-transparent border-b-[32px] border-[#283593]"
                style={{ filter: 'drop-shadow(4px 4px 4px rgba(0,0,0,0.15))' }}
              ></div>
              <div 
                className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[18px] border-[#d81b60]"
                style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.1))' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Footer info for Word Format */}
        <div className="p-4 bg-natural-bg/20 text-[10px] text-sage-medium font-bold uppercase tracking-widest border-t border-sage-border flex justify-between items-center px-8 print:hidden">
          <span>Official MLCS Correspondence Template</span>
          <span>Draft Auto-saved locally</span>
        </div>
      </div>

      <div className={`flex justify-end gap-4 ${isRTL ? 'flex-row-reverse' : ''} print:hidden`}>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`px-10 py-4 bg-sage-dark text-white rounded-2xl font-bold flex items-center gap-2 shadow-2xl shadow-sage-dark/20 hover:bg-natural-text transition-all font-urdu-body ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? 'Saving...' : t('common.letterPadPage.buttons.save')}
        </button>
      </div>
    </div>
  );
};

export default LetterPad;
