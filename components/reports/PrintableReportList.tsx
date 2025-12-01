import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { InspectionReport } from '../../types';
import { Hospital } from 'lucide-react';

interface PrintableReportListProps {
  reports: InspectionReport[];
}

const PrintableReportList: React.FC<PrintableReportListProps> = ({ reports }) => {
  const { getInspectorById, getLocationById } = useContext(AppContext);
  const { t, language } = useI18n();

  return (
    <div className="hidden print-block p-4 inspector-report-view">
      <header className="print-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #005f73', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Hospital size={32} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0.5rem' }}>InspectionSys</h1>
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'right', margin: 0 }}>{t('allReports')}</h2>
          <p style={{ fontSize: '0.875rem', textAlign: 'right', color: '#6b7280' }}>
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </header>

      <main>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>{t('referenceNumber')}</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>{t('date')}</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>{t('inspector')}</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>{t('location')}</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => {
              const location = getLocationById(report.locationId);
              const inspector = getInspectorById(report.inspectorId);
              return (
                <tr key={report.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                  <td style={{ padding: '0.75rem' }}>{report.referenceNumber}</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(report.date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>{inspector?.name}</td>
                  <td style={{ padding: '0.75rem' }}>{location?.name[language]}</td>
                  <td style={{ padding: '0.75rem' }}>{t(report.status.replace(/\s/g, ''))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>

      <footer className="print-footer" style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ccc', fontSize: '0.75rem', color: '#6b7280' }}>
        <p>{t('generatedReportNotice')}</p>
        <p>Printed on: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
};

export default PrintableReportList;