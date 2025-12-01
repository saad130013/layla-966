
import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { USERS } from '../constants';
import { UserRole, RiskCategory } from '../types';
import { FileUp } from 'lucide-react';

const ReportsList: React.FC = () => {
    const { reports, getInspectorById, getLocationById, getZoneByLocationId } = useContext(AppContext);
    const { t, language } = useI18n();

    const [filters, setFilters] = useState({
        ref: '',
        inspectorId: '',
        risk: '',
        dateFrom: '',
        dateTo: ''
    });

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
                (!filters.ref || report.referenceNumber.includes(filters.ref)) &&
                (!filters.inspectorId || report.inspectorId === filters.inspectorId) &&
                (!filters.risk || (zone && zone.riskCategory === filters.risk)) &&
                (!dateFrom || reportDate >= dateFrom) &&
                (!dateTo || reportDate <= dateTo)
            );
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reports, filters, getZoneByLocationId]);

    const inspectors = USERS.filter(u => u.role === UserRole.Inspector);
    const formElementClasses = "p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600";

    return (
        <Card>
             <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-brand-blue-dark dark:text-brand-green">{t('allReports')}</h2>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t('exportToPdf')}</button>
                    <button className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">{t('exportToExcel')}</button>
                    <button className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700">{t('exportToCsv')}</button>
                </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
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
                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className={formElementClasses}/>
                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className={formElementClasses}/>
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
                        {filteredReports.map(report => (
                            <tr key={report.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    <Link to={`/report/${report.id}`} className="text-brand-blue hover:underline">{report.referenceNumber}</Link>
                                </td>
                                <td className="px-6 py-4">{new Date(report.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{getInspectorById(report.inspectorId)?.name}</td>
                                <td className="px-6 py-4">{getLocationById(report.locationId)?.name[language]}</td>
                                <td className="px-6 py-4">{t(report.status.replace(/\s/g, ''))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default ReportsList;
