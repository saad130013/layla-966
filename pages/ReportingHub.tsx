import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { AppContext } from '../context/AppContext';
import { USERS } from '../constants';
import { UserRole, RiskCategory } from '../types';
import { FileDown, Filter, PieChart, Printer } from 'lucide-react';
import PrintableReport from '../components/reports/PrintableReport';
import PrintableInspectorReport from '../components/reports/PrintableInspectorReport';
import PrintableReportList from '../components/reports/PrintableReportList';

type ReportType = 'weekly' | 'monthly' | null;

const ReportingHub: React.FC = () => {
    const { reports, getInspectorById, getLocationById, getZoneByLocationId } = useContext(AppContext);
    const { t, language } = useI18n();

    // State for the list of reports
    const [filters, setFilters] = useState({
        ref: '',
        inspectorId: '',
        risk: '',
        dateFrom: '',
        dateTo: ''
    });

    // State for generating reports
    const [generatingSummaryReport, setGeneratingSummaryReport] = useState<ReportType>(null);
    const [selectedInspector, setSelectedInspector] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [generatingInspectorReport, setGeneratingInspectorReport] = useState(false);
    const [generatingListReport, setGeneratingListReport] = useState(false);

    const inspectors = USERS.filter(u => u.role === UserRole.Inspector);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const zone = getZoneByLocationId(report.locationId);
            const reportDate = new Date(report.date);
            const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
            if(dateFrom) dateFrom.setHours(0,0,0,0);
            if(dateTo) dateTo.setHours(23,59,59,999);

            return (
                (!filters.ref || report.referenceNumber.toLowerCase().includes(filters.ref.toLowerCase())) &&
                (!filters.inspectorId || report.inspectorId === filters.inspectorId) &&
                (!filters.risk || (zone && zone.riskCategory === filters.risk)) &&
                (!dateFrom || reportDate >= dateFrom) &&
                (!dateTo || reportDate <= dateTo)
            );
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reports, filters, getZoneByLocationId]);

    // Printing logic
    useEffect(() => {
        const isPrinting = generatingSummaryReport !== null || generatingInspectorReport || generatingListReport;
        
        if (!isPrinting) return;

        const handleAfterPrint = () => {
            setGeneratingSummaryReport(null);
            setGeneratingInspectorReport(false);
            setGeneratingListReport(false);
            window.removeEventListener('afterprint', handleAfterPrint);
        };

        window.addEventListener('afterprint', handleAfterPrint);
        
        const timer = setTimeout(() => window.print(), 100);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [generatingSummaryReport, generatingInspectorReport, generatingListReport]);

    const handleGenerateInspectorReport = () => {
        if (!selectedInspector || !dateFrom || !dateTo) {
            alert('Please select an inspector and a date range.');
            return;
        }
        setGeneratingInspectorReport(true);
    };

    const formElementClasses = "w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-brand-teal focus:border-brand-teal";

    return (
        <div className="space-y-6">
            <div>
                 <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-gray-200">{t('reportingHub')}</h1>
                 <p className="text-gray-500 dark:text-gray-400">View all reports and generate summaries.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Report List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-brand-blue-dark dark:text-brand-green">{t('allReports')}</h2>
                            <button 
                                onClick={() => setGeneratingListReport(true)}
                                className="flex items-center px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                <Printer size={14} className="me-2" />
                                {t('exportToPdf')}
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
                            <h3 className="font-semibold mb-2 flex items-center"><Filter size={16} className="me-2"/> {t('filter')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <input type="text" name="ref" placeholder={t('referenceNumber')} value={filters.ref} onChange={handleFilterChange} className={formElementClasses} />
                                <select name="inspectorId" value={filters.inspectorId} onChange={handleFilterChange} className={formElementClasses}>
                                    <option value="">All Inspectors</option>
                                    {inspectors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                                <select name="risk" value={filters.risk} onChange={handleFilterChange} className={formElementClasses}>
                                    <option value="">All Risk Levels</option>
                                    {Object.values(RiskCategory).map(rc => <option key={rc} value={rc}>{t(rc.toLowerCase() + 'Risk')}</option>)}
                                </select>
                                <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className={formElementClasses} placeholder={t('dateFrom')} />
                                <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className={formElementClasses} placeholder={t('dateTo')} />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('referenceNumber')}</th>
                                        <th scope="col" className="px-6 py-3">{t('date')}</th>
                                        <th scope="col" className="px-6 py-3">{t('inspector')}</th>
                                        <th scope="col" className="px-6 py-3">{t('location')}</th>
                                        <th scope="col" className="px-6 py-3">{t('status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.map(report => {
                                        const location = getLocationById(report.locationId);
                                        return (
                                        <tr key={report.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                <Link to={`/report/${report.id}`} className="text-brand-blue hover:underline">{report.referenceNumber}</Link>
                                            </td>
                                            <td className="px-6 py-4">{new Date(report.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{getInspectorById(report.inspectorId)?.name}</td>
                                            <td className="px-6 py-4">{location?.name[language]}</td>
                                            <td className="px-6 py-4">{t(report.status.replace(/\s/g, ''))}</td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Sidebar: Report Generation */}
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <h3 className="text-xl font-bold text-brand-blue-dark dark:text-brand-green mb-4">{t('generateReports')}</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('summaryReports')}</h4>
                                <div className="flex flex-col space-y-2">
                                    <button onClick={() => setGeneratingSummaryReport('weekly')} className="w-full flex items-center justify-center px-3 py-2 text-sm bg-brand-teal text-white rounded-md hover:bg-brand-blue-dark"><FileDown size={14} className="me-2"/>{t('weeklySummaryReport')}</button>
                                    <button onClick={() => setGeneratingSummaryReport('monthly')} className="w-full flex items-center justify-center px-3 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-ca6702"><FileDown size={14} className="me-2"/>{t('monthlyKpiReport')}</button>
                                </div>
                            </div>

                            <hr className="dark:border-gray-600"/>

                            <div>
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('inspectorPerformanceReport')}</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('selectInspector')}</label>
                                        <select value={selectedInspector} onChange={e => setSelectedInspector(e.target.value)} className={formElementClasses}>
                                            <option value="">-- {t('selectInspector')} --</option>
                                            {inspectors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('dateFrom')}</label>
                                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={formElementClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('dateTo')}</label>
                                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={formElementClasses} />
                                    </div>
                                    <button 
                                        onClick={handleGenerateInspectorReport}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-brand-blue text-white font-semibold rounded-md shadow-sm hover:bg-brand-blue-dark transition-colors disabled:bg-gray-400"
                                        disabled={!selectedInspector || !dateFrom || !dateTo}
                                    >
                                        <FileDown size={16} className="me-2" />
                                        {t('generateReport')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-xl font-bold text-brand-blue-dark dark:text-brand-green mb-4">{t('performanceAnalysis')}</h3>
                         <Link 
                            to="/inspector-averages" 
                            className="w-full flex items-center justify-center px-4 py-2 bg-brand-blue text-white font-semibold rounded-md shadow-sm hover:bg-brand-blue-dark transition-colors"
                        >
                            <PieChart size={16} className="me-2" />
                            {t('analyzeAverages')}
                        </Link>
                    </Card>
                </div>
            </div>
            
            {generatingSummaryReport && <PrintableReport type={generatingSummaryReport} />}
            {generatingInspectorReport && <PrintableInspectorReport inspectorId={selectedInspector} from={dateFrom} to={dateTo} />}
            {generatingListReport && <PrintableReportList reports={filteredReports} />}
        </div>
    );
};

export default ReportingHub;