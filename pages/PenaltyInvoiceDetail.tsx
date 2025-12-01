import React, { useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { PenaltyStatus } from '../types';
import { CheckCheck, Printer, ArrowLeft, Hospital } from 'lucide-react';

const PenaltyInvoiceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getPenaltyInvoiceById, updatePenaltyInvoice, user } = useContext(AppContext);
    const { t } = useI18n();

    const invoice = id ? getPenaltyInvoiceById(id) : undefined;

    if (!invoice) return <div>Invoice not found</div>;

    const handleApprove = () => {
        if (!user) return;
        updatePenaltyInvoice({
            ...invoice,
            status: PenaltyStatus.Deducted,
            managerName: user.name,
            approvalDate: new Date().toISOString()
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-500 hover:text-gray-700 cursor-pointer no-print" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
                <span>Back to List</span>
            </div>

            {/* Screen View */}
            <div className="no-print">
            <Card className="border-t-4 border-brand-red">
                <div className="flex justify-between items-start border-b dark:border-gray-700 pb-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-blue-dark dark:text-gray-200">{t('penaltyInvoice')}</h1>
                        <p className="text-gray-500">#{invoice.id}</p>
                    </div>
                    <div className="text-end">
                         <div className={`text-lg font-bold px-3 py-1 rounded-full inline-block ${invoice.status === PenaltyStatus.Pending ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {t(invoice.status === PenaltyStatus.Pending ? 'pendingApproval' : 'deducted')}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{new Date(invoice.dateGenerated).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <h3 className="text-gray-500 font-semibold uppercase text-xs mb-1">{t('referenceNumber')}</h3>
                        <p className="text-lg font-medium">{invoice.cdrReference}</p>
                    </div>
                    <div>
                        <h3 className="text-gray-500 font-semibold uppercase text-xs mb-1">{t('location')}</h3>
                        <p className="text-lg font-medium">{invoice.locationName}</p>
                    </div>
                    <div>
                         <h3 className="text-gray-500 font-semibold uppercase text-xs mb-1">{t('inspector')}</h3>
                         <p className="text-lg font-medium">{invoice.inspectorName}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4">{t('invoiceDetails')}</h3>
                    <div className="overflow-hidden border rounded-lg dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('violationItem')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {invoice.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t(item.description)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">{item.amount} SAR</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50 dark:bg-gray-900 font-bold">
                                    <td className="px-6 py-4 text-right" colSpan={2}>{t('totalAmount')}</td>
                                    <td className="px-6 py-4 text-right text-red-600 text-lg">{invoice.totalAmount} SAR</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {invoice.status === PenaltyStatus.Deducted && (
                     <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800 mb-6">
                        <div className="flex items-center text-green-800 dark:text-green-300">
                            <CheckCheck size={20} className="me-2" />
                            <span className="font-bold">{t('deducted')}</span>
                        </div>
                        <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                            <p>{t('approvedBy')}: {invoice.managerName}</p>
                            <p>{t('approvalDate')}: {new Date(invoice.approvalDate!).toLocaleString()}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 no-print">
                    <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        <Printer size={16} className="me-2" />
                        Print PDF
                    </button>
                    {invoice.status === PenaltyStatus.Pending && (
                        <button 
                            onClick={handleApprove}
                            className="flex items-center px-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 shadow-md"
                        >
                            <CheckCheck size={18} className="me-2" />
                            {t('approveDeduction')}
                        </button>
                    )}
                </div>
            </Card>
            </div>

            {/* Print View - Official Report Style */}
            <div className="hidden print-block p-8 bg-white text-black">
                {/* Header */}
                <div className="border-b-4 border-blue-900 pb-4 mb-6 flex justify-between items-start">
                    <div className="flex items-center">
                         <Hospital size={40} className="text-blue-900 me-3" />
                         <div>
                             <h1 className="text-2xl font-bold text-blue-900 uppercase">{t('officialPenaltyReport')}</h1>
                             <p className="text-sm text-gray-600">EVS Department</p>
                         </div>
                    </div>
                    <div className="text-right text-sm">
                        <p><strong>{t('invoiceId')}:</strong> {invoice.id}</p>
                        <p><strong>{t('date')}:</strong> {new Date(invoice.dateGenerated).toLocaleDateString()}</p>
                        <p><strong>{t('referenceNumber')}:</strong> {invoice.cdrReference}</p>
                    </div>
                </div>

                {/* Intro */}
                <div className="mb-8">
                    <p className="text-gray-800 italic border-l-4 border-gray-300 pl-4 py-2">
                        {t('introStatement')}
                    </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm">
                    <div className="border-b border-gray-200 pb-1">
                        <span className="font-bold text-gray-700 block">{t('location')}</span>
                        <span>{invoice.locationName}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-1">
                        <span className="font-bold text-gray-700 block">{t('inspector')}</span>
                        <span>{invoice.inspectorName}</span>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-8">
                    <h3 className="font-bold text-lg mb-2 uppercase text-gray-700 border-b-2 border-gray-400 pb-1">{t('violationItem')}</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-300">
                                <th className="text-left py-2 font-bold text-gray-700">{t('violationItem')}</th>
                                <th className="text-left py-2 font-bold text-gray-700">{t('category')}</th>
                                <th className="text-right py-2 font-bold text-gray-700">{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                    <td className="py-3 pr-4">{t(item.description)}</td>
                                    <td className="py-3 pr-4 text-gray-600">{item.category}</td>
                                    <td className="py-3 text-right font-mono">{item.amount} SAR</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mb-12 flex justify-end">
                    <div className="w-1/2 bg-gray-100 p-4 rounded">
                         <h3 className="font-bold text-sm mb-2 uppercase border-b border-gray-300 pb-1">{t('totalsSection')}</h3>
                         <div className="flex justify-between mb-2">
                             <span>{t('totalPenaltyViolations')}:</span>
                             <span className="font-bold">{invoice.items.length}</span>
                         </div>
                         <div className="flex justify-between text-lg font-bold text-red-700 border-t border-gray-300 pt-2">
                             <span>{t('totalPenaltyAmountDue')}:</span>
                             <span>{invoice.totalAmount} SAR</span>
                         </div>
                    </div>
                </div>

                {/* Signatures */}
                <div className="mt-16">
                     <h3 className="font-bold text-sm mb-6 uppercase border-b-2 border-gray-800 pb-1">{t('signatures')}</h3>
                     <div className="grid grid-cols-3 gap-8">
                         <div className="text-center">
                             <div className="h-16 border-b border-gray-400 mb-2"></div>
                             <p className="font-bold text-sm">{t('inspector')}</p>
                         </div>
                         <div className="text-center">
                             <div className="h-16 border-b border-gray-400 mb-2 flex items-end justify-center pb-2">
                                <span className="font-script text-xl">{invoice.managerName || ''}</span>
                             </div>
                             <p className="font-bold text-sm">{t('supervisor')}</p>
                         </div>
                         <div className="text-center">
                             <div className="h-16 border-b border-gray-400 mb-2"></div>
                             <p className="font-bold text-sm">{t('facilityManager')}</p>
                         </div>
                     </div>
                </div>
                
                <div className="mt-12 text-center text-xs text-gray-500">
                    <p>Generated by InspectionSys - {new Date().toISOString()}</p>
                </div>
            </div>
        </div>
    );
};

export default PenaltyInvoiceDetail;