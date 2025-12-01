
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { UserRole } from '../../types';
import { LayoutDashboard, FilePlus, Settings, Hospital, Users, BookOpen, Bell, LogOut, NotebookText, BarChart3, Map, Receipt, ScrollText, Briefcase } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useContext(AppContext);
  const { t } = useI18n();

  const inspectorLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, text: t('dashboard') },
    { to: '/new-inspection', icon: <FilePlus size={20} />, text: t('newInspection') },
    { to: '/cdr', icon: <NotebookText size={20} />, text: t('cdr') },
    { to: '/my-reports', icon: <BarChart3 size={20} />, text: t('myReports') },
    { to: '/settings', icon: <Settings size={20} />, text: t('settings') },
  ];

  const supervisorLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, text: t('dashboard') },
    { to: '/reporting-hub', icon: <BarChart3 size={20} />, text: t('reportingHub') },
    { to: '/cdr', icon: <NotebookText size={20} />, text: t('cdr') },
    { to: '/penalty-invoices', icon: <Receipt size={20} />, text: t('penaltyInvoices') },
    { to: '/global-penalty-statements', icon: <ScrollText size={20} />, text: t('globalPenaltyStatement') },
    { to: '/contract-details', icon: <Briefcase size={20} />, text: t('contractDetails') },
    { to: '/heatmap', icon: <Map size={20} />, text: t('heatmap') },
    { to: '/inspectors', icon: <Users size={20} />, text: t('inspectors') },
    { to: '/standards', icon: <BookOpen size={20} />, text: t('standards') },
    { to: '/alerts', icon: <Bell size={20} />, text: t('alerts') },
    { to: '/settings', icon: <Settings size={20} />, text: t('settings') },
  ];

  const links = user?.role === UserRole.Inspector ? inspectorLinks : supervisorLinks;

  const NavItem: React.FC<{ to: string, icon: React.ReactNode, text: string }> = ({ to, icon, text }) => (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
            isActive
              ? 'bg-brand-teal text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`
        }
      >
        {icon}
        <span className="ms-3">{text}</span>
      </NavLink>
    </li>
  );

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col no-print">
      <div className="flex items-center space-x-3 rtl:space-x-reverse p-2 mb-6">
        <Hospital size={32} className="text-brand-blue" />
        <span className="text-xl font-bold text-brand-blue-dark dark:text-white">InspectionSys</span>
      </div>
      <nav className="flex-1">
        <ul>
          {links.map(link => (
            <NavItem key={link.to} to={link.to} icon={link.icon} text={link.text} />
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
         <button onClick={logout} className="flex w-full items-center p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
          <LogOut size={20} />
          <span className="ms-3 font-semibold">{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
