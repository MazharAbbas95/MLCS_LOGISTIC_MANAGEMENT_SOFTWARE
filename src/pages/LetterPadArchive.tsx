import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Printer, 
  FileText, 
  Loader2, 
  Calendar,
  Eye,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { letterpadApi } from '../services/api';

interface LetterPadArchiveProps {
  onBack: () => void;
  onViewLetter?: (letter: any) => void;
}

const LetterPadArchive: React.FC<LetterPadArchiveProps> = ({ onBack, onViewLetter }) => {
  const { t, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const result = await letterpadApi.getAll(isLoadMore ? nextCursor || undefined : undefined);
      const dataArray = Array.isArray(result.data) ? result.data : [];
      
      if (isLoadMore) {
        setLetters(prev => [...prev, ...dataArray]);
      } else {
        setLetters(dataArray);
      }
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Fetch Error:', error);
      addNotification('error', 'Failed to load letterpad archive.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this record forever?')) return;
    try {
      setDeletingId(id);
      await letterpadApi.delete(id);
      addNotification('success', 'Document deleted.');
      fetchLetters();
    } catch (error) {
      addNotification('error', 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredLetters = letters.filter(l => 
    l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-4xl font-serif text-natural-text font-urdu-title">
            Letterpad Archive / خطوط کا ریکارڈ
          </h2>
          <p className="text-sage-medium max-w-2xl text-sm font-urdu-body mt-2">
            View and reprint official correspondence and agreements.
          </p>
        </div>
        
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
           <button 
            onClick={onBack}
            className={`flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            Back to Letterpad
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto md:mx-0">
        <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-sage-medium`} size={18} />
        <input 
          type="text" 
          placeholder="Search items by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full bg-white border border-sage-border rounded-2xl py-4 ${isRTL ? 'pr-12 pl-6' : 'pl-12 pr-6'} text-sm focus:outline-none focus:ring-4 focus:ring-sage-light/10 font-urdu-body shadow-lg shadow-black/5`}
        />
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-sage-medium mb-4" size={40} />
            <p className="text-sm text-sage-medium font-black uppercase tracking-[0.3em]">Accessing Document Vault...</p>
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white border border-dashed border-sage-border rounded-[3rem]">
            <div className="w-20 h-20 bg-natural-bg rounded-full flex items-center justify-center mx-auto mb-6 text-sage-border opacity-50">
              <FileText size={40} />
            </div>
            <p className="text-lg text-sage-medium font-urdu-body">No documents found in archive.</p>
          </div>
        ) : (
          filteredLetters.map((letter) => (
            <motion.div 
              key={letter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-sage-border rounded-[2.5rem] p-6 shadow-xl hover:shadow-2xl transition-all group flex flex-col justify-between h-[300px]"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-sage-light text-sage-dark px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                    DOC # {letter.id}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-sage-medium font-bold uppercase">
                    <Calendar size={12} />
                    {new Date(letter.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-natural-text mb-2 line-clamp-2 min-h-[3.5rem] font-serif">
                  {letter.title}
                </h3>

                <div 
                  className="text-xs text-sage-medium line-clamp-3 opacity-60 prose prose-sm overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: letter.content }}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => onViewLetter?.(letter)}
                  className="flex-1 bg-sage-dark text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                >
                  <Eye size={14} /> Open
                </button>
                <button 
                  onClick={() => handleDelete(letter.id)}
                  disabled={deletingId === letter.id}
                  className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
                >
                  {deletingId === letter.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default LetterPadArchive;
