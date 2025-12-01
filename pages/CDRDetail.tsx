
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { CDR, CDRStatus, CDRIncidentType, CDRManagerDecision, UserRole, PenaltyInvoice, PenaltyStatus } from '../types';
import { SERVICE_TYPES, MANPOWER_DISCREPANCY_OPTIONS, MATERIAL_DISCREPANCY_OPTIONS, EQUIPMENT_DISCREPANCY_OPTIONS, ON_SPOT_ACTION_OPTIONS, ACTION_PLAN_OPTIONS, PENALTY_RATES } from '../constants';
import { Save, Send, ShieldCheck, Printer, Upload, CheckCircle, Hospital, X } from 'lucide-react';

const Section: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => {
    const { t } = useI18n();
    return (
        <div className={`border dark:border-gray-700 rounded-lg p-4 ${className}`}>
            <h3 className="text-lg font-semibold text-brand-blue-dark dark:text-brand-green mb-4 border-b dark:border-gray-600 pb-2">{t(title)}</h3>
            <div className="space-y-4">{children}</div>
        </div>
    );
};

const CDRDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, getCDRById, addCDR, updateCDR, locations, getLocationById, getInspectorById, addPenaltyInvoice } = useContext(AppContext);
    const { t, language } = useI18n();

    const isNew = id === 'new';
    const [cdr, setCdr] = useState<CDR | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isNew) {
            if (user && !cdr) {
                setCdr({
                    id: `temp-${Date.now()}`,
                    referenceNumber: 'DRAFT',
                    employeeId: user.id,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().slice(0, 5),
                    locationId: '',
                    incidentType: CDRIncidentType.First,
                    inChargeName: '',
                    inChargeId: '',
                    inChargeEmail: '',
                    serviceTypes: [],
                    manpowerDiscrepancy: [],
                    materialDiscrepancy: [],
                    equipmentDiscrepancy: [],
                    onSpotAction: [],
                    actionPlan: [],
                    staffComment: '',
                    attachments: [],
                    employeeSignature: '',
                    status: CDRStatus.Draft,
                });
            }
        } else if (id) {
            const foundCDR = getCDRById(id);
            if (foundCDR) setCdr(foundCDR);
        }
    }, [id, isNew, user, getCDRById]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!cdr) return;
        const { name, value } = e.target;
        setCdr({ ...cdr, [name]: value });
    };

    const handleCheckboxChange = (category: keyof CDR, value: string) => {
        if (!cdr) return;
        const currentValues = cdr[category] as string[];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        setCdr({ ...cdr, [category]: newValues });
    };

    const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!cdr) return;
        if (event.target.files) {
            for (let i = 0; i < event.target.files.length; i++) {
                const file = event.target.files[i];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (reader.result) {
                            setCdr(prevCdr => {
                                if (!prevCdr) return null;
                                return { 
                                    ...prevCdr, 
                                    attachments: [...prevCdr.attachments, reader.result as string] 
                                };
                            });
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
             // Reset file input
            if(event.target) {
                event.target.value = '';
            }
        }
    };

    const handleRemoveAttachment = (index: number) => {
        if (!cdr) return;
        const newAttachments = cdr.attachments.filter((_, i) => i !== index);
        setCdr({ ...cdr, attachments: newAttachments });
    };


    const handleSave = (status: CDRStatus) => {
        if (!cdr || !user) return;
        const finalCDR: CDR = {
            ...cdr,
            employeeSignature: user.name, // Simple signature
            status,
            id: isNew ? `cdr-${Date.now()}` : cdr.id,
            referenceNumber: isNew && status === CDRStatus.Submitted ? `CDR-${Date.now().toString().slice(-4)}` : cdr.referenceNumber,
        };

        if (isNew) {
            addCDR(finalCDR);
        } else {
            updateCDR(finalCDR);
        }
        navigate(`/cdr/${finalCDR.id}`);
    };
    
    const handleManagerApproval = () => {
        if (!cdr || !user) return;
        
        // Validation: Ensure Manager Decision is selected
        if (!cdr.managerDecision) {
            alert(t('pleaseSelectManagerDecision'));
            return;
        }

        const finalCDR: CDR = {
            ...cdr,
            managerSignature: user.name,
            finalizedDate: new Date().toISOString(),
            status: CDRStatus.Approved,
        };
        
        // --- Invoice Generation Logic ---
        // STRICT CHECK: Only generate invoice if decision is exactly 'Penalty'
        if (finalCDR.managerDecision === CDRManagerDecision.Penalty) {
            const invoiceItems: any[] = [];
            
            finalCDR.manpowerDiscrepancy.forEach(d => {
                invoiceItems.push({ description: d, category: 'Manpower Discrepancy', amount: PENALTY_RATES[d] || PENALTY_RATES['Other'] });
            });
            finalCDR.materialDiscrepancy.forEach(d => {
                invoiceItems.push({ description: d, category: 'Material Discrepancy', amount: PENALTY_RATES[d] || PENALTY_RATES['Other'] });
            });
            finalCDR.equipmentDiscrepancy.forEach(d => {
                invoiceItems.push({ description: d, category: 'Equipment Discrepancy', amount: PENALTY_RATES[d] || PENALTY_RATES['Other'] });
            });

            const totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);

            if (totalAmount > 0) {
                const location = getLocationById(cdr.locationId);
                const inspector = getInspectorById(cdr.employeeId);
                
                const newInvoice: PenaltyInvoice = {
                    id: `inv-${Date.now()}`,
                    cdrId: finalCDR.id,
                    cdrReference: finalCDR.referenceNumber,
                    dateGenerated: new Date().toISOString(),
                    locationName: location?.name[language] || 'Unknown Location',
                    inspectorName: inspector?.name || 'Unknown Inspector',
                    items: invoiceItems,
                    totalAmount,
                    status: PenaltyStatus.Pending,
                };
                addPenaltyInvoice(newInvoice);
                alert(`Report Approved. Penalty Invoice generated for ${totalAmount} SAR.`);
            } else {
                 alert("Report Approved as Penalty, but no monetary items were selected.");
            }
        } else {
            // Case: Warning, Attention, No Valid Case
            alert(`Report Approved with decision: ${t(finalCDR.managerDecision || '')}. No financial penalty issued.`);
        }
        // --------------------------------

        updateCDR(finalCDR);
        setCdr(finalCDR); // update local state
    };
    
    const renderCheckboxes = (title: string, options: string[], category: keyof CDR, isEditable: boolean) => (
        <Section title={title}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map(opt => (
                <label key={opt} className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                    <input
                        type="checkbox"
                        checked={(cdr?.[category] as string[])?.includes(opt)}
                        onChange={() => handleCheckboxChange(category, opt)}
                        disabled={!isEditable}
                        className="h-5 w-5 rounded border-gray-300 text-brand-teal focus:ring-brand-teal disabled:cursor-not-allowed"
                    />
                    <span>{opt}</span>
                </label>
            ))}
            </div>
        </Section>
    );
    
    if (!cdr) return <div>Loading CDR...</div>;
    
    const isEmployeeEditable = cdr.status === CDRStatus.Draft && user?.id === cdr.employeeId;
    const isManagerEditable = cdr.status === CDRStatus.Submitted && user?.role === UserRole.Supervisor;
    const isEditableOnScreen = isEmployeeEditable || isManagerEditable;
    const showPrintButton = !isNew && (user?.id === cdr.employeeId || user?.role === UserRole.Supervisor);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-brand-blue-dark dark:text-brand-green">
                        {isNew ? t('newCDR') : `${t('cdr')} - ${cdr.referenceNumber}`}
                    </h2>
                     {showPrintButton && (
                        <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark no-print">
                            <Printer size={16} className="me-2"/> {t('printReport')}
                        </button>
                     )}
                </div>
            </Card>
            
            <div className="no-print">
                {isEditableOnScreen ? (
                    <>
                    <Section title="basicIncidentInformation">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="dateOfIncident" name="date" type="date" value={cdr.date} onChange={handleInputChange} disabled={!isEmployeeEditable} />
                            <InputField label="timeOfIncident" name="time" type="time" value={cdr.time} onChange={handleInputChange} disabled={!isEmployeeEditable} />
                            <SelectField label="wardLocation" name="locationId" value={cdr.locationId} onChange={handleInputChange} disabled={!isEmployeeEditable} options={locations.map(l => ({ value: l.id, label: l.name[language] }))} />
                            <SelectField label="typeOfIncident" name="incidentType" value={cdr.incidentType} onChange={handleInputChange} disabled={!isEmployeeEditable} options={Object.values(CDRIncidentType).map(v => ({ value: v, label: t(v) }))} />
                        </div>
                    </Section>
                    <Section title="inCharge">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="name" name="inChargeName" value={cdr.inChargeName} onChange={handleInputChange} disabled={!isEmployeeEditable} />
                            <InputField label="idNo" name="inChargeId" value={cdr.inChargeId} onChange={handleInputChange} disabled={!isEmployeeEditable} />
                            <InputField label="email" name="inChargeEmail" type="email" value={cdr.inChargeEmail} onChange={handleInputChange} disabled={!isEmployeeEditable} />
                        </div>
                    </Section>

                    {renderCheckboxes("serviceType", SERVICE_TYPES, 'serviceTypes', isEmployeeEditable)}
                    {renderCheckboxes("manpowerDiscrepancy", MANPOWER_DISCREPANCY_OPTIONS, 'manpowerDiscrepancy', isEmployeeEditable)}
                    {renderCheckboxes("materialDiscrepancy", MATERIAL_DISCREPANCY_OPTIONS, 'materialDiscrepancy', isEmployeeEditable)}
                    {renderCheckboxes("equipmentDiscrepancy", EQUIPMENT_DISCREPANCY_OPTIONS, 'equipmentDiscrepancy', isEmployeeEditable)}
                    {renderCheckboxes("onSpotAction", ON_SPOT_ACTION_OPTIONS, 'onSpotAction', isEmployeeEditable)}
                    {renderCheckboxes("actionPlan", ACTION_PLAN_OPTIONS, 'actionPlan', isEmployeeEditable)}

                    <Section title="staffComment">
                        <textarea name="staffComment" value={cdr.staffComment} onChange={handleInputChange} disabled={!isEmployeeEditable} rows={5} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </Section>
                    <Section title="attachments">
                        <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-md dark:border-gray-600 flex-wrap">
                            {cdr.attachments.length > 0 ? (
                                cdr.attachments.map((attachment, index) => (
                                    <div key={index} className="relative w-24 h-24">
                                        <img src={attachment} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                                        {isEmployeeEditable && (
                                            <button onClick={() => handleRemoveAttachment(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">{t('noPhotosUploaded')}</p>
                            )}
                            
                            {isEmployeeEditable && (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        ref={fileInputRef}
                                        onChange={handleAttachmentUpload}
                                        className="hidden"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="ms-auto px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 self-center"
                                    >
                                        <Upload className="me-2 inline-block"/>
                                        {t('uploadPhoto')}
                                    </button>
                                </>
                            )}
                        </div>
                    </Section>

                    {isEmployeeEditable && (
                        <div className="flex justify-end space-x-4 mt-6">
                            <button onClick={() => handleSave(CDRStatus.Draft)} className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"><Save size={16} className="me-2" />{t('saveAsDraft')}</button>
                            <button onClick={() => handleSave(CDRStatus.Submitted)} className="flex items-center px-4 py-2 bg-brand-teal text-white rounded-md hover:bg-brand-blue-dark"><Send size={16} className="me-2" />{t('submitToManager')}</button>
                        </div>
                    )}
                    
                    {isManagerEditable && (
                        <Section title="managerReview">
                            <div className="space-y-2">
                                <label className="font-semibold">{t('managerDecision')}</label>
                                <div className="flex flex-wrap gap-4">
                                    {Object.values(CDRManagerDecision).map(decision => (
                                        <label key={decision} className="flex items-center space-x-2 cursor-pointer">
                                            <input type="radio" name="managerDecision" value={decision} checked={cdr.managerDecision === decision} onChange={handleInputChange} className="w-4 h-4 text-brand-blue focus:ring-brand-blue border-gray-300" />
                                            <span>{t(decision)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">{t('managerComment')}</label>
                                <textarea name="managerComment" value={cdr.managerComment || ''} onChange={handleInputChange} rows={3} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div className="text-end">
                                <button onClick={handleManagerApproval} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"><ShieldCheck size={16} className="me-2" />{t('approveAndFinalize')}</button>
                            </div>
                        </Section>
                    )}
                    </>
                ) : (
                    <ReadOnlyView cdr={cdr} />
                )}
            </div>
            
            {!isNew && (
                <div className="hidden print-block">
                    <ReadOnlyView cdr={cdr} />
                </div>
            )}
        </div>
    );
};

const ReadOnlyView = ({ cdr }: { cdr: CDR }) => {
    const { t, language } = useI18n();
    const { getLocationById } = useContext(AppContext);
    const location = getLocationById(cdr.locationId);


    const PrintHeader = () => (
        <div className="hidden print-flex justify-between items-center mb-8">
            <div className="flex items-center">
                <Hospital size={32} className="text-brand-blue" />
                <h1 className="text-2xl font-bold mx-2">CDR System</h1>
            </div>
            <div>
                <h2 className="text-2xl font-bold">Environmental Services Discrepancy Report</h2>
                <p className="text-sm text-right">{cdr.referenceNumber}</p>
            </div>
        </div>
    );

    const ReadOnlySection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
        <div className="cdr-print-section">
            <h4>{t(title)}</h4>
            {children}
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm cdr-print-view">
            <PrintHeader />
            <div className="cdr-print-grid">
                <ReadOnlySection title="basicIncidentInformation">
                    <p><strong>{t('date')}:</strong> {new Date(cdr.date).toLocaleDateString()}</p>
                    <p><strong>{t('timeOfIncident')}:</strong> {cdr.time}</p>
                    <p><strong>{t('location')}:</strong> {location?.name[language]}</p>
                    <p><strong>{t('typeOfIncident')}:</strong> {t(cdr.incidentType)}</p>
                </ReadOnlySection>
                 <ReadOnlySection title="inCharge">
                    <p><strong>{t('name')}:</strong> {cdr.inChargeName}</p>
                    <p><strong>{t('idNo')}:</strong> {cdr.inChargeId}</p>
                </ReadOnlySection>
            </div>
            
            <ReadOnlySection title="discrepancyCategories">
                <ul>
                    {[...cdr.serviceTypes, ...cdr.manpowerDiscrepancy, ...cdr.materialDiscrepancy, ...cdr.equipmentDiscrepancy].map(item => <li key={item}>- {t(item)}</li>)}
                </ul>
            </ReadOnlySection>
            <ReadOnlySection title="staffComment"><p>{cdr.staffComment}</p></ReadOnlySection>
            
            <div className="cdr-print-grid">
                <ReadOnlySection title="onSpotAction"><ul>{cdr.onSpotAction.map(item => <li key={item}>- {item}</li>)}</ul></ReadOnlySection>
                <ReadOnlySection title="actionPlan"><ul>{cdr.actionPlan.map(item => <li key={item}>- {item}</li>)}</ul></ReadOnlySection>
            </div>
            
             <div className="mt-4 p-4 border-t dark:border-gray-700">
                <div className="flex justify-around">
                    <div className="text-center">
                        <p className="font-semibold">{t('employeeSignature')}</p>
                        <p className="mt-4 border-t dark:border-gray-600 pt-1">{cdr.employeeSignature}</p>
                    </div>
                     <div className="text-center">
                        <p className="font-semibold">{t('managerSignature')}</p>
                        <p className="mt-4 border-t dark:border-gray-600 pt-1">{cdr.managerSignature || '---'}</p>
                    </div>
                </div>
            </div>

            {cdr.status === CDRStatus.Approved && (
                <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                    <h3 className="font-bold text-lg text-blue-800 dark:text-blue-300 flex items-center"><CheckCircle size={20} className="me-2"/>{t('managerDecision')}</h3>
                    <p className="text-2xl font-bold mt-2">{t(cdr.managerDecision!)}</p>
                    {cdr.managerComment && <p className="mt-2 text-gray-700 dark:text-gray-300">"{cdr.managerComment}"</p>}
                </Card>
            )}
        </div>
    );
};

const InputField: React.FC<{label: string, name: string, value: string, onChange: any, disabled: boolean, type?: string}> = ({label, name, value, onChange, disabled, type="text"}) => {
    const { t } = useI18n();
    return (
    <div>
        <label className="block text-sm font-medium mb-1">{t(label)}</label>
        <input type={type} name={name} value={value} onChange={onChange} disabled={disabled} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800" />
    </div>
);
};

const SelectField: React.FC<{label: string, name: string, value: string, onChange: any, disabled: boolean, options: {value: string, label: string}[]}> = ({label, name, value, onChange, disabled, options}) => {
    const {t} = useI18n();
    return(
    <div>
        <label className="block text-sm font-medium mb-1">{t(label)}</label>
        <select name={name} value={value} onChange={onChange} disabled={disabled} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800">
             <option value="">-- Select --</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
)};


export default CDRDetail;
