import React, { useEffect, useState } from 'react';
import { PlusCircle, List, Info, ChevronRight, Truck, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { vehicleApi } from '../services/api';

interface VehicleRecordProps {
  onAddClick: () => void;
  onViewClick: () => void;
}

const VehicleRecord: React.FC<VehicleRecordProps> = ({ onAddClick, onViewClick }) => {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    lastAdded: 'No records yet',
    recentRecords: [] as any[]
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await vehicleApi.getAll();
      const records = Array.isArray(data) ? data : [];
      
      let lastAddedStr = 'No records yet';
      if (records.length > 0) {
        const last = records[0]; // Assuming descending sort by createdAt
        const lastDate = new Date(last.createdAt);
        const diffDays = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        lastAddedStr = diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      }

      setStats({
        total: records.length,
        lastAdded: lastAddedStr,
        recentRecords: records.slice(0, 3)
      });
    } catch (error) {
      console.error('Fetch Stats Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      id: 'add',
      title: t('common.vehiclePage.addVehicle'),
      description: 'Register a new vehicle into the system with all essential details.',
      icon: PlusCircle,
      color: 'bg-sage-light',
      textColor: 'text-sage-dark',
      onClick: onAddClick
    },
    {
      id: 'view',
      title: t('common.vehiclePage.viewVehicles'),
      description: 'Browse the complete list of registered vehicles and their status.',
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
        <h2 className="text-4xl font-serif text-natural-text font-urdu-title">
          {t('common.vehiclePage.title')}
        </h2>
        <p className="text-sage-medium max-w-2xl text-sm font-urdu-body">
          {t('common.vehiclePage.description')}
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-white border border-sage-border rounded-3xl p-6 flex gap-6 items-center shadow-sm">
        <div className="p-3 bg-sage-light/20 rounded-xl text-sage-dark border border-sage-light/30">
          {loading ? <Loader2 size={24} className="animate-spin" /> : <Info size={24} />}
        </div>
        <div>
          <h4 className="text-sm font-bold text-natural-text">Module Update / معلومات</h4>
          <p className="text-sm text-sage-medium">
            {loading ? 'Calculating fleet data...' : (
              <>
                Total active vehicles in your fleet: <span className="font-bold text-sage-dark">{stats.total}</span>. 
                Last registration was added <span className="font-bold text-sage-dark">{stats.lastAdded}</span>.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02 }}
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
              <span>Explore Module</span>
              <ChevronRight size={18} className={`${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Quick Summary Table */}
      <div className="bg-white rounded-3xl border border-sage-border p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-natural-bg rounded-xl flex items-center justify-center text-sage-dark border border-sage-light/30">
              <Truck size={20} />
            </div>
            <h4 className="text-lg font-serif text-natural-text font-urdu-title">Fleet Register Sync</h4>
          </div>
          <button onClick={onViewClick} className="text-xs font-bold text-sage-dark hover:text-sage-light underline tracking-widest uppercase">View All</button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-sage-light">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm font-bold uppercase tracking-widest">Synchronizing Fleet Records...</p>
          </div>
        ) : stats.recentRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-sage-medium border-b border-sage-border">
                  <th className="pb-4 px-2">Truck No</th>
                  <th className="pb-4 px-2">Route</th>
                  <th className="pb-4 px-2">Commission</th>
                  <th className="pb-4 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-border/30">
                {stats.recentRecords.map((record) => (
                  <tr key={record.id} className="text-sm text-natural-text hover:bg-natural-bg/30 transition-colors">
                    <td className="py-4 px-2 font-bold">{record.truckNo}</td>
                    <td className="py-4 px-2 text-sage-medium">{record.loadingStation} → {record.unloadingStation}</td>
                    <td className="py-4 px-2 font-bold text-sage-dark">Rs. {record.commission}</td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${record.commissionStatus === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                        {record.commissionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-sage-medium italic text-sm">
            No registration records found in the database.
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleRecord;

