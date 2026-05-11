import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  BarChart3, 
  Settings as SettingsIcon,
  CheckCircle2,
  Database,
  Cpu,
  Layers,
  Globe,
  ArrowRight
} from 'lucide-react';

interface SceneProps {
  onNext: () => void;
}

// --- SCENE 1: INTRODUCTION ---
const SceneIntro: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="w-24 h-24 bg-sage-light rounded-[2rem] flex items-center justify-center text-sage-dark text-5xl font-bold shadow-[0_0_50px_rgba(156,175,136,0.3)]">
        M
      </div>
    </motion.div>
    <motion.h1
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 1 }}
      className="text-6xl font-serif text-white mb-4 tracking-tight"
    >
      MLCS
    </motion.h1>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="text-sage-light text-2xl font-light tracking-widest uppercase"
    >
      Madad Logistics Container Services
    </motion.p>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "200px" }}
      transition={{ delay: 1.5, duration: 1.5, ease: "easeInOut" }}
      className="h-1 bg-gradient-to-r from-transparent via-sage-light to-transparent mt-8"
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
      className="text-white/40 mt-4 text-lg"
    >
      Smart Logistics Management System
    </motion.p>
  </div>
);

// --- SCENE 2: PROBLEM ---
const SceneProblem: React.FC = () => (
  <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
    <motion.img
      initial={{ scale: 1.1, filter: "grayscale(0.5) brightness(0.5)" }}
      animate={{ scale: 1, filter: "grayscale(0) brightness(0.7)" }}
      transition={{ duration: 10 }}
      src="/assets/paperwork_chaos.png"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-black/40" />
    <div className="relative z-10 max-w-2xl text-center px-8">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-4xl font-serif text-white mb-6 leading-tight"
      >
        Tired of manual registers and paperwork chaos?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="text-white/80 text-xl font-light"
      >
        Managing thousands of Biltys and vehicle records manually is prone to errors and lost revenue.
      </motion.p>
    </div>
  </div>
);

// --- SCENE 3: DASHBOARD ---
const SceneDashboard: React.FC = () => (
  <div className="flex items-center justify-center h-full p-12 bg-[#F8F9FA]">
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
    >
      <div className="h-16 bg-sage-dark flex items-center px-8 gap-4">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <div className="w-3 h-3 rounded-full bg-emerald-400" />
        <div className="ml-4 text-white/50 text-xs font-mono">mlcs-admin.v3/dashboard</div>
      </div>
      <div className="flex h-[500px]">
        <div className="w-64 bg-sage-dark/95 border-r border-white/5 p-6 space-y-4">
          {[LayoutDashboard, Truck, Receipt, FileText, BarChart3].map((Icon, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-sage-light text-sage-dark' : 'text-white/40'}`}>
              <Icon size={18} />
              <div className="h-2 w-24 bg-current/20 rounded" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-10 space-y-8 overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
            <div className="w-10 h-10 rounded-full bg-sage-light/20" />
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className="p-6 rounded-3xl bg-gray-50 border border-gray-100"
              >
                <div className="h-3 w-16 bg-gray-200 rounded mb-4" />
                <div className="h-8 w-24 bg-sage-dark/80 rounded" />
              </motion.div>
            ))}
          </div>
          <div className="flex-1 bg-gray-50 rounded-3xl p-6 border border-gray-100">
             <div className="h-4 w-full bg-gray-200 rounded mb-4" />
             <div className="h-4 w-5/6 bg-gray-200 rounded mb-4" />
             <div className="h-4 w-4/6 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </motion.div>
    <div className="absolute bottom-20 text-center">
       <motion.h3
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 1.5 }}
         className="text-2xl font-serif text-sage-dark"
       >
         Complete Business Overview at a Glance
       </motion.h3>
    </div>
  </div>
);

// --- SCENE 4: VEHICLE RECORD ---
const SceneVehicleRecord: React.FC = () => (
  <div className="flex items-center justify-center h-full p-12 bg-white">
    <div className="w-full max-w-4xl grid grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-sage-medium font-bold uppercase tracking-widest text-xs">Module 01</span>
          <h2 className="text-4xl font-serif text-sage-dark mt-2">Vehicle Record Management</h2>
          <p className="text-gray-500 mt-4 leading-relaxed">
            Digitally track every truck movement, driver detail, and freight transaction with automated calculations.
          </p>
        </motion.div>
        <div className="space-y-3">
          {['Instant Data Entry', 'Automatic Commission Calculation', 'Real-time History'].map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
              className="flex items-center gap-3 text-sage-dark font-medium"
            >
              <CheckCircle2 size={18} className="text-emerald-500" />
              {text}
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="bg-gray-50 p-8 rounded-[3rem] border border-gray-200 shadow-xl relative"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Truck No.</div>
            <div className="h-10 bg-white border border-gray-200 rounded-xl flex items-center px-4 text-sage-dark font-mono overflow-hidden">
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                transition={{ duration: 1, delay: 1 }}
              >
                TK-9921
              </motion.span>
              <motion.div 
                animate={{ opacity: [1, 0, 1] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-0.5 h-4 bg-sage-dark ml-1" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="h-10 bg-white border border-gray-200 rounded-xl" />
             <div className="h-10 bg-white border border-gray-200 rounded-xl" />
          </div>
          <div className="h-10 bg-white border border-gray-200 rounded-xl" />
          <motion.div
            animate={{ scale: [1, 1.05, 1], backgroundColor: ["#4A5D4E", "#5E7463", "#4A5D4E"] }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="h-12 bg-sage-dark text-white rounded-xl flex items-center justify-center font-bold"
          >
            Save Record
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.5 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 whitespace-nowrap"
        >
          <CheckCircle2 size={16} />
          Record Stored Successfully
        </motion.div>
      </motion.div>
    </div>
  </div>
);

// --- SCENE 5: DIGITAL BILTY ---
const SceneBilty: React.FC = () => (
  <div className="flex items-center justify-center h-full bg-[#E5E7EB]">
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="bg-white w-[500px] h-[700px] shadow-2xl rounded-sm p-12 relative overflow-hidden"
    >
      {/* Professional Bilty Mockup */}
      <div className="border-b-2 border-sage-dark pb-6 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif text-sage-dark font-bold">MLCS</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Madad Logistics Container Services</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-red-600">No. 2024-8821</div>
          <div className="text-[10px] text-gray-400">Date: {new Date().toLocaleDateString()}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-8 text-[11px]">
        <div className="space-y-4">
           <div className="font-bold border-b border-gray-100 pb-1 uppercase text-gray-400">Consignor</div>
           <div className="h-3 w-32 bg-gray-100 rounded" />
           <div className="h-3 w-24 bg-gray-100 rounded" />
        </div>
        <div className="space-y-4">
           <div className="font-bold border-b border-gray-100 pb-1 uppercase text-gray-400">Consignee</div>
           <div className="h-3 w-32 bg-gray-100 rounded" />
           <div className="h-3 w-24 bg-gray-100 rounded" />
        </div>
      </div>

      <div className="border-2 border-gray-100 rounded-lg overflow-hidden mb-8">
        <div className="bg-gray-50 p-2 grid grid-cols-4 text-[10px] font-bold text-gray-400 uppercase">
           <div className="col-span-2">Description</div>
           <div className="text-center">Weight</div>
           <div className="text-right">Amount</div>
        </div>
        <div className="p-4 space-y-4 h-48">
           <div className="grid grid-cols-4 items-center">
              <div className="col-span-2 h-3 w-40 bg-gray-50 rounded" />
              <div className="text-center h-3 w-12 bg-gray-50 rounded mx-auto" />
              <div className="text-right h-3 w-16 bg-gray-50 rounded ml-auto" />
           </div>
        </div>
      </div>

      <div className="flex justify-between items-end mt-auto pt-12">
        <div className="text-center border-t border-gray-200 w-32 pt-2">
           <p className="text-[8px] text-gray-400 uppercase">Receiver Sign</p>
        </div>
        <div className="text-center border-t border-gray-200 w-32 pt-2">
           <p className="text-[8px] text-gray-400 uppercase">Manager Sign</p>
        </div>
      </div>

      <div className="absolute top-0 right-0 p-8">
         <motion.div
           animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
           transition={{ repeat: Infinity, duration: 2 }}
           className="w-32 h-32 border-4 border-sage-light/20 rounded-full flex items-center justify-center text-sage-light/20 font-bold rotate-12 text-2xl"
         >
           ORIGINAL
         </motion.div>
      </div>
    </motion.div>
    
    <div className="absolute right-24 max-w-sm">
       <motion.div
         initial={{ opacity: 0, x: 50 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ delay: 1, duration: 0.8 }}
         className="space-y-6"
       >
         <h3 className="text-4xl font-serif text-sage-dark">Digital Bilty Generation</h3>
         <p className="text-sage-medium leading-relaxed">
           Generate professional, print-ready Biltys in seconds. Support for bilingual (Urdu/English) layouts and automated numbering.
         </p>
         <div className="flex items-center gap-4 text-emerald-600 font-bold">
           <div className="p-3 bg-emerald-100 rounded-2xl">
             <FileText size={24} />
           </div>
           <span>A4 Print Optimized</span>
         </div>
       </motion.div>
    </div>
  </div>
);

// --- SCENE 6: EXPENSES ---
const SceneExpenses: React.FC = () => (
  <div className="h-full w-full bg-sage-dark flex items-center justify-center p-12 overflow-hidden">
     <div className="grid grid-cols-2 gap-16 items-center max-w-6xl w-full">
        <div className="relative">
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1 }}
             className="w-full aspect-square bg-white/5 rounded-[4rem] border border-white/10 p-12 relative flex items-center justify-center"
           >
              <div className="w-4/5 h-4/5 border-b-2 border-l-2 border-white/20 relative">
                 {/* Mock Chart */}
                 <svg className="absolute bottom-0 left-0 w-full h-full overflow-visible">
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 1 }}
                      d="M 0 100 Q 50 20, 100 80 T 200 40 T 300 120 T 400 20"
                      fill="none"
                      stroke="#9CAF88"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <motion.circle
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ delay: 3 }}
                       cx="400" cy="20" r="6" fill="#9CAF88"
                    />
                 </svg>
              </div>
           </motion.div>
           <motion.div
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ delay: 1.5 }}
             className="absolute top-10 -right-8 bg-white p-6 rounded-3xl shadow-2xl text-sage-dark w-48"
           >
              <p className="text-[10px] font-bold uppercase text-gray-400">Total Profit</p>
              <p className="text-2xl font-serif">+24.8%</p>
           </motion.div>
        </div>
        <div className="text-white space-y-8">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
              <h2 className="text-5xl font-serif mb-6">Financial Intelligence</h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Track driver expenses, fuel costs, and road taxes daily. Our system provides deep insights into your business profitability.
              </p>
           </motion.div>
           <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Diesel', icon: Truck },
                { label: 'Drivers', icon: LayoutDashboard },
                { label: 'Road Tax', icon: Receipt },
                { label: 'Office', icon: SettingsIcon }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="bg-white/10 p-4 rounded-2xl border border-white/5 flex items-center gap-3"
                >
                  <item.icon size={18} className="text-sage-light" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              ))}
           </div>
        </div>
     </div>
  </div>
);

// --- SCENE 7: TECHNOLOGY ---
const SceneTech: React.FC = () => (
  <div className="h-full w-full flex flex-col items-center justify-center text-white bg-[#0A0C0E]">
    <motion.h2
      initial={{ opacity: 0, letterSpacing: "0px" }}
      animate={{ opacity: 1, letterSpacing: "10px" }}
      transition={{ duration: 2 }}
      className="text-white/20 text-sm font-bold uppercase mb-16"
    >
      Engineered for Scale
    </motion.h2>
    <div className="flex items-center gap-24">
       {[
         { name: 'React.js', icon: Layers, color: 'text-blue-400' },
         { name: 'Node.js', icon: Cpu, color: 'text-emerald-400' },
         { name: 'MySQL', icon: Database, color: 'text-orange-400' }
       ].map((tech, i) => (
         <motion.div
           key={i}
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 + i * 0.3, duration: 1 }}
           className="flex flex-col items-center gap-6"
         >
           <div className={`p-8 rounded-[2.5rem] bg-white/5 border border-white/10 ${tech.color} shadow-[0_0_40px_rgba(255,255,255,0.02)]`}>
              <tech.icon size={48} />
           </div>
           <span className="font-bold tracking-widest uppercase text-xs text-white/60">{tech.name}</span>
         </motion.div>
       ))}
    </div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5 }}
      className="mt-20 flex items-center gap-4 text-white/30"
    >
       <Globe size={20} />
       <span className="text-sm tracking-widest">Full-Stack Logistics Infrastructure</span>
    </motion.div>
  </div>
);

// --- SCENE 8: FINAL ---
const SceneFinal: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center bg-white p-12">
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.5, type: "spring" }}
      className="mb-12"
    >
      <div className="w-32 h-32 bg-sage-dark rounded-[3rem] flex items-center justify-center text-white text-6xl font-bold shadow-2xl">
        M
      </div>
    </motion.div>
    <motion.h2
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 1 }}
      className="text-6xl font-serif text-sage-dark mb-6"
    >
      MLCS Logistics
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="text-sage-medium text-2xl mb-12"
    >
      Your Business, Digitized.
    </motion.p>
    <motion.button
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5 }}
      whileHover={{ scale: 1.05 }}
      className="px-10 py-5 bg-sage-dark text-white rounded-2xl font-bold text-xl flex items-center gap-4 shadow-xl shadow-sage-dark/30"
    >
      Launch System <ArrowRight size={24} />
    </motion.button>
    <p className="mt-20 text-gray-400 text-xs uppercase tracking-[5px]">
       Madad Logistics Container Services © 2024
    </p>
  </div>
);

// --- MAIN ENGINE ---
const CinematicDemo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [currentScene, setCurrentScene] = useState(0);
  
  const scenes = [
    { component: <SceneIntro />, duration: 12000, theme: 'dark' },
    { component: <SceneProblem />, duration: 15000, theme: 'dark' },
    { component: <SceneDashboard />, duration: 18000, theme: 'light' },
    { component: <SceneVehicleRecord />, duration: 20000, theme: 'light' },
    { component: <SceneBilty />, duration: 20000, theme: 'light' },
    { component: <SceneExpenses />, duration: 18000, theme: 'dark' },
    { component: <SceneTech />, duration: 12000, theme: 'dark' },
    { component: <SceneFinal />, duration: 15000, theme: 'light' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        setCurrentScene(currentScene + 1);
      } else {
        // Loop back or stay on last scene
        // onBack(); // Or stay
      }
    }, scenes[currentScene].duration);

    return () => clearTimeout(timer);
  }, [currentScene]);

  const currentTheme = scenes[currentScene].theme;

  return (
    <div className={`relative h-screen w-screen overflow-hidden transition-colors duration-1000 ${currentTheme === 'dark' ? 'bg-[#0A0C0E]' : 'bg-[#F8F9FA]'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 1.5 }}
          className="h-full w-full"
        >
          {scenes[currentScene].component}
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10 z-50">
        <motion.div
          key={currentScene}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: scenes[currentScene].duration / 1000, ease: "linear" }}
          className={`h-full ${currentTheme === 'dark' ? 'bg-sage-light' : 'bg-sage-dark'}`}
        />
      </div>

      {/* Navigation Overlays */}
      <div className="absolute top-8 right-8 z-50 flex gap-4">
         <button 
           onClick={onBack}
           className={`p-3 rounded-full border ${currentTheme === 'dark' ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/5 text-black hover:bg-black/5'} transition-all`}
         >
           Exit Demo
         </button>
      </div>
      
      <div className="absolute bottom-8 right-8 z-50 flex gap-2">
         {scenes.map((_, i) => (
           <div 
             key={i} 
             className={`w-2 h-2 rounded-full transition-all duration-500 ${i === currentScene ? (currentTheme === 'dark' ? 'bg-white scale-150' : 'bg-sage-dark scale-150') : 'bg-current/20'}`} 
           />
         ))}
      </div>
    </div>
  );
};

export default CinematicDemo;
