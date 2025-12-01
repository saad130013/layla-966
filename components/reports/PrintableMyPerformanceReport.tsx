import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import { Hospital } from 'lucide-react';
import { RiskCategory } from '../../types';
import type { PerformanceData, ItemStat } from '../../pages/MyReportsPage';

interface PrintableMyPerformanceReportProps {
  performanceData: PerformanceData;
  inspectorName: string;
  period: string;
}

const PrintableMyPerformanceReport: React.FC<PrintableMyPerformanceReportProps> = ({ performanceData, inspectorName, period }) => {
    const { t } = useI18n();

    const KpiCard: React.FC<{ title: string; value: number }> = ({ title, value }) => (
        <div className="kpi-card-print">
            <p className="kpi-title">{title}</p>
            <p className="kpi-value text-brand-blue">{value > 0 ? `${value.toFixed(1)}%` : 'N/A'}</p>
        </div>
    );

     const AnalysisTable: React.FC<{items: ItemStat[]}> = ({items}) => {
        if (items.length === 0) {
            return <p className="text-center text-gray-500 py-4">No data available for this period.</p>;
        }
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse', border: '1px solid #eee' }}>
                    <thead className="text-xs text-gray-500 uppercase">
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                            <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #eee' }}>{t('evaluationItem')}</th>
                            <th style={{ textAlign: 'center', padding: '8px', border: '1px solid #eee' }}>{t('timesInspected')}</th>
                            <th style={{ textAlign: 'center', padding: '8px', border: '1px solid #eee' }}>{t('averageScore')}</th>
                            <th style={{ textAlign: 'center', padding: '8px', border: '1px solid #eee' }}>{t('avgCompliance')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px', border: '1px solid #eee', fontWeight: '500' }}>{t(item.name)}</td>
                                <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>{item.timesInspected}</td>
                                <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>{item.avgScore.toFixed(1)} / {item.maxScore}</td>
                                <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center', fontWeight: 'bold' }}>{item.avgCompliance.toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="hidden print-block p-4 inspector-report-view">
            <header className="print-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #005f73', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Hospital size={32} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0.5rem' }}>InspectionSys</h1>
                </div>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'right', margin: 0 }}>{t('myPerformanceReportTitle')}</h2>
                    <p style={{ fontSize: '0.875rem', textAlign: 'right', color: '#6b7280' }}>{inspectorName}</p>
                    <p style={{ fontSize: '0.875rem', textAlign: 'right', color: '#6b7280' }}>{t('period')}: {period}</p>
                </div>
            </header>

            <main className="mt-8">
                <h3 className="print-section-title">{t('overallPerformance')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <KpiCard title={t('overallCompliance')} value={performanceData.overallAvg} />
                    <KpiCard title={`${t('highRisk')}`} value={performanceData.highRiskAvg} />
                    <KpiCard title={`${t('mediumRisk')}`} value={performanceData.mediumRiskAvg} />
                    <KpiCard title={`${t('lowRisk')}`} value={performanceData.lowRiskAvg} />
                </div>

                <div className="space-y-6">
                    {([RiskCategory.High, RiskCategory.Medium, RiskCategory.Low]).map(risk => (
                         <div key={risk} style={{ pageBreakInside: 'avoid' }}>
                            <h3 className="print-section-title">{`${t(risk.toLowerCase() + 'Risk')} - ${t('itemPerformanceAnalysis')}`}</h3>
                            <AnalysisTable items={performanceData.itemAnalysis[risk]} />
                        </div>
                    ))}
                </div>
            </main>

            <footer className="print-footer" style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ccc', fontSize: '0.75rem', color: '#6b7280' }}>
                <p>{t('generatedReportNotice')}</p>
                 <p>Printed on: {new Date().toLocaleString()}</p>
            </footer>
        </div>
    );
};

export default PrintableMyPerformanceReport;
