
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { InspectionReport, RiskCategory, EvaluationItem } from '../types';
import { ArrowDownUp, Download } from 'lucide-react';
import PrintableMyPerformanceReport from '../components/reports/PrintableMyPerformanceReport';

// Type for aggregated item stats
export interface ItemStat {
  id: string;
  name: string;
  timesInspected: number;
  avgScore: number;
  avgCompliance: number;
  maxScore: number;
}

export interface PerformanceData {
    totalReports: number;
    overallAvg: number;
    highRiskAvg: number;
    mediumRiskAvg: number;
    lowRiskAvg: number;
    itemAnalysis: Record<RiskCategory, ItemStat[]>;
}

const MyReportsPage: React.FC = () => {
    const { user, reports, getFormById, getLocationById, getZoneByLocationId, forms } = useContext(AppContext);
    const { t } = useI18n();
    const [period, setPeriod] = useState('Last Month');
    const [sortAsc, setSortAsc] = useState(true);
    const [isPrinting, setIsPrinting] = useState(false);

    const calculateScore = (report: InspectionReport) => {
        const location = getLocationById(report.locationId);
        if (!location) return { actualScore: 0, maxScore: 0, compliance: 0 };
        const form = getFormById(location.formId);
        if (!form) return { actualScore: 0, maxScore: 0, compliance: 0 };
        const maxScore = form.items.reduce((sum, item) => sum + item.maxScore, 0);
        const actualScore = report.items.reduce((sum, item) => sum + item.score, 0);
        const compliance = maxScore > 0 ? (actualScore / maxScore) * 100 : 0;
        return { actualScore, maxScore, compliance };
    };

    const performanceData: PerformanceData = useMemo(() => {
        const myReports = reports.filter(r => r.inspectorId === user?.id);
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'Last 7 Days': startDate.setDate(now.getDate() - 7); break;
            case 'Last Month': startDate.setMonth(now.getMonth() - 1); break;
            case 'Last 3 Months': startDate.setMonth(now.getMonth() - 3); break;
            case 'All Time': startDate = new Date(0); break;
            default: startDate.setMonth(now.getMonth() - 1);
        }

        const filteredReports = myReports.filter(r => new Date(r.date) >= startDate);

        const riskCategories: RiskCategory[] = [RiskCategory.High, RiskCategory.Medium, RiskCategory.Low];
        const avgScoresByRisk = riskCategories.reduce((acc, risk) => {
            const riskReports = filteredReports.filter(r => getZoneByLocationId(r.locationId)?.riskCategory === risk);
            const totalCompliance = riskReports.reduce((sum, r) => sum + calculateScore(r).compliance, 0);
            acc[risk] = riskReports.length > 0 ? totalCompliance / riskReports.length : 0;
            return acc;
        }, {} as Record<RiskCategory, number>);

        const overallCompliance = filteredReports.length > 0 
            ? filteredReports.reduce((sum, r) => sum + calculateScore(r).compliance, 0) / filteredReports.length
            : 0;

        const itemStatsMap = new Map<string, { totalScore: number; count: number; totalMaxScore: number }>();
        for (const report of filteredReports) {
            const location = getLocationById(report.locationId);
            const form = location ? getFormById(location.formId) : null;
            if (!form) continue;
            
            for (const item of report.items) {
                const formItem = form.items.find(fi => fi.id === item.itemId);
                if (!formItem) continue;

                const current = itemStatsMap.get(item.itemId) || { totalScore: 0, count: 0, totalMaxScore: 0 };
                current.totalScore += item.score;
                current.count += 1;
                current.totalMaxScore += formItem.maxScore;
                itemStatsMap.set(item.itemId, current);
            }
        }
        
        const itemAnalysisByRisk: Record<RiskCategory, ItemStat[]> = { High: [], Medium: [], Low: [] };

        forms.forEach(form => {
            const risk = form.id.includes('form1') ? RiskCategory.High : form.id.includes('form2') ? RiskCategory.Medium : RiskCategory.Low;
            form.items.forEach(item => {
                const stats = itemStatsMap.get(item.id);
                if (stats) {
                    itemAnalysisByRisk[risk].push({
                        id: item.id,
                        name: item.name,
                        timesInspected: stats.count,
                        avgScore: stats.totalScore / stats.count,
                        avgCompliance: stats.totalMaxScore > 0 ? (stats.totalScore / stats.totalMaxScore) * 100 : 0,
                        maxScore: item.maxScore,
                    });
                }
            });
        });

        // Sort items
        Object.values(itemAnalysisByRisk).forEach(itemList => {
            itemList.sort((a, b) => sortAsc ? a.avgCompliance - b.avgCompliance : b.avgCompliance - a.avgCompliance);
        });

        return {
            totalReports: filteredReports.length,
            overallAvg: overallCompliance,
            highRiskAvg: avgScoresByRisk[RiskCategory.High],
            mediumRiskAvg: avgScoresByRisk[RiskCategory.Medium],
            lowRiskAvg: avgScoresByRisk[RiskCategory.Low],
            itemAnalysis: itemAnalysisByRisk
        };

    }, [user, reports, period, sortAsc, getFormById, getLocationById, getZoneByLocationId, forms]);

     useEffect(() => {
        if (isPrinting) {
            const handleAfterPrint = () => {
                setIsPrinting(false);
            };
            window.addEventListener('afterprint', handleAfterPrint);
            
            // Add a small delay to ensure the DOM is updated with the printable report before printing
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            
            return () => {
                clearTimeout(timer);
                window.removeEventListener('afterprint', handleAfterPrint);
            };
        }
    }, [isPrinting]);

    const PerformanceKpiCard: React.FC<{ title: string; value: number }> = ({ title, value }) => (
        <Card className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-brand-blue-dark dark:text-gray-100">
                {value.toFixed(1)}<span className="text-lg">%</span>
            </p>
        </Card>
    );
    
    const getComplianceColor = (compliance: number) => {
        if (compliance >= 90) return 'bg-green-600';
        if (compliance >= 75) return 'bg-yellow-500';
        return 'bg-red-600';
    }

    const AnalysisTable: React.FC<{items: ItemStat[]}> = ({items}) => {
        if (items.length === 0) {
            return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No data available for this period.</p>;
        }
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th className="text-left p-2">{t('evaluationItem')}</th>
                            <th className="text-center p-2">{t('timesInspected')}</th>
                            <th className="text-center p-2">{t('averageScore')}</th>
                            <th className="text-left p-2">{t('avgCompliance')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-2 font-medium text-gray-800 dark:text-gray-200">{t(item.name)}</td>
                                <td className="p-2 text-center">{item.timesInspected}</td>
                                <td className="p-2 text-center">{item.avgScore.toFixed(1)} / {item.maxScore}</td>
                                <td className="p-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                                            <div className={`${getComplianceColor(item.avgCompliance)} h-2.5 rounded-full`} style={{ width: `${item.avgCompliance}%` }}></div>
                                        </div>
                                        <span className="font-semibold w-12 text-right">{item.avgCompliance.toFixed(1)}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <>
            <div className="space-y-6 no-print">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-gray-200">{t('myPerformanceAnalysis')}</h1>
                        <p className="text-gray-500 dark:text-gray-400">Review your inspection averages and identify areas for improvement.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="text-sm me-2">{t('filterByPeriod')}:</label>
                            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-teal focus:border-brand-teal bg-white dark:bg-gray-700">
                                <option>{t('last7Days')}</option>
                                <option>{t('lastMonth')}</option>
                                <option>{t('last3Months')}</option>
                                <option>{t('allTime')}</option>
                            </select>
                        </div>
                         <button 
                            onClick={() => setIsPrinting(true)} 
                            className="flex items-center px-4 py-2 bg-brand-blue text-white font-semibold rounded-md shadow-sm hover:bg-brand-blue-dark transition-colors"
                        >
                            <Download size={16} className="me-2" />
                            {t('downloadPdf')}
                        </button>
                    </div>
                </div>

                <Card title={t('overallPerformance')}>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <PerformanceKpiCard title={t('overallCompliance')} value={performanceData.overallAvg} />
                        <PerformanceKpiCard title={`${t('highRisk')}`} value={performanceData.highRiskAvg} />
                        <PerformanceKpiCard title={`${t('mediumRisk')}`} value={performanceData.mediumRiskAvg} />
                        <PerformanceKpiCard title={`${t('lowRisk')}`} value={performanceData.lowRiskAvg} />
                     </div>
                </Card>

                <div className="space-y-6">
                    {([RiskCategory.High, RiskCategory.Medium, RiskCategory.Low]).map(risk => (
                         <Card key={risk}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-brand-blue-dark dark:text-brand-green">{`${t(risk.toLowerCase() + 'Risk')} - ${t('itemPerformanceAnalysis')}`}</h3>
                                <button onClick={() => setSortAsc(!sortAsc)} className="flex items-center text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <ArrowDownUp size={16} className="me-2"/>
                                    {t('sortByCompliance')}
                                </button>
                            </div>
                            <AnalysisTable items={performanceData.itemAnalysis[risk]} />
                        </Card>
                    ))}
                </div>
            </div>
            {isPrinting && (
                <PrintableMyPerformanceReport 
                    performanceData={performanceData} 
                    inspectorName={user?.name || ''} 
                    period={t(period.replace(/\s/g, ''))} 
                />
            )}
        </>
    );
};

export default MyReportsPage;
