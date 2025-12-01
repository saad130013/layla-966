import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { RiskCategory } from '../types';
import { ArrowDownUp } from 'lucide-react';

// Type for aggregated item stats
interface ItemStat {
  id: string;
  name: string;
  timesInspected: number;
  avgScore: number;
  avgCompliance: number;
  maxScore: number;
}

const InspectorAveragesPage: React.FC = () => {
    const { reports, getFormById, getLocationById, getZoneByLocationId, forms } = useContext(AppContext);
    const { t } = useI18n();
    const [period, setPeriod] = useState('Last Month');
    const [sortAsc, setSortAsc] = useState(true);

    const calculateCompliance = (report: any) => {
        const location = getLocationById(report.locationId);
        if (!location) return 0;
        const form = getFormById(location.formId);
        if (!form) return 0;
        const maxScore = form.items.reduce((sum, item) => sum + item.maxScore, 0);
        const actualScore = report.items.reduce((sum, item) => sum + item.score, 0);
        return maxScore > 0 ? (actualScore / maxScore) * 100 : 0;
    };

    const performanceData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'Last 7 Days': startDate.setDate(now.getDate() - 7); break;
            case 'Last Month': startDate.setMonth(now.getMonth() - 1); break;
            case 'Last 3 Months': startDate.setMonth(now.getMonth() - 3); break;
            case 'All Time': startDate = new Date(0); break;
            default: startDate.setMonth(now.getMonth() - 1);
        }

        const filteredReports = reports.filter(r => new Date(r.date) >= startDate);

        const riskCategories: RiskCategory[] = [RiskCategory.High, RiskCategory.Medium, RiskCategory.Low];
        const avgScoresByRisk = riskCategories.reduce((acc, risk) => {
            const riskReports = filteredReports.filter(r => getZoneByLocationId(r.locationId)?.riskCategory === risk);
            const totalCompliance = riskReports.reduce((sum, r) => sum + calculateCompliance(r), 0);
            acc[risk] = riskReports.length > 0 ? totalCompliance / riskReports.length : 0;
            return acc;
        }, {} as Record<RiskCategory, number>);
        
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

        Object.values(itemAnalysisByRisk).forEach(itemList => {
            itemList.sort((a, b) => sortAsc ? a.avgCompliance - b.avgCompliance : b.avgCompliance - a.avgCompliance);
        });

        return {
            avgScoresByRisk,
            itemAnalysis: itemAnalysisByRisk
        };

    }, [reports, period, sortAsc, getZoneByLocationId, getLocationById, getFormById, forms]);

    const PerformanceKpiCard: React.FC<{ title: string; value: number }> = ({ title, value }) => (
        <Card className="text-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-4xl font-bold text-brand-blue-dark dark:text-gray-100 mt-2">
                {value.toFixed(1)}<span className="text-2xl">%</span>
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
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-gray-200">{t('inspectorAveragesAnalysis')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('systemWideItemPerformance')}</p>
                </div>
                <div>
                    <label className="text-sm me-2">{t('filterByPeriod')}:</label>
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-teal focus:border-brand-teal bg-white dark:bg-gray-700">
                        <option>{t('last7Days')}</option>
                        <option>{t('lastMonth')}</option>
                        <option>{t('last3Months')}</option>
                        <option>{t('allTime')}</option>
                    </select>
                </div>
            </div>

            <Card title={t('overallAvgCompliance')}>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <PerformanceKpiCard title={`${t('highRisk')}`} value={performanceData.avgScoresByRisk[RiskCategory.High]} />
                    <PerformanceKpiCard title={`${t('mediumRisk')}`} value={performanceData.avgScoresByRisk[RiskCategory.Medium]} />
                    <PerformanceKpiCard title={`${t('lowRisk')}`} value={performanceData.avgScoresByRisk[RiskCategory.Low]} />
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
    );
};

export default InspectorAveragesPage;