/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Eagerly loaded (needed before auth)
import Login from './pages/Login';

// Lazy loaded pages — deferred until first use (reduces initial bundle)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VehicleRecord = lazy(() => import('./pages/VehicleRecord'));
const AddVehicleRecord = lazy(() => import('./pages/AddVehicleRecord'));
const ViewVehicleRecords = lazy(() => import('./pages/ViewVehicleRecords'));
const DailyExpenseModule = lazy(() => import('./pages/DailyExpenseModule'));
const AddDailyExpense = lazy(() => import('./pages/AddDailyExpense'));
const ViewDailyExpenses = lazy(() => import('./pages/ViewDailyExpenses'));
const LetterPad = lazy(() => import('./pages/LetterPad'));
const DigitalBilty = lazy(() => import('./pages/DigitalBilty'));
const Reports = lazy(() => import('./pages/Reports'));
const BiltyArchive = lazy(() => import('./pages/BiltyArchive'));
const LetterPadArchive = lazy(() => import('./pages/LetterPadArchive'));
const Settings = lazy(() => import('./pages/Settings'));
const CinematicDemo = lazy(() => import('./pages/CinematicDemo'));

// Minimal spinner shown while a lazy page chunk loads
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-natural-bg">
    <div className="w-10 h-10 border-4 border-sage-medium border-t-sage-dark rounded-full animate-spin" />
  </div>
);

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
        return (
          <VehicleRecord
            onAddClick={() => setActiveView('addVehicleRecord')}
            onViewClick={() => setActiveView('viewVehicleRecords')}
          />
        );
      case 'addVehicleRecord':
        return <AddVehicleRecord onBack={() => setActiveView('vehicleRecord')} />;
      case 'viewVehicleRecords':
        return <ViewVehicleRecords onBack={() => setActiveView('vehicleRecord')} />;
      case 'expense':
        return (
          <DailyExpenseModule
            onAddClick={() => setActiveView('addDailyExpense')}
            onViewClick={() => setActiveView('viewDailyExpenses')}
          />
        );
      case 'addDailyExpense':
        return <AddDailyExpense onBack={() => setActiveView('expense')} />;
      case 'viewDailyExpenses':
        return <ViewDailyExpenses onBack={() => setActiveView('expense')} />;
      case 'letterpad':
        return (
          <LetterPad
            onBack={() => {
              setActiveView('dashboard');
              setSelectedLetter(null);
            }}
            onArchiveClick={() => setActiveView('letterPadArchive')}
            initialData={selectedLetter}
          />
        );
      case 'bilty':
        return (
          <DigitalBilty
            onBack={() => setActiveView('dashboard')}
            onArchiveClick={() => setActiveView('biltyArchive')}
          />
        );
      case 'reports':
        return <Reports onBack={() => setActiveView('dashboard')} />;
      case 'settings':
        return <Settings onBack={() => setActiveView('dashboard')} />;
      case 'biltyArchive':
        return <BiltyArchive onBack={() => setActiveView('bilty')} />;
      case 'letterPadArchive':
        return (
          <LetterPadArchive
            onBack={() => setActiveView('letterpad')}
            onViewLetter={(letter) => {
              setSelectedLetter(letter);
              setActiveView('letterpad');
            }}
          />
        );
      default:
        return <Dashboard onAction={(view) => setActiveView(view)} />;
    }
  };

  return (
    <div className={activeView === 'cinematicDemo' ? 'h-screen w-screen overflow-hidden bg-black' : ''}>
      {activeView === 'cinematicDemo' ? (
        <Suspense fallback={<PageLoader />}>
          {renderContent()}
        </Suspense>
      ) : (
        <Layout activeView={activeView} setActiveView={setActiveView}>
          <Suspense fallback={<PageLoader />}>
            {renderContent()}
          </Suspense>
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
