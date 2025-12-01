import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { Hospital, ClipboardList, BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RiskCategory, InspectionReport } from '../../types';
import { USERS } from '../../constants';

interface PrintableInspectorReportProps {
  inspectorId: string;
  from: string;
  to: string;
}

const PrintableInspectorReport: React.FC<PrintableInspectorReportProps> = ({ inspectorId, from, to }) => {
    const { reports, getFormById, getLocationById, getZoneByLocationId } = useContext(AppContext);
    const { t } = useI18n();

    const inspector = USERS.find(u => u.id === inspectorId);

    const calculateScore = (report: InspectionReport) => {
        const location = getLocationById(report.locationId);
        if (!location) return 0;
        const form = getFormById(location.formId);
        if (!form || form.items.length === 0) return 0;
        const maxScore = form.items.reduce((sum, item) => sum + item.maxScore, 0);
        const actualScore = report.items.reduce((sum, item) => sum + item.score, 0);
        return maxScore > 0 ? (actualScore / maxScore) * 100 : 0;
    };
    
    const kpiData = useMemo(() => {
        const dateFrom = new Date(from);
        const dateTo = new Date(to);
        dateFrom.setHours(0, 0, 0, 0);
        dateTo.setHours(23, 59, 59, 999);

        const filteredReports = reports.filter(r => 
            r.inspectorId === inspectorId &&
            new Date(r.date) >= dateFrom &&
            new Date(r.date) <= dateTo
        );

        const calculateAvgScore = (reportSet: InspectionReport[]) => {
            if (reportSet.length === 0) return 0;
            const totalScore = reportSet.reduce((sum, r) => sum + calculateScore(r), 0);
            return totalScore / reportSet.length;
        };

        const highRiskReports = filteredReports.filter(r => getZoneByLocationId(r.locationId)?.riskCategory === RiskCategory.High);
        const mediumRiskReports = filteredReports.filter(r => getZoneByLocationId(r.locationId)?.riskCategory === RiskCategory.Medium);
        const lowRiskReports = filteredReports.filter(r => getZoneByLocationId(r.locationId)?.riskCategory === RiskCategory.Low);

        return {
            totalInspections: filteredReports.length,
            avgOverallScore: calculateAvgScore(filteredReports),
            avgScoreHighRisk: calculateAvgScore(highRiskReports),
            avgScoreMediumRisk: calculateAvgScore(mediumRiskReports),
            avgScoreLowRisk: calculateAvgScore(lowRiskReports),
        };
    }, [inspectorId, from, to, reports]);

    const getScoreColor = (score: number) => {
        if (score > 90) return 'text-green-600';
        if (score >= 80) return 'text-yellow-500';
        return 'text-red-600';
    };

    const KpiCard = ({ title, value }: { title: string, value: number }) => (
        <div className="kpi-card-print">
            <p className="kpi-title">{title}</p>
            <p className={`kpi-value ${getScoreColor(value)}`}>{value > 0 ? `${value.toFixed(1)}%` : 'N/A'}</p>
        </div>
    );
     const TotalCard = ({ title, value }: { title: string, value: number }) => (
        <div className="kpi-card-print">
            <p className="kpi-title">{title}</p>
            <p className="kpi-value text-brand-blue">{value}</p>
        </div>
    );

    return (
        <div className="hidden print-block p-4 inspector-report-view">
            <header className="print-header">
                <div className="flex items-center">
                    <Hospital size={32} />
                    <h1 className="text-xl font-bold mx-2">InspectionSys</h1>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{t('inspectorPerformanceReport')}</h2>
                    <p className="text-sm text-right text-gray-500">{inspector?.name}</p>
                    <p className="text-sm text-right text-gray-500">{new Date(from).toLocaleDateString()} - {new Date(to).toLocaleDateString()}</p>
                </div>
            </header>

            <main className="mt-8">
                 <div className="grid grid-cols-5 gap-4">
                    <TotalCard title={t('totalInspections')} value={kpiData.totalInspections} />
                    <KpiCard title={t('avgOverallScore')} value={kpiData.avgOverallScore} />
                    <KpiCard title={t('avgScoreHighRisk')} value={kpiData.avgScoreHighRisk} />
                    <KpiCard title={t('avgScoreMediumRisk')} value={kpiData.avgScoreMediumRisk} />
                    <KpiCard title={t('avgScoreLowRisk')} value={kpiData.avgScoreLowRisk} />
                 </div>
            </main>

            <footer className="print-footer">
                <p>{t('generatedReportNotice')}</p>
            </footer>
        </div>
    );
};

export default PrintableInspectorReport;