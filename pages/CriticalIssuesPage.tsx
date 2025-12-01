
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Eye, Send } from 'lucide-react';
import { ReportStatus } from '../types';

const CriticalIssuesPage: React.FC = () => {
    const { reports, getLocationById, getInspectorById, getFormById } = useContext(AppContext);
    const { t, language } = useI18n();
    const navigate = useNavigate();

    const calculateScore = (report: any) => {
        const location = getLocationById(report.locationId);
        if (!location) return 0;
        const form = getFormById(location.formId);
        if (!form || form.items.length === 0) return 0;
        const maxScore = form.items.reduce((sum, item) => sum + item.maxScore, 0);
        const actualScore = report.items.reduce((sum, item) => sum + item.score, 0);
        return maxScore > 0 ? (actualScore / maxScore) * 100 : 0;
    };

    const criticalReports = useMemo(() => {
        return reports
            .filter(r => {
                const score = calculateScore(r);
                return score < 75 && r.status !== ReportStatus.Draft;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reports, getLocationById, getFormById]);

    const handleSendWarning = (inspectorName: string, locationName: string) => {
        alert(`Warning notification sent to ${inspectorName} regarding low performance at ${locationName}.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={20} />
                <span>{t('dashboard')}</span>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('criticalIssuesList')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{criticalReports.length} {t('requiresImmediateAction')}</p>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3">{t('date')}</th>
                                <th className="px-6 py-3">{t('location')}</th>
                                <th className="px-6 py-3">{t('inspector')}</th>
                                <th className="px-6 py-3 text-center">{t('score')}</th>
                                <th className="px-6 py-3">{t('failedItems')}</th>
                                <th className="px-6 py-3 text-center">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {criticalReports.map(report => {
                                const location = getLocationById(report.locationId);
                                const inspector = getInspectorById(report.inspectorId);
                                const score = calculateScore(report);
                                const failedItemsCount = report.items.filter(i => i.score < 3).length;

                                return (
                                    <tr key={report.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10">
                                        <td className="px-6 py-4">{new Date(report.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{location?.name[language]}</td>
                                        <td className="px-6 py-4">{inspector?.name}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded border border-red-200">
                                                {score.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-red-600 font-medium">
                                            {failedItemsCount} items
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                                                <button 
                                                    onClick={() => navigate(`/report/${report.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                                                    title={t('view')}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleSendWarning(inspector?.name || '', location?.name[language] || '')}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                                                    title={t('warnInspector')}
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default CriticalIssuesPage;
