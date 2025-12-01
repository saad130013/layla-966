
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { ScrollText, PlusCircle, Calendar, ArrowRight, CheckCheck, Edit2, List } from 'lucide-react';
import { GlobalPenaltyStatus } from '../types';

const GlobalPenaltyStatementsList: React.FC = () => {
    const { globalPenaltyStatements } = useContext(AppContext);
    const { t } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();

    // Default to 'all', but prioritize state passed from navigation (e.g. after approval)
    const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'draft'>('all');
    
    // Check for state on mount
    useEffect(() => {
        if (location.state && (location.state as any).activeTab) {
            setActiveTab((location.state as any).activeTab);
            // Clear state to prevent stuck tab on refresh (optional, but good practice)
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const handleCreate = () => {
        // Navigate to create page with query params
        navigate(`/global-penalty-statement/new?month=${selectedMonth}&year=${selectedYear}`);
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const years = [2024, 2025, 2026];

    const filteredStatements = useMemo(() => {
        let filtered = globalPenaltyStatements;
        
        if (activeTab === 'approved') {
            filtered = filtered.filter(s => s.status === GlobalPenaltyStatus.Approved);
        } else if (activeTab === 'draft') {
            filtered = filtered.filter(s => s.status === GlobalPenaltyStatus.Draft);
        }

        // Sort by Year DESC, then Month DESC
        return filtered.sort((a, b) => {
            if (b.year !== a.year) {
                return b.year - a.year;
            }
            return b.month - a.month;
        });
    }, [globalPenaltyStatements, activeTab]);

    const getCount = (status: 'all' | 'approved' | 'draft') => {
        if (status === 'all') return globalPenaltyStatements.length;
        if (status === 'approved') return globalPenaltyStatements.filter(s => s.status === GlobalPenaltyStatus.Approved).length;
        return globalPenaltyStatements.filter(s => s.status === GlobalPenaltyStatus.Draft).length;
    };

    const tabs = [
        { id: 'all', label: 'all', icon: List },
        { id: 'approved', label: 'approved', icon: CheckCheck },
        { id: 'draft', label: 'draft', icon: Edit2 },
    ] as const;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-brand-green flex items-center gap-2">
                        <ScrollText className="text-brand-blue"/>
                        {t('globalPenaltyStatementsList')}
                    </h1>
                </div>
            </div>

            <Card title={t('createStatement')}>
                <div className="flex flex-col md:flex-row items-end gap-4">
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium mb-1">{t('month')}</label>
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                    </div>
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium mb-1">{t('year')}</label>
                         <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="w-full md:w-1/3">
                        <button 
                            onClick={handleCreate}
                            className="w-full flex items-center justify-center px-4 py-2 bg-brand-teal text-white font-semibold rounded-md shadow-sm hover:bg-brand-blue-dark transition-colors"
                        >
                            <PlusCircle size={18} className="me-2" />
                            {t('generateStatement')}
                        </button>
                    </div>
                </div>
            </Card>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                isActive 
                                ? 'bg-brand-blue text-white border-brand-blue' 
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Icon size={16} className="me-2" />
                            {t(tab.label)}
                            <span className={`ms-2 px-1.5 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                {getCount(tab.id)}
                            </span>
                        </button>
                    )
                })}
            </div>

            <Card>
                {filteredStatements.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">{t('noStatementsFound')}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3">{t('referenceNumber')}</th>
                                    <th className="px-6 py-3">{t('statementPeriod')}</th>
                                    <th className="px-6 py-3">{t('totalViolations')}</th>
                                    <th className="px-6 py-3">{t('totalAmount')}</th>
                                    <th className="px-6 py-3">{t('status')}</th>
                                    <th className="px-6 py-3">{t('view')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStatements.map(stmt => (
                                    <tr key={stmt.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 font-medium">{stmt.referenceNumber}</td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400"/>
                                            {months[stmt.month]} {stmt.year}
                                        </td>
                                        <td className="px-6 py-4 text-center">{stmt.totalViolations}</td>
                                        <td className="px-6 py-4 font-bold text-red-600">{stmt.totalAmount.toLocaleString()} SAR</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${stmt.status === GlobalPenaltyStatus.Approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {t(stmt.status.toLowerCase())}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/global-penalty-statement/${stmt.id}`} className="text-brand-blue hover:text-brand-teal">
                                                <ArrowRight size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default GlobalPenaltyStatementsList;
