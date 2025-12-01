
import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { PenaltyStatus } from '../types';
import { Receipt, AlertCircle, CheckCircle, Filter, X } from 'lucide-react';

const PenaltyInvoicesPage: React.FC = () => {
    const { penaltyInvoices } = useContext(AppContext);
    const { t } = useI18n();

    // Filter States
    const [filterMonth, setFilterMonth] = useState('');
    const [filterInspector, setFilterInspector] = useState('');
    const [filterLocation, setFilterLocation] = useState('');

    const filteredInvoices = useMemo(() => {
        return penaltyInvoices.filter(inv => {
            const matchMonth = filterMonth ? inv.dateGenerated.startsWith(filterMonth) : true;
            const matchInspector = inv.inspectorName.toLowerCase().includes(filterInspector.toLowerCase());
            const matchLocation = inv.locationName.toLowerCase().includes(filterLocation.toLowerCase());
            return matchMonth && matchInspector && matchLocation;
        }).sort((a, b) => new Date(b.dateGenerated).getTime() - new Date(a.dateGenerated).getTime());
    }, [penaltyInvoices, filterMonth, filterInspector, filterLocation]);

    const clearFilters = () => {
        setFilterMonth('');
        setFilterInspector('');
        setFilterLocation('');
    };

    const getStatusBadge = (status: PenaltyStatus) => {
        if (status === PenaltyStatus.Pending) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    <AlertCircle size={12} className="me-1" />
                    {t('pendingApproval')}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <CheckCircle size={12} className="me-1" />
                {t('deducted')}
            </span>
        );
    };

    const inputClasses = "w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-brand-teal focus:border-brand-teal text-sm";

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Receipt size={24} className="text-brand-blue me-3" />
                    <h2 className="text-2xl font-bold text-brand-blue-dark dark:text-brand-green">{t('penaltyInvoices')}</h2>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mb-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-2 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                    <Filter size={16} className="me-2" />
                    {t('filter')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <input 
                            type="month" 
                            value={filterMonth} 
                            onChange={(e) => setFilterMonth(e.target.value)} 
                            className={inputClasses}
                            placeholder={t('date')}
                        />
                    </div>
                    <div>
                        <input 
                            type="text" 
                            value={filterInspector} 
                            onChange={(e) => setFilterInspector(e.target.value)} 
                            className={inputClasses} 
                            placeholder={t('inspector')}
                        />
                    </div>
                    <div>
                        <input 
                            type="text" 
                            value={filterLocation} 
                            onChange={(e) => setFilterLocation(e.target.value)} 
                            className={inputClasses} 
                            placeholder={t('location')}
                        />
                    </div>
                    <div>
                        <button 
                            onClick={clearFilters}
                            className="w-full flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors text-sm h-full"
                        >
                            <X size={16} className="me-2" />
                            {t('clearFilters') || 'Clear Filters'}
                        </button>
                    </div>
                </div>
            </div>

            {filteredInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>{t('noInvoices')}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('invoiceId')}</th>
                                <th scope="col" className="px-6 py-3">{t('referenceNumber')} (CDR)</th>
                                <th scope="col" className="px-6 py-3">{t('generatedDate')}</th>
                                <th scope="col" className="px-6 py-3">{t('location')}</th>
                                <th scope="col" className="px-6 py-3">{t('inspector')}</th>
                                <th scope="col" className="px-6 py-3">{t('totalAmount')}</th>
                                <th scope="col" className="px-6 py-3">{t('status')}</th>
                                <th scope="col" className="px-6 py-3">{t('view')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{inv.id}</td>
                                    <td className="px-6 py-4 text-brand-blue">{inv.cdrReference}</td>
                                    <td className="px-6 py-4">{new Date(inv.dateGenerated).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{inv.locationName}</td>
                                    <td className="px-6 py-4">{inv.inspectorName}</td>
                                    <td className="px-6 py-4 font-bold text-red-600">{inv.totalAmount} SAR</td>
                                    <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                                    <td className="px-6 py-4">
                                        <Link to={`/penalty-invoice/${inv.id}`} className="text-brand-blue hover:underline font-semibold">{t('view')}</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default PenaltyInvoicesPage;
