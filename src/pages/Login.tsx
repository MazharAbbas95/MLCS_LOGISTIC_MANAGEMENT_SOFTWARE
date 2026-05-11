import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    const success = await login(password);
    setLoading(false);

    if (success) {
      toast.success('Welcome back, Mazhar Abbas!');
    } else {
      toast.error('Invalid password. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sage-light/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-sage-border p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-sage-dark rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-sage-dark/20">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-natural-text text-center">MLCS Admin Access</h1>
          <p className="text-sage-medium text-sm mt-2 text-center">Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-natural-text ml-1">Administrator Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sage-medium group-focus-within:text-sage-dark transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your security key"
                className="w-full bg-natural-bg border-2 border-sage-border rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-sage-dark transition-all font-medium text-natural-text"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-sage-medium hover:text-sage-dark transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <motion.button 
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-sage-dark text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 shadow-xl shadow-sage-dark/20 hover:bg-black transition-all disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Unlock System</span>
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-8 border-t border-sage-border flex flex-col items-center gap-4">
          <p className="text-xs text-sage-medium flex items-center gap-1.5">
            <User size={12} />
            Logged in as: <span className="font-bold text-natural-text">Mazhar Abbas</span>
          </p>
          <p className="text-[10px] text-sage-medium opacity-60 text-center uppercase tracking-widest leading-relaxed">
            Madad Logistics Container Services<br />© 2026 Secured System
          </p>
          <button 
            onClick={() => window.location.href = '?demo=true'}
            className="mt-4 px-4 py-2 border border-sage-light text-sage-dark rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-sage-light/10 transition-all"
          >
            Watch System Demo
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
