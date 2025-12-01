
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { I18nContext } from '../../context/I18nContext';
import { LogOut, User, Globe, Bell, Search, X, Check, Sun, Moon } from 'lucide-react';
import { Notification } from '../../types';

const Header: React.FC = () => {
  const { user, logout, theme, toggleTheme, notifications, markNotificationAsRead } = useContext(AppContext);
  const { language, setLanguage, t } = useContext(I18nContext);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch(type) {
      case 'alert': return <div className="p-2 bg-red-100 rounded-full"><Bell className="h-5 w-5 text-red-600" /></div>;
      case 'success': return <div className="p-2 bg-green-100 rounded-full"><Check className="h-5 w-5 text-green-600" /></div>;
      default: return <div className="p-2 bg-blue-100 rounded-full"><Bell className="h-5 w-5 text-blue-600" /></div>;
    }
  }

  return (
    <header className="flex-shrink-0 flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md z-10">
      {/* Global Search */}
      <div className="relative w-full max-w-xs">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input 
            type="text" 
            placeholder={t('globalSearchPlaceholder')}
            className="w-full ps-10 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-brand-teal focus:border-brand-teal transition"
        />
      </div>

      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse text-gray-600 dark:text-gray-300">
          <User size={20} />
          <span>{t('welcome')}, {user?.name}</span>
        </div>
        
        <button onClick={toggleTheme} title={theme === 'light' ? t('darkMode') : t('lightMode')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue">
          <Globe size={20} />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>}
          </button>
          {notificationsOpen && (
            <div className="absolute end-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 overflow-hidden">
              <div className="p-3 font-bold text-gray-800 dark:text-gray-200 border-b dark:border-gray-700">{t('notifications')}</div>
              <ul className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(n => (
                  <li key={n.id} className={`border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <Link to={n.link || '#'} className="block p-3" onClick={() => { markNotificationAsRead(n.id); setNotificationsOpen(false); }}>
                      <div className="flex items-start space-x-3 rtl:space-x-reverse">
                        {getNotificationIcon(n.type)}
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                        </div>
                        {!n.isRead && <div className="h-2 w-2 rounded-full bg-brand-blue mt-1"></div>}
                      </div>
                    </Link>
                  </li>
                )) : <p className="p-4 text-sm text-gray-500">{t('noNewNotifications')}</p>}
              </ul>
              <Link to="/alerts" onClick={() => setNotificationsOpen(false)} className="block text-center p-2 text-sm font-medium text-brand-blue bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">{t('viewAll')}</Link>
            </div>
          )}
        </div>
        
        <button onClick={logout} className="flex items-center space-x-2 rtl:space-x-reverse text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300">
          <LogOut size={20} />
          <span className="hidden sm:inline">{t('logout')}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;