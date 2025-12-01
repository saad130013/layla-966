
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import { I18nContext } from './context/I18nContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewInspection from './pages/NewInspection';
import ReportDetail from './pages/ReportDetail';
import ReportingHub from './pages/ReportingHub';
import Settings from './pages/Settings';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import AlertsPage from './pages/AlertsPage';
import CDRList from './pages/CDRList';
import CDRDetail from './pages/CDRDetail';
import MyReportsPage from './pages/MyReportsPage';
import InspectorAveragesPage from './pages/InspectorAveragesPage';
import HeatmapPage from './pages/HeatmapPage';
import PenaltyInvoicesPage from './pages/PenaltyInvoicesPage';
import PenaltyInvoiceDetail from './pages/PenaltyInvoiceDetail';
import GlobalPenaltyStatementsList from './pages/GlobalPenaltyStatementsList';
import GlobalPenaltyStatementDetail from './pages/GlobalPenaltyStatementDetail';
import ContractDetailsPage from './pages/ContractDetailsPage';
import CriticalIssuesPage from './pages/CriticalIssuesPage';

const App: React.FC = () => {
  const { user, theme } = useContext(AppContext);
  const { language } = useContext(I18nContext);

  React.useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const PlaceholderPage: React.FC<{title: string}> = ({title}) => (
    <div className="flex items-center justify-center h-full">
      <h1 className="text-2xl text-gray-500">{title} Page - Coming Soon</h1>
    </div>
  );

  return (
    <HashRouter>
      <div className={`flex h-screen bg-brand-gray dark:bg-gray-900 text-gray-800 dark:text-gray-200 ${language === 'ar' ? 'font-[Tahoma]' : ''}`}>
        {user ? (
          <>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-gray dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/new-inspection" element={<NewInspection />} />
                  <Route path="/reporting-hub" element={<ReportingHub />} />
                  <Route path="/report/:id" element={<ReportDetail />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/inspectors" element={<PlaceholderPage title="Inspectors" />} />
                  <Route path="/standards" element={<PlaceholderPage title="Standards" />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/cdr" element={<CDRList />} />
                  <Route path="/cdr/:id" element={<CDRDetail />} />
                  <Route path="/my-reports" element={<MyReportsPage />} />
                  <Route path="/inspector-averages" element={<InspectorAveragesPage />} />
                  <Route path="/heatmap" element={<HeatmapPage />} />
                  <Route path="/penalty-invoices" element={<PenaltyInvoicesPage />} />
                  <Route path="/penalty-invoice/:id" element={<PenaltyInvoiceDetail />} />
                  <Route path="/global-penalty-statements" element={<GlobalPenaltyStatementsList />} />
                  <Route path="/global-penalty-statement/:id" element={<GlobalPenaltyStatementDetail />} />
                  <Route path="/contract-details" element={<ContractDetailsPage />} />
                  <Route path="/critical-issues" element={<CriticalIssuesPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </main>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </HashRouter>
  );
};

export default App;
