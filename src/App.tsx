/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VehicleRecord from './pages/VehicleRecord';
import AddVehicleRecord from './pages/AddVehicleRecord';
import ViewVehicleRecords from './pages/ViewVehicleRecords';
import DailyExpenseModule from './pages/DailyExpenseModule';
import AddDailyExpense from './pages/AddDailyExpense';
import ViewDailyExpenses from './pages/ViewDailyExpenses';
import LetterPad from './pages/LetterPad';
import DigitalBilty from './pages/DigitalBilty';
import Reports from './pages/Reports';
import BiltyArchive from './pages/BiltyArchive';
import LetterPadArchive from './pages/LetterPadArchive';
import Settings from './pages/Settings';
import Login from './pages/Login';
import CinematicDemo from './pages/CinematicDemo';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('demo') === 'true' ? 'cinematicDemo' : 'dashboard';
  });
  const [selectedLetter, setSelectedLetter] = useState<any>(null);

  if (!isAuthenticated && activeView !== 'cinematicDemo') {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'cinematicDemo':
        return <CinematicDemo onBack={() => setActiveView('dashboard')} />;
      case 'dashboard':
        return <Dashboard onAction={(view) => setActiveView(view)} />;
      case 'vehicleRecord':
        return <VehicleRecord 
          onAddClick={() => setActiveView('addVehicleRecord')} 
          onViewClick={() => setActiveView('viewVehicleRecords')}
        />;
      case 'addVehicleRecord':
        return <AddVehicleRecord onBack={() => setActiveView('vehicleRecord')} />;
      case 'viewVehicleRecords':
        return <ViewVehicleRecords onBack={() => setActiveView('vehicleRecord')} />;
      case 'expense':
        return <DailyExpenseModule 
          onAddClick={() => setActiveView('addDailyExpense')}
          onViewClick={() => setActiveView('viewDailyExpenses')}
        />;
      case 'addDailyExpense':
        return <AddDailyExpense onBack={() => setActiveView('expense')} />;
      case 'viewDailyExpenses':
        return <ViewDailyExpenses onBack={() => setActiveView('expense')} />;
      case 'letterpad':
        return <LetterPad 
          onBack={() => {
            setActiveView('dashboard');
            setSelectedLetter(null);
          }} 
          onArchiveClick={() => setActiveView('letterPadArchive')}
          initialData={selectedLetter}
        />;
      case 'bilty':
        return <DigitalBilty onBack={() => setActiveView('dashboard')} onArchiveClick={() => setActiveView('biltyArchive')} />;
      case 'reports':
        return <Reports onBack={() => setActiveView('dashboard')} />;
      case 'settings':
        return <Settings onBack={() => setActiveView('dashboard')} />;
      case 'biltyArchive':
        return <BiltyArchive onBack={() => setActiveView('bilty')} />;
      case 'letterPadArchive':
        return <LetterPadArchive 
          onBack={() => setActiveView('letterpad')} 
          onViewLetter={(letter) => {
            setSelectedLetter(letter);
            setActiveView('letterpad');
          }}
        />;
      default:
        return <Dashboard onAction={(view) => setActiveView(view)} />;
    }
  };

  return (
    <div className={activeView === 'cinematicDemo' ? 'h-screen w-screen overflow-hidden bg-black' : ''}>
      {activeView === 'cinematicDemo' ? (
        renderContent()
      ) : (
        <Layout activeView={activeView} setActiveView={setActiveView}>
          {renderContent()}
        </Layout>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <LanguageProvider>
          <NotificationProvider>
            <Toaster position="top-right" />
            <AppContent />
          </NotificationProvider>
        </LanguageProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
