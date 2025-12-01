
import React, { useContext, useMemo, useState, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar } from 'recharts';
import { ArrowUp, ArrowDown, ClipboardList, AlertTriangle, Trophy, CheckCircle, Clock, Lightbulb, FileDown, Star, Users, Calendar, FileText, AlertCircle, Send, Eye, XCircle, ArrowRight } from 'lucide-react';
import { UserRole, CDRStatus, ReportStatus } from '../../types';
import { USERS } from '../../constants';
import { Link, useNavigate } from 'react-router-dom';
import PredictiveHotspotsCard from './PredictiveHotspotsCard';

const ManagerDashboard: React.FC = () => {
    const { reports, cdrs, getFormById, getLocationById, getZoneByLocationId, getInspectorById, theme } = useContext(AppContext);
    const { t, language } = useI18n();
    const navigate = useNavigate();

    const calculateScore = useCallback((report) => {
        const location = getLocationById(report.locationId);
        if (!location) return 0;
        const form = getFormById(location.formId);
        if (!form || form.items.length === 0) return 0;
        const maxScore = form.items.reduce((sum, item) => sum + item.maxScore, 0);
        const actualScore = report.items.reduce((sum, item) => sum + item.score, 0);
        return maxScore > 0 ? (actualScore / maxScore) * 100 : 0;
    }, [getLocationById, getFormById]);

    // NEW: Identify All Critical Reports
    const allCriticalReports = useMemo(() => {
        return reports
            .filter(r => {
                const score = calculateScore(r);
                return score < 75 && r.status !== ReportStatus.Draft;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reports, calculateScore]);

    // Slice for display
    const displayedCriticalReports = useMemo(() => allCriticalReports.slice(0, 3), [allCriticalReports]);

    const dashboardStats = useMemo(() => {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const thisMonthReports = reports.filter(r => new Date(r.date) >= startOfThisMonth);
        const lastMonthReports = reports.filter(r => new Date(r.date) >= startOfLastMonth && new Date(r.date) <= endOfLastMonth);

        const calculateAvgCompliance = (reportSet: any[]) => {
            if (reportSet.length === 0) return 0;
            const totalScore = reportSet.reduce((sum, r) => sum + calculateScore(r), 0);
            return totalScore / reportSet.length;
        };

        const overallCompliance = calculateAvgCompliance(thisMonthReports);
        const prevMonthCompliance = calculateAvgCompliance(lastMonthReports);
        const complianceTrend = overallCompliance - prevMonthCompliance;
        const criticalIssues = thisMonthReports.filter(r => calculateScore(r) < 75).length;
        
        // CDR Stats
        const pendingCDRs = cdrs.filter(c => c.status === CDRStatus.Submitted).length;

        // --- UPDATED INSPECTOR LOGIC (ALL TIME + MONTHLY) ---
        const inspectors = USERS.filter(u => u.role === UserRole.Inspector);
        const inspectorActivity = inspectors.map(inspector => {
            const allInspectorReports = reports.filter(r => r.inspectorId === inspector.id);
            const monthInspectorReports = thisMonthReports.filter(r => r.inspectorId === inspector.id);
            
            const avgScoreAllTime = allInspectorReports.length > 0 
                ? allInspectorReports.reduce((sum, r) => sum + calculateScore(r), 0) / allInspectorReports.length
                : 0;

            const lastActiveDate = allInspectorReports.length > 0 
                ? new Date(Math.max(...allInspectorReports.map(r => new Date(r.date).getTime())))
                : null;

            return { 
                ...inspector, 
                avgScore: avgScoreAllTime, 
                totalReports: allInspectorReports.length,
                monthReports: monthInspectorReports.length,
                lastActive: lastActiveDate
            };
        }).sort((a, b) => b.monthReports - a.monthReports || b.totalReports - a.totalReports); // Sort by activity
        
        const topInspector = inspectorActivity.length > 0 && inspectorActivity[0].monthReports > 0 ? inspectorActivity[0] : null;
        
        // Location Logic
        const locationScores = reports.reduce<Record<string, { scores: number[]; count: number }>>((acc, report) => {
            const locationId = report.locationId;
            if (!acc[locationId]) {
                acc[locationId] = { scores: [], count: 0 };
            }
            acc[locationId].scores.push(calculateScore(report));
            acc[locationId].count++;
            return acc;
        }, {});

        const lowPerformingAreas = Object.entries(locationScores)
            .map(([locationId, data]) => {
                const typedData = data as { scores: number[]; count: number };
                return {
                    locationId,
                    avgScore: typedData.count > 0 ? typedData.scores.reduce((a, b) => a + b, 0) / typedData.count : 0,
                };
            })
            .filter(item => item.avgScore < 85)
            .sort((a, b) => a.avgScore - b.avgScore)
            .slice(0, 5);
        
        let aiInsight1 = `All areas are performing well.`;
        if (lowPerformingAreas.length > 0) {
            const lowestArea = lowPerformingAreas[0];
            const location = getLocationById(lowestArea.locationId);
            const lowestAreaName = location ? location.name[language] : 'N/A';
            const scoreData = locationScores[lowestArea.locationId];
            if (scoreData) {
                 aiInsight1 = `**${lowestAreaName}** recorded ${scoreData.count} low scores this week. Follow-up inspection recommended.`;
            }
        }
        
        let aiInsight2 = `Not enough data to rank inspectors.`;
        if (topInspector) {
            aiInsight2 = `**${topInspector.name}** is leading this month with ${topInspector.monthReports} inspections.`;
        }

        return {
            overallCompliance,
            complianceTrend,
            totalInspections: thisMonthReports.length,
            criticalIssues,
            pendingCDRs,
            topInspector,
            inspectorActivity,
            lowPerformingAreas,
            aiInsights: [aiInsight1, aiInsight2]
        };
    }, [reports, cdrs, calculateScore, getLocationById, language]);

    // Unified Activity Feed (Reports + CDRs)
    const activityFeed = useMemo(() => {
        const reportItems = reports
            .filter(r => r.status !== ReportStatus.Draft)
            .map(r => ({
                type: 'report',
                date: new Date(r.date),
                item: r,
                id: r.id
            }));
        
        const cdrItems = cdrs
            .filter(c => c.status !== CDRStatus.Draft)
            .map(c => ({
                type: 'cdr',
                date: new Date(`${c.date}T${c.time}`),
                item: c,
                id: c.id
            }));

        return [...reportItems, ...cdrItems]
            .sort((a, b) => {
                const dateA = a.date.getTime();
                const dateB = b.date.getTime();
                if (isNaN(dateA)) return 1;
                if (isNaN(dateB)) return -1;
                return dateB - dateA;
            })
            .slice(0, 20);
    }, [reports, cdrs]);

    const performanceData = useMemo(() => {
        const dataMap = new Map<string, { scores: number[], count: number }>();
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dataMap.has(dateString)) {
                dataMap.set(dateString, { scores: [], count: 0 });
            }
        }
        
        reports.forEach(r => {
            const dateString = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (dataMap.has(dateString)) {
                const entry = dataMap.get(dateString)!;
                entry.scores.push(calculateScore(r));
                entry.count++;
            }
        });

        const chartData = Array.from(dataMap.entries()).map(([date, { scores, count }]) => ({
            date,
            score: count > 0 ? scores.reduce((a, b) => a + b, 0) / count : null,
        }));
        
        const lastScore = chartData.filter(d => d.score !== null).pop()?.score || dashboardStats.overallCompliance;
        const forecastData = chartData.slice(-7).map((d, i) => ({...d, predicted: lastScore * (1 + (Math.random() - 0.45) * 0.05)}));
        
        return chartData.map(d => {
            const forecast = forecastData.find(f => f.date === d.date);
            return forecast ? { ...d, predicted: forecast.predicted } : d;
        });

    }, [reports, calculateScore, dashboardStats.overallCompliance]);

    const getComplianceColor = (score: number) => score >= 85 ? 'text-green-500' : score >= 70 ? 'text-yellow-500' : 'text-red-500';
    
    const KpiCard = ({ title, value, subValue, icon, trend, trendText, colorClass }: {title: string, value: string | number, subValue?: string | null, icon: React.ReactNode, trend?: number | null, trendText?: string | null, colorClass?: string}) => (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm" title={title}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
                    <p className={`text-3xl font-bold ${colorClass ? colorClass : (typeof value === 'string' && value.includes('%') ? getComplianceColor(parseFloat(value)) : 'text-gray-900 dark:text-white')}`}>{value}</p>
                    {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
                </div>
                {icon}
            </div>
            {trendText && typeof trend === 'number' && (
                <div className={`flex items-center text-xs mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend >= 0 ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                    <span>{trend.toFixed(1)}% {trendText}</span>
                </div>
            )}
        </div>
    );
    
    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const tooltipStyle = theme === 'dark' ? { backgroundColor: '#1f2937', border: '1px solid #4b5563' } : { backgroundColor: '#ffffff', border: '1px solid #e5e7eb' };

    const handleSendWarning = (inspectorName: string, locationName: string) => {
        alert(`Warning notification sent to ${inspectorName} regarding low performance at ${locationName}.`);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-gray-200">{t('dashboard')}</h1>
                     <button className="flex items-center px-4 py-2 bg-brand-teal text-white font-semibold rounded-md shadow-sm hover:bg-brand-blue-dark transition-colors">
                        <FileDown size={16} className="me-2" />{t('downloadMonthlyReport')}
                    </button>
                </div>

                {/* ======================= CRITICAL ACTION CENTER ======================= */}
                {displayedCriticalReports.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="flex items-center text-lg font-bold text-red-700 dark:text-red-400">
                                <AlertTriangle size={24} className="me-2" />
                                {t('criticalIssues')} - Action Required ({allCriticalReports.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayedCriticalReports.map(report => {
                                const score = calculateScore(report);
                                const location = getLocationById(report.locationId);
                                const inspector = getInspectorById(report.inspectorId);
                                return (
                                    <div key={report.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-red-200 dark:border-red-900">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{location?.name[language]}</h4>
                                                <p className="text-xs text-gray-500">{new Date(report.date).toLocaleDateString()} • {inspector?.name}</p>
                                            </div>
                                            <span className="text-xl font-bold text-red-600">{score.toFixed(1)}%</span>
                                        </div>
                                        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded mb-3">
                                            {report.items.filter(i => i.score < 3).length} failed items detected.
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/report/${report.id}`)}
                                                className="flex-1 flex items-center justify-center px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                                            >
                                                <Eye size={12} className="me-1"/> View
                                            </button>
                                            <button 
                                                onClick={() => handleSendWarning(inspector?.name || '', location?.name[language] || '')}
                                                className="flex-1 flex items-center justify-center px-2 py-1.5 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded"
                                            >
                                                <Send size={12} className="me-1"/> Warn
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {allCriticalReports.length > 3 && (
                            <div className="mt-4 text-center">
                                <Link to="/critical-issues" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                    {t('viewAll')} ({allCriticalReports.length}) <ArrowRight size={16} className="ms-1"/>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                {/* ====================================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title={t('overallCompliance')} value={`${dashboardStats.overallCompliance.toFixed(1)}%`} icon={<CheckCircle size={24} className="text-gray-400" />} trend={dashboardStats.complianceTrend} trendText={t('vsLastMonth')} />
                    <KpiCard title={t('totalInspections')} value={dashboardStats.totalInspections} subValue={t('acrossAllDepts')} icon={<ClipboardList size={24} className="text-gray-400" />} />
                    <KpiCard title="Pending CDRs" value={dashboardStats.pendingCDRs} subValue="Waiting Approval" icon={<FileText size={24} className="text-orange-400" />} colorClass="text-orange-500" />
                    <KpiCard 
                        title={t('topInspector')} 
                        value={dashboardStats.topInspector ? dashboardStats.topInspector.name.split(' ')[0] : 'N/A'} 
                        subValue={dashboardStats.topInspector ? `${t('leading')}: ${dashboardStats.topInspector.monthReports} reports` : 'No data'} 
                        icon={<Trophy size={24} className="text-gray-400" />} 
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                    <h3 className="font-bold text-brand-blue-dark dark:text-brand-green mb-4">{t('performanceTrend')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e0e0e0'} />
                            <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 12 }} />
                            <YAxis tick={{ fill: tickColor, fontSize: 12 }} unit="%" domain={[60, 100]} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ color: tickColor }} />
                            <Line type="monotone" dataKey="score" name={t('score')} stroke="#0a9396" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }}/>
                            <Line type="monotone" dataKey="predicted" name={t('predicted')} stroke="#ca6702" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                         <h3 className="font-bold text-brand-blue-dark dark:text-brand-green mb-4 flex items-center"><Lightbulb size={20} className="me-2 text-yellow-500" />{t('aiInsights')}</h3>
                         <ul className="space-y-3">
                             {dashboardStats.aiInsights.map((insight, i) => (
                                 <li key={i} className="flex items-start space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                     <Star size={18} className="text-brand-teal mt-1 flex-shrink-0" />
                                     <p className="text-sm text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-blue-dark dark:text-brand-green">$1</strong>') }} />
                                 </li>
                             ))}
                         </ul>
                    </div>
                     <PredictiveHotspotsCard />
                </div>
                
                {/* NEW INSPECTOR ACTIVITY TABLE */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                    <h3 className="font-bold text-brand-blue-dark dark:text-brand-green mb-4 flex items-center">
                        <Users size={20} className="me-2" /> Inspector Activity Overview
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3">Inspector</th>
                                    <th className="px-4 py-3 text-center">Total Reports (All Time)</th>
                                    <th className="px-4 py-3 text-center">Reports (This Month)</th>
                                    <th className="px-4 py-3 text-center">Avg Score</th>
                                    <th className="px-4 py-3 text-right">Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardStats.inspectorActivity.map(inspector => (
                                    <tr key={inspector.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                                            {inspector.name}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                                            {inspector.totalReports}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${inspector.monthReports > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                                                {inspector.monthReports}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-bold ${getComplianceColor(inspector.avgScore)}`}>
                                                {inspector.avgScore.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs text-gray-500">
                                            {inspector.lastActive ? inspector.lastActive.toLocaleDateString() : 'Never'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="xl:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                    <h3 className="font-bold text-brand-blue-dark dark:text-brand-green mb-4 flex items-center">
                        {t('liveActivityFeed')}
                        <span className="ms-2 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                    </h3>
                    <ul className="space-y-4 h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                        {activityFeed.map(activity => {
                            // RENDER REPORT
                            if (activity.type === 'report') {
                                const report = activity.item as any;
                                const score = calculateScore(report);
                                const isCritical = score < 75;
                                const inspector = getInspectorById(report.inspectorId);
                                const location = getLocationById(report.locationId);
                                return (
                                    <li key={`report-${report.id}`} className="flex items-start space-x-3 rtl:space-x-reverse border-b dark:border-gray-700 pb-3 last:border-0">
                                        <div className={`mt-1 p-1.5 rounded-full ${isCritical ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                                            {isCritical ? 
                                                <AlertTriangle size={14} className="text-red-600 dark:text-red-400" /> : 
                                                <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {isCritical ? 
                                                    <><span className="font-semibold text-red-600 dark:text-red-400">Critical Low Score</span> detected at </> : 
                                                    <><span className="font-semibold text-gray-900 dark:text-white">{inspector?.name || 'Unknown'}</span> completed inspection at </>
                                                }
                                                <Link to={`/report/${report.id}`} className="font-semibold text-brand-blue hover:underline">{location?.name[language] || 'Unknown'}</Link>
                                                {isCritical ? ` (` : ` with score `}
                                                <span className={`font-bold ${getComplianceColor(score)}`}>{score.toFixed(1)}%</span>
                                                {isCritical ? `).` : `.`}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Inspection Report • {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </li>
                                );
                            } else {
                                // RENDER CDR
                                const cdr = activity.item as any;
                                const location = getLocationById(cdr.locationId);
                                const inspector = getInspectorById(cdr.employeeId);
                                return (
                                     <li key={`cdr-${cdr.id}`} className="flex items-start space-x-3 rtl:space-x-reverse border-b dark:border-gray-700 pb-3 last:border-0 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded">
                                        <div className="mt-1 p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/20">
                                            <AlertCircle size={14} className="text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                <span className="font-bold text-orange-600 dark:text-orange-400">New CDR Submitted</span> by <span className="font-semibold">{inspector?.name || 'Unknown'}</span> at <Link to={`/cdr/${cdr.id}`} className="font-semibold text-brand-blue hover:underline">{location?.name[language] || 'Unknown'}</Link>.
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 italic">"{cdr.incidentType}"</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-gray-400">{activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <Link to={`/cdr/${cdr.id}`} className="text-xs font-bold text-brand-blue hover:underline">Review &gt;</Link>
                                            </div>
                                        </div>
                                    </li>
                                );
                            }
                        })}
                        {activityFeed.length === 0 && <p className="text-center text-gray-500 py-4">No recent activity.</p>}
                    </ul>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                         <h3 className="font-bold text-brand-blue-dark dark:text-brand-green mb-4">{t('lowPerformingAreas')}</h3>
                         <ul className="space-y-3">
                            {dashboardStats.lowPerformingAreas.map(({locationId, avgScore}) => {
                                const location = getLocationById(locationId);
                                const zone = getZoneByLocationId(locationId);
                                return(
                                <li key={locationId} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{location?.name[language]}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{zone?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-bold text-lg ${getComplianceColor(avgScore)}`}>{avgScore.toFixed(1)}%</span>
                                        <p className="text-xs text-red-500 font-semibold">{t('needsAttention')}</p>
                                    </div>
                                </li>
                                );
                            })}
                         </ul>
                    </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
