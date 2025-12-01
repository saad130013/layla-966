
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { GlobalPenaltyStatement, GlobalPenaltyStatus, GlobalPenaltyItem, PenaltyStatus, GlobalPenaltyItemStatus } from '../types';
import { Save, Printer, Trash2, CheckCheck, RefreshCw, Hospital, ArrowLeft, AlertTriangle } from 'lucide-react';

const GlobalPenaltyStatementDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { penaltyInvoices, globalPenaltyStatements, addGlobalPenaltyStatement, updateGlobalPenaltyStatement, user } = useContext(AppContext);
    const { t } = useI18n();

    const isNew = id === 'new';
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    const [statement, setStatement] = useState<GlobalPenaltyStatement | null>(null);

    // -------------------------------------------------------------------------
    // CORE LOGIC: Aggregate items directly from Approved Penalty Invoices
    // -------------------------------------------------------------------------
    const generateDataFromInvoices = (month: number, year: number) => {
        // Filter invoices for this month/year that are DEDUCTED (Approved)
        const relevantInvoices = penaltyInvoices.filter(inv => {
            const d = new Date(inv.dateGenerated);
            return (
                d.getMonth() === month &&
                d.getFullYear() === year &&
                inv.status === PenaltyStatus.Deducted // Only include Approved/Deducted invoices
            );
        });

        const aggregatedItems: Record<string, GlobalPenaltyItem> = {};
        
        // Iterate through invoices to aggregate items
        relevantInvoices.forEach(inv => {
            inv.items.forEach(invItem => {
                // Key can be description + amount to group identical violations with same price
                const key = `${invItem.description}-${invItem.amount}`;
                
                if (!aggregatedItems[key]) {
                    aggregatedItems[key] = {
                        id: `gps-item-${Date.now()}-${Math.random()}`,
                        violationName: invItem.description,
                        category: invItem.category,
                        occurrenceCount: 0,
                        penaltyPerOccurrence: invItem.amount,
                        total: 0,
                        status: GlobalPenaltyItemStatus.Approved, // Default to Approved
                        managerNotes: ''
                    };
                }
                
                aggregatedItems[key].occurrenceCount += 1;
                aggregatedItems[key].total += invItem.amount;
            });
        });

        const itemsArray = Object.values(aggregatedItems);
        const totalAmount = itemsArray.reduce((sum, item) => sum + item.total, 0);
        const totalViolations = itemsArray.reduce((sum, item) => sum + item.occurrenceCount, 0);
        const totalInvoices = relevantInvoices.length;

        return { items: itemsArray, totalAmount, totalViolations, totalInvoices };
    };

    // -------------------------------------------------------------------------
    // INITIALIZATION
    // -------------------------------------------------------------------------
    useEffect(() => {
        // 1. Priority: Navigation State (Immediate display after approval/redirect)
        const stateStatement = location.state?.statement as GlobalPenaltyStatement | undefined;
        if (stateStatement && stateStatement.id === id) {
            setStatement(stateStatement);
            return;
        }

        // 2. Existing local state logic to prevent overwrite
        if (statement) {
            if (isNew && statement.id.startsWith('gps-')) {
                 // Check if month/year matches current params. If mismatch, regenerate.
                 if (monthParam && yearParam && 
                     (statement.month === parseInt(monthParam) && statement.year === parseInt(yearParam))) {
                     return; // Keep current new statement
                 }
            } else if (!isNew && statement.id === id) {
                return; // Keep current existing statement
            }
        }

        // 3. Logic for "New" Statement
        if (isNew && monthParam && yearParam) {
            const month = parseInt(monthParam);
            const year = parseInt(yearParam);
            
            const { items, totalAmount, totalViolations, totalInvoices } = generateDataFromInvoices(month, year);

            const newStatement: GlobalPenaltyStatement = {
                id: `gps-${Date.now()}`,
                referenceNumber: `GPS-${year}-${(month + 1).toString().padStart(2, '0')}-001`,
                month,
                year,
                status: GlobalPenaltyStatus.Draft,
                contractorName: 'CleanCo Services', // Default/Mock Contractor
                generatedDate: new Date().toISOString(),
                items,
                totalAmount,
                totalViolations,
                totalInvoices,
                managerGeneralComment: ''
            };
            setStatement(newStatement);
        } 
        // 4. Logic for "Existing" Statement
        else if (id && !isNew) {
            const existing = globalPenaltyStatements.find(s => s.id === id);
            if (existing) {
                setStatement(existing);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isNew, monthParam, yearParam, globalPenaltyStatements, location.state]);

    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------

    const handleUpdateRow = (itemId: string, field: keyof GlobalPenaltyItem, value: any) => {
        if (!statement || statement.status === GlobalPenaltyStatus.Approved) return;
        
        const updatedItems = statement.items.map(item => {
            if (item.id === itemId) {
                const newItem = { ...item, [field]: value };
                
                // Recalculate line total based on status and count
                if (newItem.status === GlobalPenaltyItemStatus.Rejected) {
                    newItem.total = 0;
                } else {
                    newItem.total = newItem.occurrenceCount * newItem.penaltyPerOccurrence;
                }
                
                return newItem;
            }
            return item;
        });

        recalculateAndSetStatement(updatedItems);
    };

    const handleDeleteRow = (itemId: string) => {
        if (!statement || statement.status === GlobalPenaltyStatus.Approved) return;
        if (!window.confirm(t('deleteRow') + "?")) return;

        const updatedItems = statement.items.filter(item => item.id !== itemId);
        recalculateAndSetStatement(updatedItems);
    };

    const recalculateAndSetStatement = (updatedItems: GlobalPenaltyItem[]) => {
        if (!statement) return;
        
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
        const totalViolations = updatedItems.reduce((sum, item) => 
            item.status === GlobalPenaltyItemStatus.Rejected ? sum : sum + item.occurrenceCount, 0
        );
        
        setStatement({ ...statement, items: updatedItems, totalAmount, totalViolations });
    };
    
    const handleRefreshData = () => {
        if (!statement || statement.status === GlobalPenaltyStatus.Approved) return;
        if (!window.confirm(t('confirmRefresh'))) return;

        const { items, totalAmount, totalViolations, totalInvoices } = generateDataFromInvoices(statement.month, statement.year);
        setStatement({ ...statement, items, totalAmount, totalViolations, totalInvoices, managerGeneralComment: '' });
    };

    const handleSave = (e?: React.MouseEvent) => {
        if(e) e.preventDefault();
        if (!statement) return;

        if (isNew) {
            addGlobalPenaltyStatement(statement);
            navigate(`/global-penalty-statement/${statement.id}`, { replace: true });
        } else {
            updateGlobalPenaltyStatement(statement);
        }
        alert(t('save') + " " + t('success'));
    };

    const handleApprove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!statement) return;
        if (!user) {
            alert(t('loginError') || "User session not found.");
            return;
        }

        // CONFIRMATION DIALOG
        const confirmMessage = t('confirmApprove') || "Are you sure you want to approve this statement?";
        if (!window.confirm(confirmMessage)) return;
        
        // CREATE APPROVED COPY
        const approvedStmt: GlobalPenaltyStatement = {
            ...statement,
            status: GlobalPenaltyStatus.Approved,
            approvedBy: user.name,
            approvedDate: new Date().toISOString()
        };
        
        // UPDATE LOCAL STATE FOR IMMEDIATE FEEDBACK (Prevent flickers)
        setStatement(approvedStmt);

        // SAVE TO CONTEXT
        if (isNew) {
            addGlobalPenaltyStatement(approvedStmt);
        } else {
            updateGlobalPenaltyStatement(approvedStmt);
        }
        
        // SUCCESS MESSAGE & NAVIGATE TO APPROVED LIST
        setTimeout(() => {
            alert(t('statementApprovedSuccess') || "Statement approved successfully.");
            navigate('/global-penalty-statements', { state: { activeTab: 'approved' } });
        }, 50);
    };

    if (!statement) return <div className="p-8 text-center text-gray-500">Loading Statement...</div>;

    const isEditable = statement.status === GlobalPenaltyStatus.Draft;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Filter items for print: exclude rejected items entirely
    const printableItems = statement.items.filter(item => item.status !== GlobalPenaltyItemStatus.Rejected);

    return (
        <div className="space-y-6">
            <div className="no-print flex items-center space-x-2 rtl:space-x-reverse text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => navigate('/global-penalty-statements')}>
                <ArrowLeft size={20} />
                <span>{t('globalPenaltyStatementsList')}</span>
            </div>

            {/* SCREEN VIEW */}
            <div className="no-print">
                <Card className={statement.status === GlobalPenaltyStatus.Approved ? 'border-t-4 border-green-500' : 'border-t-4 border-yellow-500'}>
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b dark:border-gray-700 pb-4 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-gray-200">{t('globalPenaltyStatement')}</h1>
                            <p className="text-gray-500">{months[statement.month]} {statement.year}</p>
                            <p className="text-xs text-gray-400 mt-1">Source: {statement.totalInvoices || 0} Approved Invoices</p>
                        </div>
                        <div className="text-end">
                            <span className={`px-3 py-1 rounded-full font-bold text-sm ${statement.status === GlobalPenaltyStatus.Approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {t(statement.status.toLowerCase())}
                            </span>
                            <p className="text-sm mt-1 text-gray-400">{statement.referenceNumber}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3">{t('managerDecision')}</th>
                                    <th className="px-4 py-3">{t('violationItem')}</th>
                                    <th className="px-4 py-3 text-center">{t('occurrenceCount')}</th>
                                    <th className="px-4 py-3 text-right">{t('penaltyPerOccurrence')}</th>
                                    <th className="px-4 py-3 text-right">{t('total')}</th>
                                    <th className="px-4 py-3 w-1/4">{t('managerNotes')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {statement.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                                            No penalties found for this month (or no approved invoices).
                                        </td>
                                    </tr>
                                ) : statement.items.map(item => (
                                    <tr key={item.id} className={`bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${item.status === GlobalPenaltyItemStatus.Rejected ? 'bg-red-50 dark:bg-red-900/10 opacity-75' : ''}`}>
                                         <td className="px-4 py-3">
                                            {isEditable ? (
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => handleUpdateRow(item.id, 'status', e.target.value)}
                                                    className={`p-1.5 border rounded text-xs font-semibold ${item.status === GlobalPenaltyItemStatus.Approved ? 'text-green-700 bg-green-50 border-green-200' : item.status === GlobalPenaltyItemStatus.Rejected ? 'text-red-700 bg-red-50 border-red-200' : 'text-gray-700'}`}
                                                >
                                                    <option value={GlobalPenaltyItemStatus.Approved}>{t('approve')}</option>
                                                    <option value={GlobalPenaltyItemStatus.Rejected}>{t('reject')}</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === GlobalPenaltyItemStatus.Approved ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                                    {t(item.status.toLowerCase())}
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-4 py-3 font-medium ${item.status === GlobalPenaltyItemStatus.Rejected ? 'line-through text-gray-500' : ''}`}>
                                            {t(item.violationName)}
                                            <div className="text-xs text-gray-400">{item.category}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {isEditable && item.status !== GlobalPenaltyItemStatus.Rejected ? (
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={item.occurrenceCount} 
                                                    onChange={(e) => handleUpdateRow(item.id, 'occurrenceCount', parseInt(e.target.value) || 0)}
                                                    className="w-20 p-1 border rounded text-center dark:bg-gray-700 dark:border-gray-600 focus:ring-brand-teal focus:border-brand-teal"
                                                />
                                            ) : item.occurrenceCount}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                             {isEditable && item.status !== GlobalPenaltyItemStatus.Rejected ? (
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={item.penaltyPerOccurrence} 
                                                    onChange={(e) => handleUpdateRow(item.id, 'penaltyPerOccurrence', parseFloat(e.target.value) || 0)}
                                                    className="w-24 p-1 border rounded text-right dark:bg-gray-700 dark:border-gray-600 focus:ring-brand-teal focus:border-brand-teal"
                                                />
                                            ) : item.penaltyPerOccurrence}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">
                                            {item.total.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            {isEditable ? (
                                                <input 
                                                    type="text"
                                                    placeholder={t('addANote')}
                                                    value={item.managerNotes || ''}
                                                    onChange={(e) => handleUpdateRow(item.id, 'managerNotes', e.target.value)}
                                                    className="w-full p-1.5 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-500 italic">{item.managerNotes}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                
                                <tr className="bg-gray-100 dark:bg-gray-900 font-bold">
                                    <td colSpan={2} className="px-4 py-4 text-right">{t('total')}</td>
                                    <td className="px-4 py-4 text-center text-lg">{statement.totalViolations}</td>
                                    <td className="px-4 py-4"></td>
                                    <td className="px-4 py-4 text-right text-red-600 text-xl">{statement.totalAmount.toLocaleString()} SAR</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('generalComments')}</label>
                        {isEditable ? (
                            <textarea 
                                rows={3}
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-brand-teal focus:border-brand-teal"
                                value={statement.managerGeneralComment || ''}
                                onChange={(e) => setStatement({...statement, managerGeneralComment: e.target.value})}
                                placeholder="Add general comments regarding this month's penalty statement..."
                            />
                        ) : (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 italic min-h-[60px]">
                                {statement.managerGeneralComment || 'No comments.'}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-end gap-4">
                        <button type="button" onClick={() => window.print()} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            <Printer size={16} className="me-2"/> Print PDF
                        </button>
                        
                        {isEditable && (
                            <>
                                <button type="button" onClick={handleRefreshData} className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                                    <RefreshCw size={16} className="me-2"/> {t('refreshData')}
                                </button>
                                <button type="button" onClick={handleSave} className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark">
                                    <Save size={16} className="me-2"/> {t('save')}
                                </button>
                                <button type="button" onClick={handleApprove} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                    <CheckCheck size={16} className="me-2"/> {t('approveStatement')}
                                </button>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            {/* PRINT VIEW */}
            <div className="hidden print-block p-8 bg-white text-black">
                 {/* Header */}
                 <div className="border-b-4 border-brand-blue pb-4 mb-6 flex justify-between items-start">
                    <div className="flex items-center">
                         <Hospital size={40} className="text-brand-blue me-3" />
                         <div>
                             <h1 className="text-2xl font-bold text-brand-blue uppercase">{t('penaltyStatementTitle')}</h1>
                             <p className="text-sm text-gray-600">{statement.contractorName} - {months[statement.month]} {statement.year}</p>
                         </div>
                    </div>
                    <div className="text-right text-sm">
                        <p><strong>{t('referenceNumber')}:</strong> {statement.referenceNumber}</p>
                        <p><strong>{t('date')}:</strong> {new Date(statement.generatedDate).toLocaleDateString()}</p>
                        <p><strong>{t('status')}:</strong> {t(statement.status.toLowerCase())}</p>
                        <p><strong>Approved Invoices:</strong> {statement.totalInvoices || 0}</p>
                    </div>
                </div>

                 {/* Intro */}
                 <div className="mb-8">
                    <p className="text-gray-800 italic border-l-4 border-gray-300 pl-4 py-2">
                        {t('statementIntro')}
                    </p>
                </div>

                {/* Table */}
                <div className="mb-8">
                     <table className="w-full text-sm border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left">{t('violationItem')}</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">{t('category')}</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">{t('occurrenceCount')}</th>
                                <th className="border border-gray-300 px-4 py-2 text-right">{t('penaltyPerOccurrence')}</th>
                                <th className="border border-gray-300 px-4 py-2 text-right">{t('total')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {printableItems.map(item => (
                                <tr key={item.id}>
                                    <td className="border border-gray-300 px-4 py-2">{t(item.violationName)}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.category}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{item.occurrenceCount}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-right">{item.penaltyPerOccurrence}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-right font-mono">{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr className="bg-gray-200 font-bold">
                                <td colSpan={2} className="border border-gray-300 px-4 py-2 text-right">{t('total')}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">{statement.totalViolations}</td>
                                <td className="border border-gray-300 px-4 py-2"></td>
                                <td className="border border-gray-300 px-4 py-2 text-right text-lg">{statement.totalAmount.toLocaleString()} SAR</td>
                            </tr>
                        </tbody>
                     </table>
                </div>
                
                {statement.managerGeneralComment && (
                    <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded">
                        <h4 className="font-bold text-sm uppercase mb-2">{t('generalComments')}</h4>
                        <p className="text-gray-800">{statement.managerGeneralComment}</p>
                    </div>
                )}

                {/* Signatures */}
                 <div className="mt-16">
                     <h3 className="font-bold text-sm mb-6 uppercase border-b-2 border-gray-800 pb-1">{t('signatures')}</h3>
                     <div className="grid grid-cols-3 gap-8">
                         <div className="text-center">
                             <div className="h-16 border-b border-gray-400 mb-2"></div>
                             <p className="font-bold text-sm">{t('evsSupervisor')}</p>
                         </div>
                         <div className="text-center">
                             <div className="h-16 border-b border-gray-400 mb-2 flex items-end justify-center pb-2">
                                <span className="font-script text-xl">{statement.approvedBy || ''}</span>
                             </div>
                             <p className="font-bold text-sm">{t('facilityManager')}</p>
                         </div>
                         <div className="text-center">
                             <div className="h-16 border-b border-gray-400 mb-2"></div>
                             <p className="font-bold text-sm">{t('contractorRepresentative')}</p>
                         </div>
                     </div>
                </div>

                <div className="mt-12 text-center text-xs text-gray-500">
                    <p>InspectionSys Global Penalty Statement - Generated {new Date().toISOString()}</p>
                </div>
            </div>
        </div>
    );
};

export default GlobalPenaltyStatementDetail;
