
import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import Card from '../components/ui/Card';
import { Printer, Plus, Minus } from 'lucide-react';

interface ContractRow {
    zoneLevel: string;
    areas: number;
    costPerDay: number;
    vatPerDay: number;
    dailyTotal: number;
    monthlyValue: number;
    monthlyVat: number;
    monthlyTotal: number;
}

interface ContractTableData {
    days: number;
    rows: ContractRow[];
}

interface SupplyItem {
    no: number;
    name: string;
    unit: string;
    qty: string | number;
}

const ContractDetailsPage: React.FC = () => {
    const { t } = useI18n();

    const contractData: ContractTableData[] = [
        {
            days: 31,
            rows: [
                { zoneLevel: 'Critical Zones', areas: 41, costPerDay: 34455.62, vatPerDay: 5168.34, dailyTotal: 39623.97, monthlyValue: 1068124.31, monthlyVat: 160218.65, monthlyTotal: 1228342.96 },
                { zoneLevel: 'Medium Risk Zones', areas: 24, costPerDay: 23022.53, vatPerDay: 3453.38, dailyTotal: 26475.91, monthlyValue: 713698.43, monthlyVat: 107054.76, monthlyTotal: 820753.19 },
                { zoneLevel: 'Normal Zones', areas: 59, costPerDay: 21908.54, vatPerDay: 3286.28, dailyTotal: 25194.82, monthlyValue: 679164.68, monthlyVat: 101874.70, monthlyTotal: 781039.38 },
            ]
        },
        {
            days: 30,
            rows: [
                { zoneLevel: 'Critical Zones', areas: 41, costPerDay: 34455.62, vatPerDay: 5168.34, dailyTotal: 39623.97, monthlyValue: 1033668.69, monthlyVat: 155050.30, monthlyTotal: 1188718.99 },
                { zoneLevel: 'Medium Risk Zones', areas: 24, costPerDay: 23022.53, vatPerDay: 3453.38, dailyTotal: 26475.91, monthlyValue: 690675.90, monthlyVat: 103601.39, monthlyTotal: 794277.29 },
                { zoneLevel: 'Normal Zones', areas: 59, costPerDay: 21908.54, vatPerDay: 3286.28, dailyTotal: 25194.82, monthlyValue: 657256.14, monthlyVat: 98588.42, monthlyTotal: 755844.56 },
            ]
        },
        {
            days: 29,
            rows: [
                { zoneLevel: 'Critical Zones', areas: 41, costPerDay: 34455.62, vatPerDay: 5168.34, dailyTotal: 39623.97, monthlyValue: 999213.07, monthlyVat: 149881.96, monthlyTotal: 1149095.03 },
                { zoneLevel: 'Medium Risk Zones', areas: 24, costPerDay: 23022.53, vatPerDay: 3453.38, dailyTotal: 26475.91, monthlyValue: 667653.37, monthlyVat: 100148.01, monthlyTotal: 767801.38 },
                { zoneLevel: 'Normal Zones', areas: 59, costPerDay: 21908.54, vatPerDay: 3286.28, dailyTotal: 25194.82, monthlyValue: 613439.06, monthlyVat: 92015.86, monthlyTotal: 730649.74 },
            ]
        },
        {
            days: 28,
            rows: [
                { zoneLevel: 'Critical Zones', areas: 41, costPerDay: 34455.62, vatPerDay: 5168.34, dailyTotal: 39623.97, monthlyValue: 964757.44, monthlyVat: 144713.62, monthlyTotal: 1109471.06 },
                { zoneLevel: 'Medium Risk Zones', areas: 24, costPerDay: 23022.53, vatPerDay: 3453.38, dailyTotal: 26475.91, monthlyValue: 644630.84, monthlyVat: 96694.63, monthlyTotal: 741325.47 },
                { zoneLevel: 'Normal Zones', areas: 59, costPerDay: 21908.54, vatPerDay: 3286.28, dailyTotal: 25194.82, monthlyValue: 613439.06, monthlyVat: 92015.86, monthlyTotal: 705454.92 },
            ]
        }
    ];

    const cleaningSuppliesData: SupplyItem[] = [
        { no: 1, name: 'Roll Tissue', unit: 'Dozen (12 pcs)', qty: 700 },
        { no: 2, name: 'Roll Tissue', unit: 'Dozen (12 pcs)', qty: 700 },
        { no: 3, name: 'Paper Tissue', unit: 'Box (24 pcs)', qty: 500 },
        { no: 4, name: 'Black Trash Bags 10 Gallons', unit: 'Box (20 kg)', qty: 300 },
        { no: 5, name: 'Black Trash Bags 50 Gallons', unit: 'Box (20 kg)', qty: 300 },
        { no: 6, name: 'Yellow Medical Waste Bags 30 Gallons (150 Micron)', unit: 'Box (20 kg)', qty: 350 },
        { no: 7, name: 'Yellow Medical Waste Bags 50 Gallons (150 Micron)', unit: 'Box (20 kg)', qty: 350 },
        { no: 8, name: 'Black Bags 80 Gallons', unit: 'Box (20 kg)', qty: 400 },
        { no: 9, name: 'Yellow Dust Cloth', unit: 'Piece (21x24 Pak)', qty: 125 },
        { no: 10, name: 'Orange Cloth', unit: 'Piece (21x24 Pak)', qty: 125 },
        { no: 11, name: 'Disposable Cloth', unit: 'Box (5 Packs / 100 pcs each)', qty: 290 },
        { no: 12, name: 'Black Pad 17 inch', unit: 'Piece', qty: 283.4 },
        { no: 13, name: 'White Polishing Pad 17 inch', unit: 'Box (5 pcs)', qty: 180 },
        { no: 14, name: 'Red Polishing Pad 17 inch', unit: 'Box (5 pcs)', qty: 200 },
        { no: 15, name: 'White Pad 20 inch (Super Sonic)', unit: 'Box (5 pcs)', qty: 180 },
        { no: 16, name: 'Rubber Gloves', unit: 'Box', qty: 600 },
        { no: 17, name: 'Hand Soap Regular', unit: 'Box', qty: 433 },
        { no: 18, name: 'Sanitizer Soap', unit: 'Box', qty: 53 },
        { no: 19, name: 'Soap Bars 85g', unit: 'Box', qty: 100 },
        { no: 20, name: 'Auto Air Freshener', unit: 'Dozen (12 pcs)', qty: 33 },
        { no: 21, name: 'Air Freshener Spray', unit: 'Box (48 pcs / 250ml)', qty: 10.4 },
        { no: 22, name: 'Furniture Polish Spray', unit: 'Box (48 pcs / 300ml)', qty: 2.7 },
        { no: 23, name: 'Stainless Steel Polish 300ml', unit: 'Box (48 pcs / 300ml)', qty: 1 },
        { no: 24, name: 'Multipurpose Cleaner', unit: 'Gallon (5 Gal)', qty: 45 },
        { no: 25, name: 'Quaternary Disinfectant', unit: 'Box (5 pcs / 5L)', qty: 135 },
        { no: 26, name: 'Sodium Hypochlorite (Clorox)', unit: 'Box (6 pcs / 3.75L)', qty: 12.5 },
        { no: 27, name: 'Dettol or Equivalent', unit: 'Box (24 pcs / 500ml)', qty: 3.8 },
        { no: 28, name: 'Polish Liquid', unit: 'Box (4 pcs / 5L)', qty: 45 },
        { no: 29, name: 'Wax Remover', unit: 'Box (4 pcs / 5L)', qty: 45 },
        { no: 30, name: 'Floor Sealer', unit: 'Gallon 5L', qty: 120 },
        { no: 31, name: 'Floor Protection Cleaner', unit: 'Gallon 5L', qty: 60 },
        { no: 32, name: 'Carpet Shampoo', unit: 'Box (4 pcs / 5L)', qty: 2.5 },
        { no: 33, name: 'Ceramic Cleaner', unit: 'Box (6 pcs / 750ml)', qty: 83.3 },
        { no: 34, name: 'Glass Cleaner', unit: 'Box (4 pcs / 5L)', qty: 3.7 },
        { no: 35, name: 'Metal Polish', unit: 'Piece', qty: 14 },
        { no: 36, name: 'Bathroom Air Freshener', unit: 'Dozen (12 pcs)', qty: 51.5 },
        { no: 37, name: 'Broom with Brush', unit: 'Piece', qty: 30 },
        { no: 38, name: 'Green Sponge', unit: 'Piece', qty: 500 },
        { no: 39, name: 'Toilet Brush', unit: 'Piece', qty: 30 },
        { no: 40, name: 'Floor Cleaning Brush', unit: 'Piece', qty: 20 },
        { no: 41, name: 'Dry Dust Mop Head', unit: 'Piece', qty: 40 },
        { no: 42, name: 'Wet Mop Head', unit: 'Piece', qty: 40 },
        { no: 43, name: 'Dry Mop Head', unit: 'Piece', qty: 25 },
        { no: 44, name: 'Floor Squeegee', unit: 'Piece', qty: 40 },
        { no: 45, name: 'Glass Squeegee', unit: 'Piece', qty: 40 },
        { no: 46, name: 'Metal Glass Squeegee', unit: 'Piece', qty: 360 },
        { no: 47, name: '24-inch Squeegee Head', unit: 'Piece', qty: 22 },
        { no: 48, name: 'Blue Plastic Bucket 10L', unit: 'Piece', qty: 12 },
        { no: 49, name: 'Red Plastic Bucket 10L', unit: 'Piece', qty: 12 },
        { no: 50, name: 'Hard Brush with Handle', unit: 'Piece', qty: 20 },
        { no: 51, name: 'Dust Mop Cloth', unit: 'Piece', qty: 200 },
        { no: 52, name: 'Vacuum Filter', unit: 'Piece', qty: 25 },
        { no: 53, name: 'Rubber Warning Tape', unit: 'Roll', qty: 4 },
        { no: 54, name: 'Measuring Cup', unit: 'Piece', qty: 25 },
        { no: 55, name: 'Warning Sign', unit: 'Piece', qty: 18 },
        { no: 56, name: 'Entrance Mat (as per Health Specification)', unit: 'Piece/m²', qty: 10 },
    ];

    const equipmentData: SupplyItem[] = [
        { no: 1, name: 'عربة بدلو وحيد لتنظيف الأرضيات', unit: 'قطعة', qty: 200 },
        { no: 2, name: 'عربة بدلو مزدوج لتنظيف الأرضيات', unit: 'قطعة', qty: 200 },
        { no: 3, name: 'عربة خدمة خاصة لحمل أدوات النظافة بمفتاح (مطاط)', unit: 'قطعة', qty: 200 },
        { no: 4, name: 'مكائن تلميع (1500 إلى 2000 دورة/الدقيقة - 20 بوصة) لحك وجلي الأرضيات', unit: 'قطعة', qty: 35 },
        { no: 5, name: 'مكائن صقل (17 بوصة) لحك وجلي الأرضيات', unit: 'قطعة', qty: 30 },
        { no: 6, name: 'مكنسة كهربائية لشفط المياه من الأرضيات', unit: 'قطعة', qty: 25 },
        { no: 7, name: 'مكنسة كهربائية لتنظيف السجاد', unit: 'قطعة', qty: 20 },
        { no: 8, name: 'عربات صفراء لنقل النفايات الملوثة (750 كغم)', unit: 'قطعة', qty: 45 },
        { no: 9, name: 'عربات أسود لنقل النفايات العادية (750 كغم)', unit: 'قطعة', qty: 45 },
        { no: 10, name: 'سلم بثلاث عتبات', unit: 'قطعة', qty: 20 },
        { no: 11, name: 'سلم بخمس عتبات', unit: 'قطعة', qty: 20 },
        { no: 12, name: 'ماكينة مروحة لتجفيف الأرضيات (ايربلور)', unit: 'قطعة', qty: 18 },
        { no: 13, name: 'حاوية نفايات استيل (أنواع، غير قابلة للصدأ ومقاومة للحريق، الحجم 50 جالون بغطاء)*', unit: 'قطعة', qty: 300 },
        { no: 14, name: 'حاوية نفايات استيل (أنواع، غير قابلة للصدأ ومقاومة للحريق، الحجم 30 جالون بغطاء)*', unit: 'قطعة', qty: 1200 },
        { no: 15, name: 'حاوية نفايات استيل (أنواع، غير قابلة للصدأ ومقاومة للحريق، الحجم 20 جالون بغطاء)*', unit: 'قطعة', qty: 1000 },
        { no: 16, name: 'عربة توريد مواد تموينية', unit: 'قطعة', qty: 50 },
        { no: 17, name: 'مكينة حك وجلي الارضيات بسائق', unit: 'قطعة', qty: 2 },
        { no: 18, name: 'ماكينة شامبو لغسيل السجاد', unit: 'قطعة', qty: 4 },
        { no: 19, name: 'مضخة مياه بضغط عالي', unit: 'قطعة', qty: 8 },
        { no: 20, name: 'حامل معطرات مواقع البول و دورات المياه', unit: 'قطعة', qty: 700 },
        { no: 21, name: 'حامل معطرات الجو الأوتوماتيكية', unit: 'قطعة', qty: 500 },
        { no: 22, name: 'حاويات نفايات سعة 250 ليتر رمادي للنفايات الغير طبية', unit: 'قطعة', qty: 200 },
        { no: 23, name: 'حاويات نفايات سعة 250 ليتر اصفر للنفايات الطبية', unit: 'قطعة', qty: 150 },
    ];

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const ContractTable: React.FC<{ data: ContractTableData }> = ({ data }) => {
        const totals = data.rows.reduce((acc, row) => ({
            costPerDay: acc.costPerDay + row.costPerDay,
            vatPerDay: acc.vatPerDay + row.vatPerDay,
            dailyTotal: acc.dailyTotal + row.dailyTotal,
            monthlyValue: acc.monthlyValue + row.monthlyValue,
            monthlyVat: acc.monthlyVat + row.monthlyVat,
            monthlyTotal: acc.monthlyTotal + row.monthlyTotal
        }), { 
            costPerDay: 0, 
            vatPerDay: 0, 
            dailyTotal: 0, 
            monthlyValue: 0, 
            monthlyVat: 0, 
            monthlyTotal: 0 
        });

        return (
            <div className="mb-8 last:mb-0">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 border-b-2 border-brand-teal pb-1 inline-block">
                    {data.days} {t('days')}
                </h3>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-brand-blue-dark text-white uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 min-w-[50px]">{t('days')}</th>
                                <th className="px-4 py-3 min-w-[150px]">{t('zoneLevel')}</th>
                                <th className="px-4 py-3 text-center">{t('areas')}</th>
                                <th className="px-4 py-3 text-right">{t('costPerDay')}</th>
                                <th className="px-4 py-3 text-right">{t('vatPerDay')}</th>
                                <th className="px-4 py-3 text-right">{t('dailyTotal')}</th>
                                <th className="px-4 py-3 text-right bg-brand-teal">{t('monthlyValue')}</th>
                                <th className="px-4 py-3 text-right bg-brand-teal">{t('monthlyVat')}</th>
                                <th className="px-4 py-3 text-right bg-brand-teal font-bold">{t('monthlyTotal')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {data.rows.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-medium">{data.days}</td>
                                    <td className="px-4 py-3 font-semibold text-brand-blue-dark dark:text-brand-green">{row.zoneLevel}</td>
                                    <td className="px-4 py-3 text-center">{row.areas}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(row.costPerDay)}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(row.vatPerDay)}</td>
                                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.dailyTotal)}</td>
                                    <td className="px-4 py-3 text-right bg-gray-50 dark:bg-gray-700/50">{formatCurrency(row.monthlyValue)}</td>
                                    <td className="px-4 py-3 text-right bg-gray-50 dark:bg-gray-700/50">{formatCurrency(row.monthlyVat)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-brand-blue bg-blue-50 dark:bg-blue-900/10">{formatCurrency(row.monthlyTotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100 dark:bg-gray-900 font-bold border-t-2 border-gray-300 dark:border-gray-600">
                            <tr>
                                <td colSpan={3} className="px-4 py-3 text-right text-brand-blue-dark dark:text-brand-green uppercase text-base">{t('total')}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(totals.costPerDay)}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(totals.vatPerDay)}</td>
                                <td className="px-4 py-3 text-right text-brand-blue">{formatCurrency(totals.dailyTotal)}</td>
                                <td className="px-4 py-3 text-right bg-gray-200 dark:bg-gray-800">{formatCurrency(totals.monthlyValue)}</td>
                                <td className="px-4 py-3 text-right bg-gray-200 dark:bg-gray-800">{formatCurrency(totals.monthlyVat)}</td>
                                <td className="px-4 py-3 text-right bg-brand-teal text-white">{formatCurrency(totals.monthlyTotal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    const SuppliesTable: React.FC = () => {
        const [isExpanded, setIsExpanded] = useState(false);

        return (
            <div className="mt-8 no-break-inside">
                <div 
                    className="flex items-center cursor-pointer group mb-4 select-none"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="p-1.5 rounded-full bg-brand-teal text-white me-3 transition-transform duration-200 hover:scale-110 no-print flex items-center justify-center">
                        {isExpanded ? <Minus size={18} /> : <Plus size={18} />}
                    </div>
                    <h3 className="text-xl font-bold text-brand-blue-dark dark:text-brand-green border-b-2 border-brand-teal pb-1 inline-block">
                        {t('cleaningSuppliesList')}
                    </h3>
                </div>
                
                <div className={`${isExpanded ? 'block' : 'hidden'} print-block transition-all duration-300`}>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-brand-blue text-white uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 w-16">{t('no')}</th>
                                    <th className="px-4 py-3">{t('itemName')}</th>
                                    <th className="px-4 py-3">{t('unit')}</th>
                                    <th className="px-4 py-3 text-center">{t('quantity')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {cleaningSuppliesData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3 text-center">{item.no}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.name}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.unit}</td>
                                        <td className="px-4 py-3 text-center font-semibold">{item.qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const EquipmentTable: React.FC = () => {
        const [isExpanded, setIsExpanded] = useState(false);
        
        const totalQty = equipmentData.reduce((sum, item) => sum + Number(item.qty), 0);

        return (
            <div className="mt-8 no-break-inside">
                <div 
                    className="flex items-center cursor-pointer group mb-4 select-none"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="p-1.5 rounded-full bg-brand-teal text-white me-3 transition-transform duration-200 hover:scale-110 no-print flex items-center justify-center">
                        {isExpanded ? <Minus size={18} /> : <Plus size={18} />}
                    </div>
                    <h3 className="text-xl font-bold text-brand-blue-dark dark:text-brand-green border-b-2 border-brand-teal pb-1 inline-block">
                        {t('equipmentDevicesList')}
                    </h3>
                </div>
                
                <div className={`${isExpanded ? 'block' : 'hidden'} print-block transition-all duration-300`}>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-brand-blue text-white uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 w-16">{t('no')}</th>
                                    <th className="px-4 py-3">{t('itemName')}</th>
                                    <th className="px-4 py-3">{t('unit')}</th>
                                    <th className="px-4 py-3 text-center">{t('quantity')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {equipmentData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3 text-center">{item.no}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.name}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.unit}</td>
                                        <td className="px-4 py-3 text-center font-semibold">{item.qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100 dark:bg-gray-900 font-bold border-t-2 border-gray-300 dark:border-gray-600">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right text-brand-blue-dark dark:text-brand-green uppercase text-base">{t('total')}</td>
                                    <td className="px-4 py-3 text-center bg-brand-teal text-white text-lg">{totalQty.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-gray-200">{t('contractDetails')}</h1>
                <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 no-print">
                    <Printer size={16} className="me-2"/> Print
                </button>
            </div>

            <Card>
                <h2 className="text-2xl font-bold text-center text-brand-blue mb-8 uppercase tracking-wide border-b-4 border-brand-blue-dark pb-4">
                    {t('maintenanceCleaningContract')}
                </h2>
                
                <div className="space-y-8">
                    {contractData.map((tableData, index) => (
                        <ContractTable key={index} data={tableData} />
                    ))}
                </div>

                <SuppliesTable />
                <EquipmentTable />
            </Card>
        </div>
    );
};

export default ContractDetailsPage;
