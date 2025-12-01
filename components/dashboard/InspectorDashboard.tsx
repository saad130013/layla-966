
import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ClipboardList, Map, BarChart2, MessageSquare, ChevronRight, FileWarning } from 'lucide-react';
import { RiskCategory } from '../../types';

const InspectorDashboard: React.FC = () => {
    const { user, reports, cdrs, getLocationById, getZoneByLocationId, getFormById, theme } = useContext(AppContext);
    const { t, language } = useI18n();

    const [period, setPeriod] = useState('Last 7 Days');

    const calculateScore = (report: any) => {
        const location = getLocationById(report.locationId);
        if (!location) return 0;
        const form = getFormById(location.formId);
        if (!form) return 0;
        const maxScore = form.items.reduce((sum, item) => sum + item.maxScore, 0);
        const actualScore = report.items.reduce((sum, item) => sum + item.score, 0);
        return maxScore > 0 ? (actualScore / maxScore) * 100 : 0;
    };

    // 1. ALL TIME DATA (For Main KPI Counters to match List Pages)
    const myAllTimeReports = useMemo(() => reports.filter(r => r.inspectorId === user?.id), [reports, user]);
    const myAllTimeCDRs = useMemo(() => cdrs.filter(c => c.employeeId === user?.id), [cdrs, user]);

    // 2. FILTERED DATA (For Charts only)
    const filteredReports = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'Today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'Last 7 Days':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'Last Month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'Last 3 Months':
                startDate.setMonth(now.getMonth() - 3);
                break;
            default:
                 startDate.setDate(now.getDate() - 7);
        }

        return myAllTimeReports
            .filter(r => new Date(r.date) >= startDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [myAllTimeReports, period]);
    
    // KPI Data - Using ALL TIME stats to ensure consistency with "My Reports" and "CDR List"
    const kpiData = useMemo(() => {
        const totalReports = myAllTimeReports.length;
        const totalViolations = myAllTimeCDRs.length;
        const visitedZones = new Set(myAllTimeReports.map(r => getZoneByLocationId(r.locationId)?.id)).size;
        
        const totalScore = myAllTimeReports.reduce((acc, report) => acc + calculateScore(report), 0);
        const averageScore = totalReports > 0 ? (totalScore / totalReports).toFixed(1) : 0;
        
        return { totalReports, totalViolations, visitedZones, averageScore };
    }, [myAllTimeReports, myAllTimeCDRs, getZoneByLocationId]);

    const chartData = useMemo(() => {
        return filteredReports.map(report => ({
            date: new Date(report.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: calculateScore(report).toFixed(1)
        }));
    }, [filteredReports]);
    
    const riskDistribution = useMemo(() => {
        // Use filtered reports for risk distribution to show current focus
        const counts = { [RiskCategory.High]: 0, [RiskCategory.Medium]: 0, [RiskCategory.Low]: 0 };
        filteredReports.forEach(report => {
            const zone = getZoneByLocationId(report.locationId);
            if(zone) counts[zone.riskCategory]++;
        });
        return [
            { name: t('highRisk'), value: counts[RiskCategory.High] },
            { name: t('mediumRisk'), value: counts[RiskCategory.Medium] },
            { name: t('lowRisk'), value: counts[RiskCategory.Low] },
        ].filter(item => item.value > 0);
    }, [filteredReports, getZoneByLocationId, t]);

    const supervisorFeedback = reports
        .filter(r => r.inspectorId === user?.id && r.supervisorComment)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
        
    const getScoreColor = (score) => {
      if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      if (score >= 75) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
    };

    const KpiCard = ({ title, value, icon, unit = '', subtext = '' }) => (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm flex items-center space-x-4 rtl:space-x-reverse">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full flex-shrink-0">{icon}</div>
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-brand-blue-dark dark:text-gray-100">{value}{unit}</p>
                {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
            </div>
        </div>
    );
    
    const COLORS = ['#ee9b00', '#ca6702', '#94d2bd'];
    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const tooltipStyle = theme === 'dark' ? { backgroundColor: '#1f2937', border: '1px solid #4b5563' } : { backgroundColor: '#ffffff', border: '1px solid #e5e7eb' };


    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-gray-200">{t('welcome')}, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('personalDashboard')}</p>
                </div>
                <div>
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-teal focus:border-brand-teal bg-white dark:bg-gray-700">
                        <option>{t('today')}</option>
                        <option>{t('last7Days')}</option>
                        <option>{t('lastMonth')}</option>
                        <option>{t('last3Months')}</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title={t('totalReports')} value={kpiData.totalReports} icon={<ClipboardList className="text-brand-blue"/>} subtext={t('allTime')} />
                <KpiCard title={t('totalViolations')} value={kpiData.totalViolations} icon={<FileWarning className="text-red-600"/>} subtext={t('allTime')} />
                <KpiCard title={t('visitedZones')} value={kpiData.visitedZones} icon={<Map className="text-brand-teal"/>} subtext={t('allTime')} />
                <KpiCard title={t('averageScore')} value={kpiData.averageScore} unit="%" icon={<BarChart2 className="text-brand-orange"/>} subtext={t('allTime')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                    <h3 className="font-bold text-brand-blue-dark dark:text-brand-green mb-4">{t('performanceTrend')} ({period})</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e0e0e0'} />
                            <XAxis dataKey="date" tick={{ fill: tickColor }} />
                            <YAxis tick={{ fill: tickColor }} unit="%" domain={[0, 100]} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="score" stroke="#0a9396" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                    <h3 className="font-bold text-brand-blue-dark dark:text-brand-green mb-4">{t('riskCategoryDistribution')} ({period})</h3>
                    <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                            <Pie data={riskDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {riskDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ color: tickColor }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                     <h3 className="font-bold text-brand-blue-dark dark:text-brand-green mb-4">{t('reportHistory')}</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2">{t('date')}</th>
                                    <th className="px-4 py-2">{t('zone')}</th>
                                    <th className="px-4 py-2">{t('zoneType')}</th>
                                    <th className="px-4 py-2">{t('score')}</th>
                                    <th className="px-4 py-2">{t('view')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.slice().reverse().slice(0, 5).map(report => {
                                    const location = getLocationById(report.locationId);
                                    const zone = getZoneByLocationId(report.locationId);
                                    const score = calculateScore(report).toFixed(1);
                                    return (
                                        <tr key={report.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-3">{new Date(report.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{location?.name[language]}</td>
                                            <td className="px-4 py-3">{zone ? t(zone.riskCategory.toLowerCase() + 'Risk') : '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full font-semibold ${getScoreColor(score)}`}>
                                                    {score}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link to={`/report/${report.id}`} className="text-brand-blue hover:underline font-semibold">{t('view')}</Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                     </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                    <h3 className="font-bold text-brand-blue-dark dark:text-brand-green mb-4">{t('supervisorFeedback')}</h3>
                     {supervisorFeedback.length > 0 ? (
                        <ul className="space-y-4">
                            {supervisorFeedback.map(report => (
                                <li key={report.id} className="border-b dark:border-gray-700 pb-4 last:border-b-0">
                                    <Link to={`/report/${report.id}`} className="group">
                                        <div className="flex items-start space-x-3 rtl:space-x-reverse">
                                            <MessageSquare className="text-yellow-600 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-brand-blue">
                                                    {getLocationById(report.locationId)?.name[language]}
                                                    <span className="text-xs text-gray-400 ms-2">{new Date(report.date).toLocaleDateString()}</span>
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">"{report.supervisorComment}"</p>
                                            </div>
                                            <ChevronRight className="text-gray-400 ms-auto group-hover:text-brand-blue flex-shrink-0"/>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">{t('noFeedback')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InspectorDashboard;
