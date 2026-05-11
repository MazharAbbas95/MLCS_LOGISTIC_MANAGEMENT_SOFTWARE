import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Palette, Type, Globe, Layout, Bell, Save,
  RotateCcw, Sun, Moon, Monitor, Check,
  Zap, SlidersHorizontal, Calendar, ArrowLeft, Lock, LogOut
} from 'lucide-react';
import { useSettings, Theme, FontSize, AccentColor, DateFormat } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('appearance');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      resetSettings();
    }
  };

  const sections = [
    { id: 'appearance',    label: 'Appearance',       icon: Palette },
    { id: 'typography',    label: 'Typography',        icon: Type },
    { id: 'language',      label: 'Language & Region', icon: Globe },
    { id: 'layout',        label: 'Layout & Display',  icon: Layout },
    { id: 'behaviour',     label: 'Behaviour',         icon: Zap },
    { id: 'notifications', label: 'Notifications',     icon: Bell },
    { id: 'security',      label: 'Security',          icon: Lock },
  ];

  const { logout, updatePassword } = useAuth();
  const [securityData, setSecurityData] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleUpdatePassword = async () => {
    if (!securityData.oldPass || !securityData.newPass) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (securityData.newPass !== securityData.confirmPass) {
      toast.error('New passwords do not match');
      return;
    }
    const result = await updatePassword(securityData.oldPass, securityData.newPass);
    if (result.success) {
      toast.success(result.message);
      setSecurityData({ oldPass: '', newPass: '', confirmPass: '' });
    } else {
      toast.error(result.message);
    }
  };

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
        value ? 'bg-sage-dark' : 'bg-sage-border'
      }`}
    >
      <span className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 mt-0.5 ${
        value ? 'translate-x-6' : 'translate-x-0.5'
      }`} />
    </button>
  );

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white border border-sage-border rounded-2xl p-6 space-y-5 shadow-sm">
      <h3 className="font-bold text-natural-text text-base border-b border-sage-border pb-3">{title}</h3>
      {children}
    </div>
  );

  const Row = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="font-semibold text-natural-text text-sm">{label}</p>
        {description && <p className="text-sage-medium text-xs mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {

      case 'appearance': return (
        <div className="space-y-5">
          <SectionCard title="Theme">
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: 'light',  label: 'Light',  icon: Sun },
                { id: 'dark',   label: 'Dark',   icon: Moon },
                { id: 'system', label: 'System', icon: Monitor },
              ] as { id: Theme; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateSetting('theme', id)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                    settings.theme === id
                      ? 'border-sage-dark bg-sage-dark/5 shadow-md'
                      : 'border-sage-border hover:border-sage-medium hover:bg-natural-bg'
                  }`}
                >
                  <Icon size={22} className={settings.theme === id ? 'text-sage-dark' : 'text-sage-medium'} />
                  <span className={`text-sm font-semibold ${settings.theme === id ? 'text-sage-dark' : 'text-sage-medium'}`}>{label}</span>
                  {settings.theme === id && (
                    <span className="w-5 h-5 bg-sage-dark rounded-full flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Accent Color">
            <div className="flex flex-wrap gap-4 items-center">
              {([
                { id: 'sage',   label: 'Sage Green', hex: '#88887A' },
                { id: 'blue',   label: 'Ocean Blue', hex: '#3b82f6' },
                { id: 'rose',   label: 'Rose',       hex: '#f43f5e' },
                { id: 'amber',  label: 'Amber',      hex: '#f59e0b' },
                { id: 'violet', label: 'Violet',     hex: '#8b5cf6' },
              ] as { id: AccentColor; label: string; hex: string }[]).map(({ id, label, hex }) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateSetting('accentColor', id)}
                  title={label}
                  className={`relative w-11 h-11 rounded-full shadow-md transition-all hover:scale-110 ${
                    settings.accentColor === id ? 'ring-4 ring-offset-2 scale-110' : ''
                  }`}
                  style={{ backgroundColor: hex, outlineColor: hex }}
                >
                  {settings.accentColor === id && (
                    <Check size={16} className="text-white absolute inset-0 m-auto" />
                  )}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-sage-medium">Applied to active states, highlights, and buttons.</p>
          </SectionCard>
        </div>
      );

      case 'typography': return (
        <div className="space-y-5">
          <SectionCard title="Font Size">
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: 'small',  label: 'Small',  size: 18 },
                { id: 'medium', label: 'Medium', size: 26 },
                { id: 'large',  label: 'Large',  size: 34 },
              ] as { id: FontSize; label: string; size: number }[]).map(({ id, label, size }) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateSetting('fontSize', id)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                    settings.fontSize === id
                      ? 'border-sage-dark bg-sage-dark/5 shadow-md'
                      : 'border-sage-border hover:border-sage-medium hover:bg-natural-bg'
                  }`}
                >
                  <span style={{ fontSize: size }}
                    className={`font-bold leading-none ${settings.fontSize === id ? 'text-sage-dark' : 'text-sage-medium'}`}
                  >Aa</span>
                  <span className={`text-xs font-semibold ${settings.fontSize === id ? 'text-sage-dark' : 'text-sage-medium'}`}>{label}</span>
                </motion.button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Live Preview">
            <div className="bg-natural-bg rounded-xl p-5 space-y-2 border border-sage-border">
              <p className="font-bold text-natural-text">MLCS — Madad Logistics Container Services</p>
              <p className="text-sage-medium">Digital Bilty #6499 | Date: 09/05/2026</p>
              <p className="text-sm text-sage-medium">Origin: Multan → Destination: Karachi</p>
            </div>
          </SectionCard>
        </div>
      );

      case 'language': return (
        <div className="space-y-5">
          <SectionCard title="Interface Language">
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'en', label: 'English',    native: 'English' },
                { id: 'ur', label: 'Urdu',       native: 'اردو' },
              ]).map(({ id, label, native }) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateSetting('language', id as 'en' | 'ur')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    settings.language === id
                      ? 'border-sage-dark bg-sage-dark/5 shadow-md'
                      : 'border-sage-border hover:border-sage-medium hover:bg-natural-bg'
                  }`}
                >
                  <span className={`font-semibold text-sm ${settings.language === id ? 'text-sage-dark' : 'text-sage-medium'}`}>{label}</span>
                  <span className={`font-bold text-base ${settings.language === id ? 'text-sage-dark' : 'text-sage-medium'}`}>{native}</span>
                  {settings.language === id && <Check size={16} className="text-sage-dark" />}
                </motion.button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Date Format">
            <div className="space-y-2">
              {(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] as DateFormat[]).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => updateSetting('dateFormat', fmt)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm ${
                    settings.dateFormat === fmt
                      ? 'border-sage-dark bg-sage-dark/5 font-bold text-sage-dark'
                      : 'border-sage-border text-sage-medium hover:bg-natural-bg'
                  }`}
                >
                  <span>{fmt}</span>
                  <span className="text-xs opacity-60">
                    {fmt === 'DD/MM/YYYY' ? '09/05/2026' : fmt === 'MM/DD/YYYY' ? '05/09/2026' : '2026-05-09'}
                  </span>
                  {settings.dateFormat === fmt && <Check size={14} className="text-sage-dark" />}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      );

      case 'layout': return (
        <div className="space-y-5">
          <SectionCard title="Display Options">
            <Row label="Compact Mode" description="Reduce padding and spacing throughout the app">
              <ToggleSwitch value={settings.compactMode} onChange={v => updateSetting('compactMode', v)} />
            </Row>
            <Row label="Animations" description="Smooth transitions and micro-interactions">
              <ToggleSwitch value={settings.animationsEnabled} onChange={v => updateSetting('animationsEnabled', v)} />
            </Row>
          </SectionCard>

          <SectionCard title="Sidebar">
            <div className="space-y-2">
              {([
                { id: 'auto',             label: 'Auto',           desc: 'Collapse on small screens' },
                { id: 'always-open',      label: 'Always Open',    desc: 'Keep sidebar expanded' },
                { id: 'always-collapsed', label: 'Always Compact', desc: 'Icon-only sidebar' },
              ]).map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => updateSetting('sidebarBehavior', id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm ${
                    settings.sidebarBehavior === id
                      ? 'border-sage-dark bg-sage-dark/5 font-bold text-sage-dark'
                      : 'border-sage-border text-sage-medium hover:bg-natural-bg'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs opacity-70">{desc}</p>
                  </div>
                  {settings.sidebarBehavior === id && <Check size={14} className="text-sage-dark" />}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      );

      case 'behaviour': return (
        <div className="space-y-5">
          <SectionCard title="App Behaviour">
            <Row label="Auto-Save" description="Automatically save forms while typing">
              <ToggleSwitch value={settings.autoSave} onChange={v => updateSetting('autoSave', v)} />
            </Row>
          </SectionCard>
        </div>
      );

      case 'notifications': return (
        <div className="space-y-5">
          <SectionCard title="Notification Preferences">
            <Row label="Enable Notifications" description="Show success, warning, and error toasts">
              <ToggleSwitch value={settings.notificationsEnabled} onChange={v => updateSetting('notificationsEnabled', v)} />
            </Row>
          </SectionCard>
        </div>
      );

      case 'security': return (
        <div className="space-y-5">
          <SectionCard title="Password Management">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-medium uppercase">Current Password</label>
                  <input 
                    type="password"
                    value={securityData.oldPass}
                    onChange={(e) => setSecurityData({...securityData, oldPass: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-natural-bg border border-sage-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage-dark transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-medium uppercase">New Password</label>
                  <input 
                    type="password"
                    value={securityData.newPass}
                    onChange={(e) => setSecurityData({...securityData, newPass: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-natural-bg border border-sage-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage-dark transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-medium uppercase">Confirm New Password</label>
                  <input 
                    type="password"
                    value={securityData.confirmPass}
                    onChange={(e) => setSecurityData({...securityData, confirmPass: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-natural-bg border border-sage-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage-dark transition-all"
                  />
                </div>
              </div>
              <button 
                onClick={handleUpdatePassword}
                className="bg-sage-dark text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all"
              >
                Update Password
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Account Security">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-natural-text text-sm">System Access</p>
                <p className="text-sage-medium text-xs mt-0.5">Logout from the current session</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <LogOut size={16} />
                Logout System
              </button>
            </div>
          </SectionCard>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-sage-border rounded-xl transition-colors text-sage-dark"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-serif text-natural-text font-bold">Settings</h2>
            <p className="text-sage-medium text-sm mt-1">Customize your MLCS experience</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-natural-bg border border-sage-border rounded-xl text-sage-dark text-sm font-semibold hover:bg-sage-border transition-all"
          >
            <RotateCcw size={15} />
            Reset Defaults
          </button>
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-2.5 bg-sage-dark text-white rounded-xl text-sm font-bold shadow-lg transition-all"
          >
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? 'Saved!' : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      {/* Body: two-column layout */}
      <div className="flex gap-6 min-h-[600px]">

        {/* Left nav */}
        <div className="w-56 flex-shrink-0 space-y-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                activeSection === id
                  ? 'bg-sage-dark text-white shadow-md'
                  : 'text-sage-medium hover:bg-natural-bg hover:text-natural-text'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
