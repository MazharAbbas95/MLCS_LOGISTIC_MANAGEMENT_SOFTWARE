import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Table as TableIcon,
  Plus,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { vehicleApi } from '../services/api';

interface AddVehicleRecordProps {
  onBack: () => void;
}

const AddVehicleRecord: React.FC<AddVehicleRecordProps> = ({ onBack }) => {
  const { t, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);

  const [records, setRecords] = useState([
    {
      srNo: '1',
      biltyNo: '',
      truckNo: '',
      driverNo: '',
      partyKariya: '',
      mlcsKariya: '',
      vehicleKariya: '',
      commission: '',
      commissionStatus: 'Pending',
      description: '',
      loadingStation: '',
      unloadingStation: '',
      partyMillName: '',
      broker: '',
      tafseelAkhrajat: ''
    }
  ]);

  const handleInputChange = (index: number, field: string, value: string) => {
    const newRecords = [...records];
    newRecords[index] = { ...newRecords[index], [field]: value };
    setRecords(newRecords);
  };

  const addNewRow = () => {
    setRecords([
      ...records,
      {
        srNo: (records.length + 1).toString(),
        biltyNo: '',
        truckNo: '',
        driverNo: '',
        partyKariya: '',
        mlcsKariya: '',
        vehicleKariya: '',
        commission: '',
        commissionStatus: 'Pending',
        description: '',
        loadingStation: '',
        unloadingStation: '',
        partyMillName: '',
        broker: '',
        tafseelAkhrajat: ''
      }
    ]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Filter out rows that are entirely empty (except for defaults)
    const validRecords = records
      .filter(record => record.biltyNo.trim() !== '' || record.truckNo.trim() !== '')
      .map(record => ({
        ...record,
        partyKariya: parseFloat(record.partyKariya) || 0,
        mlcsKariya: parseFloat(record.mlcsKariya) || 0,
        vehicleKariya: parseFloat(record.vehicleKariya) || 0,
        commission: parseFloat(record.commission) || 0,
      }));

    if (validRecords.length === 0) {
      addNotification('warning', 'Please fill in at least Bilty or Truck number for one record.');
      return;
    }

    try {
      setLoading(true);
      await vehicleApi.create(validRecords);
      addNotification('success', t('common.notifications.messages.vehicleAdded'));
      onBack();
    } catch (error: any) {
      console.error('Save Error:', error);
      let errorMessage = 'Validation failed. Ensure Bilty # and Truck # are provided.';
      
      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        const firstError = error.errors[0];
        const fieldName = firstError.path ? firstError.path[firstError.path.length - 1] : 'Field';
        errorMessage = `Validation Error (${fieldName}): ${firstError.message}`;
      } else if (error.message && error.message !== 'Validation failed') {
        errorMessage = error.message;
      }
      
      addNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'srNo', label: t('common.vehiclePage.form.fields.srNo') },
    { key: 'biltyNo', label: t('common.vehiclePage.form.fields.biltyNumber') },
    { key: 'truckNo', label: t('common.vehiclePage.form.fields.vehicleNumber') },
    { key: 'driverNo', label: t('common.vehiclePage.form.fields.driverMobile') },
    { key: 'partyKariya', label: t('common.vehiclePage.form.fields.partyKariya') },
    { key: 'mlcsKariya', label: t('common.vehiclePage.form.fields.mlcsKariya') },
    { key: 'vehicleKariya', label: t('common.vehiclePage.form.fields.vehicleKariya') },
    { key: 'commission', label: t('common.vehiclePage.form.fields.commision') },
    { key: 'commissionStatus', label: t('common.vehiclePage.form.fields.commisionStatus') },
    { key: 'description', label: t('common.vehiclePage.form.fields.tafseelMaal') },
    { key: 'loadingStation', label: t('common.vehiclePage.form.fields.loadingStation') },
    { key: 'unloadingStation', label: t('common.vehiclePage.form.fields.unloadingStation') },
    { key: 'partyMillName', label: t('common.vehiclePage.form.fields.partyMillName') },
    { key: 'broker', label: t('common.vehiclePage.form.fields.broker') },
    { key: 'tafseelAkhrajat', label: t('common.vehiclePage.form.fields.tafseelAkhrajat') },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-4xl font-serif text-natural-text font-urdu-title">
            {t('common.vehiclePage.form.title')}
          </h2>
          <p className="text-sage-medium max-w-2xl text-sm font-urdu-body mt-2">
            {t('common.vehiclePage.form.description')}
          </p>
        </div>
        
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 px-6 py-3 bg-white border border-sage-border rounded-2xl text-sage-dark font-bold text-sm hover:bg-natural-bg transition-all font-urdu-body shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
          {t('common.vehiclePage.form.buttons.back')}
        </button>
      </div>

      {/* Excel Sheet Container */}
      <div className="bg-white border border-sage-border rounded-[2.5rem] shadow-xl overflow-hidden">
        {/* Company Branding Header */}
        <div className="bg-sage-dark text-white p-6 border-b border-white/10 text-center">
          <h1 className="text-2xl font-serif tracking-widest uppercase font-urdu-title">
            {t('common.vehiclePage.form.excelHeader')}
          </h1>
          <p className="text-white/40 text-[10px] mt-1 font-bold uppercase tracking-[0.2em]">Logistics Management Portal</p>
        </div>

        {/* Action Bar for Excel */}
        <div className={`p-4 border-b border-sage-border flex items-center justify-between bg-natural-bg/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
             <div className="px-3 py-1 bg-sage-light text-sage-dark rounded-md text-xs font-bold font-urdu-body">
               {records.length} Rows
             </div>
             <button 
               onClick={addNewRow}
               className="flex items-center gap-2 px-4 py-1.5 bg-white border border-sage-border rounded-lg text-xs font-bold text-natural-text hover:bg-white transition-all shadow-sm"
             >
               <Plus size={14} /> Add Row
             </button>
          </div>
          <div className="text-sage-medium text-[10px] font-bold uppercase tracking-widest">
            Spreadsheet Entry Mode
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-natural-bg/80 border-b border-sage-border">
                {columns.map((col, index) => (
                  <th 
                    key={col.key} 
                    className={`
                      px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-sage-medium border-x border-sage-border font-urdu-title whitespace-nowrap 
                      min-w-[150px] first:min-w-[60px]
                      ${index === 0 ? 'sticky left-0 z-20 bg-natural-bg' : ''}
                    `}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-sage-border group hover:bg-natural-bg/20 transition-colors">
                  {columns.map((col, index) => (
                    <td 
                      key={col.key} 
                      className={`
                        p-0 border-x border-sage-border
                        ${index === 0 ? 'sticky left-0 z-10 bg-white group-hover:bg-natural-bg transition-colors' : ''}
                      `}
                    >
                      <input
                        type="text"
                        value={(row as any)[col.key]}
                        onChange={(e) => handleInputChange(rowIndex, col.key, e.target.value)}
                        readOnly={col.key === 'srNo'}
                        className={`
                          w-full px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sage-light/20 focus:z-10
                          ${col.key === 'srNo' ? 'text-center font-bold text-sage-medium cursor-default' : 'bg-transparent text-natural-text'}
                          ${isRTL ? 'text-right' : 'text-left'}
                          font-urdu-body
                        `}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info for Excel */}
        <div className="p-4 bg-natural-bg/20 text-[10px] text-sage-medium font-medium border-t border-sage-border flex justify-between items-center px-8">
          <span>* Press tab to move between cells</span>
          <span>Madad Logistics Container Services - Secure Data Management</span>
        </div>
      </div>

      {/* Save Action */}
      <div className={`flex justify-end gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <motion.button 
          onClick={handleSave}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-10 py-4 bg-sage-dark text-white rounded-2xl font-bold flex items-center gap-2 shadow-2xl shadow-sage-dark/20 hover:bg-natural-text transition-all font-urdu-body ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {loading ? 'Saving...' : t('common.vehiclePage.form.buttons.save')}
        </motion.button>
      </div>
    </div>
  );
};

export default AddVehicleRecord;
