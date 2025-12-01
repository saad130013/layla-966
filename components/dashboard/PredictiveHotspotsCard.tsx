import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { RiskCategory } from '../../types';
import { Flame, Activity, Calendar, FileWarning } from 'lucide-react';

const PredictiveHotspotsCard: React.FC = () => {
    const { reports, cdrs, locations, zones, getLocationById, getFormById } = useContext(AppContext);
    const { t, language } = useI18n();

    const calculateScore = (report: any) => {
        const location = getLocationById(report.locationId);
        if (!location) return 0;
        const form = getFormById(location.formId);
        if (!form || form.items.length === 0) return 0;
        const maxScore = form.items.reduce((sum, item) => sum + item.maxScore, 0);
        const actualScore = report.items.reduce((sum, item) => sum + item.score, 0);
        return maxScore > 0 ? (actualScore / maxScore) * 100 : 0;
    };

    const hotspots = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return locations.map(location => {
            const locationReports = reports
                .filter(r => r.locationId === location.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            const lastReport = locationReports[0];
            
            const lastInspectionScore = lastReport ? calculateScore(lastReport) : 70; // Assume 70% if no history
            
            const daysSinceLastInspection = lastReport 
                ? Math.floor((new Date().getTime() - new Date(lastReport.date).getTime()) / (1000 * 3600 * 24))
                : 30; // Assume 30 days if no history

            const recentCDRsCount = cdrs.filter(c => c.locationId === location.id && new Date(c.date) > thirtyDaysAgo).length;

            const zone = zones.find(z => z.id === location.zoneId);
            let zoneMultiplier = 1.0;
            if (zone?.riskCategory === RiskCategory.High) zoneMultiplier = 1.5;
            if (zone?.riskCategory === RiskCategory.Medium) zoneMultiplier = 1.2;

            const baseScore = (100 - lastInspectionScore) + (daysSinceLastInspection / 2) + (recentCDRsCount * 10);
            const riskScore = baseScore * zoneMultiplier;

            const keyFactors = [];
            if (lastInspectionScore < 85) keyFactors.push({ text: `${t('lowLastScore')}: ${lastInspectionScore.toFixed(1)}%`, icon: <Activity size={14} className="text-yellow-600" /> });
            if (daysSinceLastInspection > 14) keyFactors.push({ text: `${t('overdueInspection')}: ${daysSinceLastInspection} days`, icon: <Calendar size={14} className="text-orange-600" /> });
            if (recentCDRsCount > 0) keyFactors.push({ text: `${recentCDRsCount} ${t('recentCDRs')}`, icon: <FileWarning size={14} className="text-red-600" /> });
            
            return {
                location,
                riskScore,
                keyFactors
            };
        })
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 3);

    }, [locations, reports, cdrs, zones, t, getFormById, getLocationById]);

    const getRiskColor = (score: number) => {
        if (score > 60) return 'text-red-500 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
        if (score > 40) return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm h-full">
            <h3 className="font-bold text-brand-blue-dark dark:text-brand-green mb-2 flex items-center">
                <Flame size={20} className="me-2 text-red-500" />{t('predictiveRiskHotspots')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t('proactiveActionRecommended')}</p>
            <ul className="space-y-4">
                {hotspots.map(({ location, riskScore, keyFactors }) => (
                    <li key={location.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{location.name[language]}</p>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getRiskColor(riskScore)}`}>
                                {t('riskIndex')}: {riskScore.toFixed(0)}
                            </span>
                        </div>
                        {keyFactors.length > 0 && (
                            <div className="mt-2 border-t dark:border-gray-600 pt-2">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('keyFactors')}:</p>
                                <ul className="space-y-1">
                                    {keyFactors.map((factor, index) => (
                                        <li key={index} className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                                            {factor.icon}
                                            <span className="ms-1.5">{factor.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PredictiveHotspotsCard;
