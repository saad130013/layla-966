
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { Notification } from '../types';
import { Bell, Check, CheckCheck } from 'lucide-react';

const AlertsPage: React.FC = () => {
    const { notifications, markAllNotificationsAsRead } = useContext(AppContext);
    const { t } = useI18n();

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'alert': return <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full"><Bell className="h-6 w-6 text-red-600 dark:text-red-400" /></div>;
            case 'success': return <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full"><Check className="h-6 w-6 text-green-600 dark:text-green-400" /></div>;
            default: return <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full"><Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>;
        }
    }

    const sortedNotifications = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-blue-dark dark:text-brand-green">{t('alerts')}</h2>
                <button 
                    onClick={markAllNotificationsAsRead}
                    className="flex items-center px-4 py-2 bg-brand-teal text-white text-sm font-semibold rounded-md shadow-sm hover:bg-brand-blue-dark transition-colors"
                >
                    <CheckCheck size={16} className="me-2"/>
                    {t('markAllAsRead')}
                </button>
            </div>

            <ul className="space-y-4">
                {sortedNotifications.map(n => (
                    <li key={n.id} className={`p-4 rounded-lg transition-colors ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                        <Link to={n.link || '#'} className="block">
                            <div className="flex items-start space-x-4 rtl:space-x-reverse">
                                {getNotificationIcon(n.type)}
                                <div className="flex-1">
                                    <p className={`text-gray-800 dark:text-gray-200 ${!n.isRead ? 'font-semibold' : ''}`}>{n.message}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                </div>
                                {!n.isRead && <div className="h-3 w-3 rounded-full bg-brand-blue mt-1 flex-shrink-0"></div>}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default AlertsPage;
