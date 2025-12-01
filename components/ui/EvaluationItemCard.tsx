import React, { useRef } from 'react';
import { EvaluationItem, InspectionResultItem } from '../../types';
import { Camera, X } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface EvaluationItemCardProps {
  item: EvaluationItem;
  result: InspectionResultItem;
  index: number;
  isEditable: boolean;
  onUpdate: (field: keyof InspectionResultItem, value: any) => void;
}

const EvaluationItemCard: React.FC<EvaluationItemCardProps> = ({ item, result, index, isEditable, onUpdate }) => {
  const { t } = useI18n();
  const scoreValues = Array.from({ length: item.maxScore + 1 }, (_, i) => item.maxScore - i);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDefectChange = (defect: string) => {
    const currentDefects = result.defects;
    const newDefects = currentDefects.includes(defect)
      ? currentDefects.filter(d => d !== defect)
      : [...currentDefects, defect];
    onUpdate('defects', newDefects);
  };
  
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        // For simplicity, we'll just handle one photo as a data URL
        onUpdate('photos', [reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
     // Reset file input to allow re-uploading the same file
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    onUpdate('photos', []);
  };

  const getScoreColorClass = (score: number, maxScore: number, isSelected: boolean) => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    
    if (percentage >= 80) {
      return isSelected 
        ? 'bg-green-600 text-white border-green-600' 
        : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/30';
    }
    if (percentage >= 60) {
      return isSelected 
        ? 'bg-yellow-500 text-white border-yellow-500' 
        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-800/30';
    }
    return isSelected 
      ? 'bg-red-600 text-white border-red-600' 
      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800/30';
  }

  // View for Screen
  const screenView = (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm print-hidden">
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg text-brand-blue-dark dark:text-brand-green">
          {index + 1}. {t(item.name)}
        </h3>
      </div>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Score Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('score')} <span className="text-gray-400 font-normal">({item.maxScore} {t('maxScore')})</span></label>
          <div className="flex flex-wrap gap-2">
            {scoreValues.map(score => (
              <button
                key={score}
                type="button"
                onClick={() => isEditable && onUpdate('score', score)}
                disabled={!isEditable}
                className={`w-12 h-12 flex items-center justify-center rounded-md border font-semibold text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  ${getScoreColorClass(score, item.maxScore, result.score === score)}
                  `}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* Predefined Defects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('possibleNotes')}</label>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {item.predefinedDefects.map(defect => (
              <label key={defect} className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={result.defects.includes(defect)}
                  onChange={() => handleDefectChange(defect)}
                  disabled={!isEditable}
                  className="h-5 w-5 rounded border-gray-300 dark:border-gray-500 text-brand-teal focus:ring-brand-teal disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-600"
                />
                <span className="text-gray-800 dark:text-gray-200">{t(defect)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor={`comment-${item.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('additionalNotes')}</label>
          <textarea
            id={`comment-${item.id}`}
            value={result.comment}
            onChange={(e) => onUpdate('comment', e.target.value)}
            disabled={!isEditable}
            placeholder={t('addANote')}
            rows={3}
            className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-teal focus:border-brand-teal disabled:bg-gray-100 dark:disabled:bg-gray-700 resize-y text-gray-900 dark:text-white"
          />
        </div>

        {/* Photo Evidence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('photoEvidence')}</label>
          <div className="flex items-center gap-4">
             <div className="flex-grow h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center overflow-hidden">
                {result.photos && result.photos.length > 0 ? (
                  <div className="relative">
                    <img src={result.photos[0]} alt="Evidence" className="h-24 object-cover" />
                    {isEditable && (
                      <button onClick={handleRemovePhoto} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">{t('noPhotosUploaded')}</span>
                )}
              </div>
            {isEditable && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 flex items-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-sm hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                  disabled={!isEditable || (result.photos && result.photos.length > 0)}
                >
                  <Camera size={16} className="me-2" />
                  {t('uploadPhoto')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  // View for Print
  const printView = (
    <div className="hidden print-block evaluation-card-print-view">
        <h3 className="text-base font-bold">
          {index + 1}. {t(item.name)}
        </h3>
        <div className="mt-2 pl-4 text-sm">
            <p><strong>{t('score')}:</strong> {result.score} / {item.maxScore}</p>
            {result.defects.length > 0 && (
                <p><strong>{t('defects')}:</strong> {result.defects.map(d => t(d)).join(', ')}</p>
            )}
            {result.comment && (
                <p><strong>{t('comments')}:</strong> {result.comment}</p>
            )}
        </div>
    </div>
  );

  return (
    <>
      {screenView}
      {printView}
    </>
  );
};

export default EvaluationItemCard;