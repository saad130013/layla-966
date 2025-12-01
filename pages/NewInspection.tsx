import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { RiskCategory, ReportStatus, InspectionReport } from '../types';
import { useI18n } from '../hooks/useI18n';
import { Users, MapPin, Plus, X, ArrowRight } from 'lucide-react';

const NewInspection: React.FC = () => {
    const { user, zones, locations, submitReport, getFormById } = useContext(AppContext);
    const { t, language } = useI18n();
    const navigate = useNavigate();

    const [selectedRisk, setSelectedRisk] = useState<RiskCategory>(RiskCategory.Low);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [subLocationInput, setSubLocationInput] = useState('');
    const [subLocations, setSubLocations] = useState<string[]>([]);

    const handleRiskSelect = (risk: RiskCategory) => {
        setSelectedRisk(risk);
        setSelectedLocations([]);
    };

    const handleLocationToggle = (locationId: string) => {
        setSelectedLocations(prev =>
            prev.includes(locationId)
                ? prev.filter(id => id !== locationId)
                : [...prev, locationId]
        );
    };

    const handleAddSubLocation = () => {
        if (subLocationInput.trim() && !subLocations.includes(subLocationInput.trim())) {
            setSubLocations([...subLocations, subLocationInput.trim()]);
            setSubLocationInput('');
        }
    };
    
    const handleRemoveSubLocation = (subLocationToRemove: string) => {
        setSubLocations(subLocations.filter(sl => sl !== subLocationToRemove));
    };

    const handleStartEvaluation = () => {
        if (selectedLocations.length === 0 || !user) return;
        
        const newReports: InspectionReport[] = [];
        const batchLocationIds = selectedLocations;

        selectedLocations.forEach(locationId => {
            const location = locations.find(l => l.id === locationId);
            if (!location) return;

            const form = getFormById(location.formId);
            if (!form) return;

            const newReport: InspectionReport = {
                id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                referenceNumber: 'DRAFT',
                inspectorId: user.id,
                locationId: locationId,
                date: new Date().toISOString(),
                status: ReportStatus.Draft,
                items: form.items.map(item => ({
                    itemId: item.id,
                    score: item.maxScore,
                    comment: '',
                    defects: [],
                    photos: [],
                })),
                subLocations: subLocations,
                batchLocationIds: batchLocationIds.length > 1 ? batchLocationIds : undefined,
            };
            submitReport(newReport);
            newReports.push(newReport);
        });

        if (newReports.length > 0) {
            // Navigate to the first created report, passing it in state to avoid race conditions
            navigate(`/report/${newReports[0].id}`, { state: { newReport: newReports[0] } });
        } else {
            // Fallback, just in case
            navigate('/dashboard');
        }
    };

    const availableLocations = locations.filter(loc => {
        const zone = zones.find(z => z.id === loc.zoneId);
        return zone?.riskCategory === selectedRisk;
    });

    const riskCategories: { key: RiskCategory, name: string, colors: string, activeColors: string }[] = [
        { key: RiskCategory.High, name: t('highRisk'), colors: 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40', activeColors: 'border-red-500 ring-2 ring-red-200' },
        { key: RiskCategory.Medium, name: t('mediumRisk'), colors: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300 dark:hover:bg-yellow-900/40', activeColors: 'border-yellow-500 ring-2 ring-yellow-200' },
        { key: RiskCategory.Low, name: t('lowRisk'), colors: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600', activeColors: 'border-brand-blue ring-2 ring-brand-blue/30' },
    ];

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-brand-teal text-white p-6 sm:p-8 rounded-t-xl">
                <h1 className="text-2xl sm:text-3xl font-bold">Cleaning Evaluation System</h1>
                <p className="text-brand-green mt-1">Select the following information to begin</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-b-xl shadow-2xl space-y-8">
                {/* Inspector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inspector')}</label>
                    <div className="relative">
                        <input
                            type="text"
                            readOnly
                            value={user?.name || ''}
                            className="w-full p-3 ps-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400"
                        />
                        <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
                            <Users className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Zone Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('zoneType')}</label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        {riskCategories.map(risk => (
                            <button
                                key={risk.key}
                                onClick={() => handleRiskSelect(risk.key)}
                                className={`p-3 text-center font-semibold rounded-lg border transition-all duration-200 ${risk.colors} ${selectedRisk === risk.key ? risk.activeColors : 'border-transparent'}`}
                            >
                                {risk.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Locations (Zone in image) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('location')}</label>
                    <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto space-y-3">
                        {availableLocations.length > 0 ? availableLocations.map(loc => (
                             <label key={loc.id} className="flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedLocations.includes(loc.id)}
                                    onChange={() => handleLocationToggle(loc.id)}
                                    className="h-5 w-5 rounded border-gray-300 text-brand-teal focus:ring-brand-teal"
                                />
                                <span className="text-gray-800 dark:text-gray-200 font-medium">{loc.name[language]}</span>
                            </label>
                        )) : <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('selectRiskCategory')} first</p>}
                    </div>
                </div>
                
                {/* Sub-locations */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('subLocations')}</label>
                     <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={subLocationInput}
                            onChange={(e) => setSubLocationInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubLocation())}
                            placeholder={t('subLocationPlaceholder')}
                            className="flex-grow p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                        />
                         <button onClick={handleAddSubLocation} className="flex-shrink-0 w-12 h-12 bg-gray-800 dark:bg-gray-600 text-white rounded-lg hover:bg-black dark:hover:bg-gray-500 flex items-center justify-center transition">
                             <Plus size={24} />
                         </button>
                    </div>
                    {subLocations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {subLocations.map(sl => (
                                <span key={sl} className="flex items-center bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 text-sm font-medium">
                                    {sl}
                                    <button onClick={() => handleRemoveSubLocation(sl)} className="ms-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div>
                    <button
                        onClick={handleStartEvaluation}
                        disabled={selectedLocations.length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-brand-teal text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-blue transition-transform transform hover:scale-105 duration-300 focus:outline-none focus:ring-4 focus:ring-brand-teal/50 disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        {t('startEvaluation')}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewInspection;
