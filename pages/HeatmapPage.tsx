import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { InspectionReport } from '../types';

const HeatmapPage: React.FC = () => {
    const { reports, zones, locations, getFormById, getLocationById } = useContext(AppContext);
    const { t, language } = useI18n();
    const [period, setPeriod] = useState('last30Days');

    const calculateCompliance = (report: InspectionReport) => {
        const location = getLocationById(report.locationId);
        if (!location) return 0;
        const form = getFormById(location.formId);
        if (!form || form.items.length === 0) return 0;
        const maxScore = form.items.reduce((sum, item) => sum + item.maxScore, 0);
        const actualScore = report.items.reduce((sum, item) => sum + item.score, 0);
        return maxScore > 0 ? (actualScore / maxScore) * 100 : 0;
    };

    const locationPerformance = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        if (period === 'last7Days') startDate.setDate(now.getDate() - 7);
        else if (period === 'last30Days') startDate.setMonth(now.getMonth() - 1);
        else if (period === 'last90Days') startDate.setMonth(now.getMonth() - 3);
        else startDate = new Date(0); // All time

        const filteredReports = reports.filter(r => new Date(r.date) >= startDate);
        
        const performanceMap = new Map<string, { totalCompliance: number; count: number }>();
        filteredReports.forEach(report => {
            const current = performanceMap.get(report.locationId) || { totalCompliance: 0, count: 0 };
            current.totalCompliance += calculateCompliance(report);
            current.count++;
            performanceMap.set(report.locationId, current);
        });

        const performanceData: Record<string, number> = {};
        locations.forEach(location => {
            const data = performanceMap.get(location.id);
            if (data && data.count > 0) {
                performanceData[location.id] = data.totalCompliance / data.count;
            }
        });
        
        return performanceData;
    }, [reports, period, locations, getFormById, getLocationById]);
    
    const getHeatColor = (score: number | undefined) => {
        if (score === undefined) return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600';
        if (score >= 95) return 'bg-emerald-500 text-white border-emerald-600';
        if (score >= 90) return 'bg-green-500 text-white border-green-600';
        if (score >= 85) return 'bg-lime-500 text-black border-lime-600';
        if (score >= 80) return 'bg-yellow-500 text-black border-yellow-600';
        if (score >= 75) return 'bg-amber-500 text-white border-amber-600';
        return 'bg-red-600 text-white border-red-700';
    };

    const Legend = () => (
        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <span className="text-sm font-semibold">{t('legend')}:</span>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-sm bg-emerald-500"></div><span className="text-xs">&ge; 95%</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-sm bg-green-500"></div><span className="text-xs">90-94.9%</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-sm bg-yellow-500"></div><span className="text-xs">80-84.9%</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-sm bg-red-600"></div><span className="text-xs">&lt; 75%</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-sm bg-gray-200 dark:bg-gray-700"></div><span className="text-xs">{t('noData')}</span></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-gray-200">{t('hospitalHeatmap')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('locationPerformanceHeatmap')}</p>
                </div>
                <div className="flex items-center gap-4">
                     <select value={period} onChange={(e) => setPeriod(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-teal focus:border-brand-teal bg-white dark:bg-gray-700">
                        <option value="last7Days">{t('last7Days')}</option>
                        <option value="last30Days">{t('lastMonth')}</option>
                        <option value="last90Days">{t('last3Months')}</option>
                        <option value="allTime">{t('allTime')}</option>
                    </select>
                </div>
            </div>

            <Card>
                <div className="mb-6">
                    <Legend />
                </div>
                {zones.map(zone => {
                    const zoneLocations = locations.filter(l => l.zoneId === zone.id);
                    return (
                        <div key={zone.id} className="mb-8 last:mb-0">
                            <h2 className="text-xl font-bold text-brand-blue-dark dark:text-brand-green mb-4 pb-2 border-b-2 border-brand-teal">{t(zone.riskCategory.toLowerCase() + 'Risk')}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {zoneLocations.map(location => {
                                    const score = locationPerformance[location.id];
                                    return (
                                        <div 
                                            key={location.id} 
                                            className={`p-3 rounded-lg shadow-sm text-center font-semibold transition-transform hover:scale-105 border-b-4 ${getHeatColor(score)}`}
                                            title={`${t('avgComplianceScore')}: ${score !== undefined ? score.toFixed(1) + '%' : t('noData')}`}
                                        >
                                            <p className="text-sm leading-tight min-h-[42px] flex items-center justify-center">{location.name[language]}</p>
                                            <p className="text-2xl mt-2 font-black tracking-tight">{score !== undefined ? score.toFixed(1) + '%' : '-'}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </Card>
        </div>
    );
};

export default HeatmapPage;
