
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Hospital } from 'lucide-react';
import { CDR, CDRIncidentType } from '../../types';

interface PrintableReportProps {
  type: 'weekly' | 'monthly';
}

const PrintableReport: React.FC<PrintableReportProps> = ({ type }) => {
    const { cdrs, getLocationById } = useContext(AppContext);
    const { t, language } = useI18n();

    const data = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        if (type === 'weekly') {
            startDate.setDate(now.getDate() - 7);
        } else { // monthly
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        const relevantCDRs = cdrs.filter(cdr => new Date(cdr.date) >= startDate);

        const totalCDRs = relevantCDRs.length;
        
        const breakdownByType = relevantCDRs.reduce((acc: Record<CDRIncidentType, number>, cdr) => {
            acc[cdr.incidentType] = (acc[cdr.incidentType] || 0) + 1;
            return acc;
        }, {} as Record<CDRIncidentType, number>);

        const allDiscrepancies = relevantCDRs.flatMap(cdr => [
            ...cdr.manpowerDiscrepancy, 
            ...cdr.materialDiscrepancy, 
            ...cdr.equipmentDiscrepancy
        ]);
        const commonDiscrepancies = allDiscrepancies.reduce((acc: Record<string, number>, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topDiscrepancies = (Object.entries(commonDiscrepancies) as [string, number][])
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);
            
        const topDepartments = relevantCDRs.reduce((acc: Record<string, number>, cdr) => {
            const locationName = getLocationById(cdr.locationId)?.name[language] || 'Unknown';
            acc[locationName] = (acc[locationName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const topDepartmentsChartData = (Object.entries(topDepartments) as [string, number][])
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));
            
        return {
            title: type === 'weekly' ? t('weeklySummaryReport') : t('monthlyKpiReport'),
            dateRange: `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`,
            totalCDRs,
            breakdownByType,
            topDiscrepancies,
            topDepartmentsChartData,
        };
    }, [type, cdrs, t, getLocationById, language]);

    const KpiCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
        <div className="border border-gray-600 p-4 text-center">
            <p className="text-xs uppercase text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
    
    const COLORS = ['#005f73', '#0a9396', '#94d2bd', '#ee9b00', '#ca6702'];

    return (
        <div className="hidden print-block p-4">
            <header className="print-header">
                <div className="flex items-center">
                    <Hospital size={32} />
                    <h1 className="text-xl font-bold mx-2">CDR System</h1>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{data.title}</h2>
                    <p className="text-sm text-right text-gray-500">{data.dateRange}</p>
                </div>
            </header>
            
            <main>
                <section className="grid grid-cols-4 gap-4 mb-6">
                    <KpiCard title={t('totalCDRs')} value={data.totalCDRs} />
                    {(Object.entries(data.breakdownByType) as [string, number][]).map(([type, value]) => (
                         <KpiCard key={type} title={t(type)} value={value} />
                    ))}
                </section>
                
                <section className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="print-section-title">{t('topDepartments')}</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.topDepartmentsChartData} layout="vertical" margin={{ left: 50 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} />
                                <Bar dataKey="value" barSize={20} label={{ position: 'right', fill: '#000' }}>
                                   {data.topDepartmentsChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                     <div>
                        <h3 className="print-section-title">{t('commonDiscrepancies')}</h3>
                         <ul className="list-disc pl-5">
                            {data.topDiscrepancies.map(([name, value]) => (
                                <li key={name} className="mb-2">
                                    <span className="font-semibold">{name}</span>
                                    <span className="text-gray-500"> ({value} occurrences)</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </main>

            <footer className="print-footer">
                <p>{t('generatedReportNotice')}</p>
            </footer>
        </div>
    );
};

export default PrintableReport;
