
import { User, UserRole, Zone, RiskCategory, Location, InspectionForm, EvaluationItem, InspectionReport, ReportStatus, Notification, CDR, CDRStatus, CDRIncidentType, CDRServiceType, CDRManagerDecision } from './types';

export const USERS: User[] = [
  { id: 'user1', name: 'Mohammed Ali', username: 'mali', password: 'password123', role: UserRole.Inspector },
  { id: 'user2', name: 'Fatima Saad', username: 'fsaad', password: 'password123', role: UserRole.Inspector },
  { id: 'user4', name: 'ليلى العتيبي', username: 'lotaibi', password: 'password123', role: UserRole.Inspector },
  { id: 'user5', name: 'Khalid Alghamdi', username: 'kghamdi', password: 'password123', role: UserRole.Inspector },
  { id: 'user3', name: 'Manager Ahmed', username: 'manager', password: 'admin123', role: UserRole.Supervisor },
];

export const ZONES: Zone[] = [
  { id: 'zone_high', name: 'Critical Areas', riskCategory: RiskCategory.High },
  { id: 'zone_medium', name: 'Medium Risk Areas', riskCategory: RiskCategory.Medium },
  { id: 'zone_low', name: 'General Areas', riskCategory: RiskCategory.Low },
];

const DEFECT_KEYS = ['defect_dust', 'defect_stains', 'defect_rust', 'defect_needs_cleaning', 'defect_needs_maintenance'];

const highRiskItems: EvaluationItem[] = [
    { id: 'hr_item_1', name: 'hr_item_1', maxScore: 6, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_2', name: 'hr_item_2', maxScore: 6, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_3', name: 'hr_item_3', maxScore: 12, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_4', name: 'hr_item_4', maxScore: 12, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_5', name: 'hr_item_5', maxScore: 6, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_6', name: 'hr_item_6', maxScore: 5, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_7', name: 'hr_item_7', maxScore: 6, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_8', name: 'hr_item_8', maxScore: 7, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_9', name: 'hr_item_9', maxScore: 10, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_10', name: 'hr_item_10', maxScore: 7, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_11', name: 'hr_item_11', maxScore: 5, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_12', name: 'hr_item_12', maxScore: 4, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_13', name: 'hr_item_13', maxScore: 5, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_14', name: 'hr_item_14', maxScore: 5, predefinedDefects: DEFECT_KEYS },
    { id: 'hr_item_15', name: 'hr_item_15', maxScore: 4, predefinedDefects: DEFECT_KEYS },
];

const mediumRiskItems: EvaluationItem[] = [
    { id: 'mr_item_1', name: 'mr_item_1', maxScore: 3, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_2', name: 'mr_item_2', maxScore: 6, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_3', name: 'mr_item_3', maxScore: 6, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_4', name: 'mr_item_4', maxScore: 4, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_5', name: 'mr_item_5', maxScore: 10, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_6', name: 'mr_item_6', maxScore: 7, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_7', name: 'mr_item_7', maxScore: 5, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_8', name: 'mr_item_8', maxScore: 6, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_9', name: 'mr_item_9', maxScore: 6, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_10', name: 'mr_item_10', maxScore: 10, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_11', name: 'mr_item_11', maxScore: 9, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_12', name: 'mr_item_12', maxScore: 7, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_13', name: 'mr_item_13', maxScore: 5, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_14', name: 'mr_item_14', maxScore: 4, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_15', name: 'mr_item_15', maxScore: 5, predefinedDefects: DEFECT_KEYS },
    { id: 'mr_item_16', name: 'mr_item_16', maxScore: 4, predefinedDefects: DEFECT_KEYS },
];

const lowRiskItems: EvaluationItem[] = [
    { id: 'lr_item_1', name: 'lr_item_1', maxScore: 6, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_2', name: 'lr_item_2', maxScore: 10, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_3', name: 'lr_item_3', maxScore: 8, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_4', name: 'lr_item_4', maxScore: 4, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_5', name: 'lr_item_5', maxScore: 10, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_6', name: 'lr_item_6', maxScore: 7, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_7', name: 'lr_item_7', maxScore: 5, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_8', name: 'lr_item_8', maxScore: 7, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_9', name: 'lr_item_9', maxScore: 7, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_10', name: 'lr_item_10', maxScore: 6, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_11', name: 'lr_item_11', maxScore: 6, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_12', name: 'lr_item_12', maxScore: 5, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_13', name: 'lr_item_13', maxScore: 10, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_14', name: 'lr_item_14', maxScore: 5, predefinedDefects: DEFECT_KEYS },
    { id: 'lr_item_15', name: 'lr_item_15', maxScore: 4, predefinedDefects: DEFECT_KEYS },
];


export const FORMS: InspectionForm[] = [
  { id: 'form1', name: 'High-Risk Area Inspection Form', items: highRiskItems },
  { id: 'form2', name: 'Medium-Risk Area Inspection Form', items: mediumRiskItems },
  { id: 'form3', name: 'Low-Risk Area Inspection Form', items: lowRiskItems },
];

export const LOCATIONS: Location[] = [
  // High Risk
  { id: 'loc_h_1', name: { ar: 'جناح 8-7، NTCC', en: 'Ward 7-8, NTCC' }, zoneId: 'zone_high', formId: 'form1' },
  { id: 'loc_h_2', name: { ar: 'جناح 23-22، مبنى السموم', en: 'Ward 22-23, Toxicology Bldg' }, zoneId: 'zone_high', formId: 'form1' },
  { id: 'loc_h_3', name: { ar: 'جناح 6-13-14-15، منطقة الطوارئ', en: 'Ward 6-13-14-15, ER Area' }, zoneId: 'zone_high', formId: 'form1' },
  { id: 'loc_h_4', name: { ar: 'جناح 5، CSSD', en: 'Ward 5, CSSD' }, zoneId: 'zone_high', formId: 'form1' },
  { id: 'loc_h_5', name: { ar: 'جناح 24-25، منطقة الطوارئ، NTCC قسم الولادة', en: 'Ward 24-25, ER Area, NTCC Labor Rm' }, zoneId: 'zone_high', formId: 'form1' },
  { id: 'loc_h_6', name: { ar: 'جناح 17-18-20، وحدة العناية المركزة وأجنحتها', en: 'Ward 17-18-20, ICU & Wings' }, zoneId: 'zone_high', formId: 'form1' },
  
  // Medium Risk
  { id: 'loc_m_1', name: { ar: 'مركز الأميرة نورة (طابقين)', en: 'Princess Noura Center (2 Floors)' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_2', name: { ar: 'وحدة عناية المرأة وأجنحتها', en: 'Women\'s Care Unit & Wings' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_3', name: { ar: 'وحدة علاج NTCC', en: 'NTCC Treatment Unit' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_4', name: { ar: 'غرف العمليات الرئيسية', en: 'Main Operating Rooms' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_5', name: { ar: 'MC1-MC3، مركز القلب (ثلاثة طوابق)', en: 'MC1-MC3, Heart Center (3 Floors)' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_6', name: { ar: 'غرف العمليات الرئيسية، NTCC إصابات الحرائق', en: 'Main OR, NTCC Burns Unit' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_7', name: { ar: 'غرف العمليات جميع الأجنحة', en: 'All OR Wings' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_8', name: { ar: 'قيادة الطب العسكري الميداني', en: 'Field Military Medicine Command' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_9', name: { ar: 'إدارة المشاريع الداخلية', en: 'Internal Projects Dept.' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_10', name: { ar: 'كل الممرات والحمامات، MC4', en: 'All Corridors & Toilets, MC4' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_11', name: { ar: 'قسم التغذية', en: 'Nutrition Department' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_12', name: { ar: 'قسم التخدير', en: 'Anesthesia Department' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_13', name: { ar: 'قاعة الرازي', en: 'Al-Razi Hall' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_14', name: { ar: 'مغسلة الموتى', en: 'Morgue' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_15', name: { ar: 'منطقة إدارة الصيانة والمشاريع الخارجية', en: 'External Maintenance & Projects Area' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_16', name: { ar: 'غرف النفايات العامة', en: 'General Waste Rooms' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_17', name: { ar: 'مكاتب الإدارة الطبية، NTCC', en: 'Medical Admin Offices, NTCC' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_18', name: { ar: 'غرف الحراس والبوابات، الأشعة بجميع أنواعها', en: 'Guard Rooms, Gates, All Radiology' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_19', name: { ar: 'المبنى الإداري الجديد', en: 'New Admin Building' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_20', name: { ar: 'محطة التبريد (الأعصاب)', en: 'Chiller Plant (Neurology)' }, zoneId: 'zone_medium', formId: 'form2' },
  { id: 'loc_m_21', name: { ar: 'قسم التمريض', en: 'Nursing Department' }, zoneId: 'zone_medium', formId: 'form2' },

  // Low Risk
  { id: 'loc_l_1', name: { ar: 'جميع الحدائق بالمستشفى', en: 'All Hospital Gardens' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_2', name: { ar: 'مركز الأميرة نورة، قسم الأسنان', en: 'Princess Noura Center, Dental' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_3', name: { ar: 'جناح 16، العلاج', en: 'Ward 16, Therapy' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_4', name: { ar: 'MFUM، جناح 1-2-3-4', en: 'MFUM, Ward 1-2-3-4' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_5', name: { ar: 'الخدمة الاجتماعية والشؤون الأكاديمية', en: 'Social Service & Academic Affairs' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_6', name: { ar: 'جناح 11-12، مبنى العيادات الخارجية (ثلاثة طوابق)', en: 'Ward 11-12, Outpatient Clinics (3 Floors)' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_7', name: { ar: 'جناح 28-30-31، جراحة المسالك البولية', en: 'Ward 28-30-31, Urology' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_8', name: { ar: 'جناح الإفاقة', en: 'Recovery Ward' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_9', name: { ar: 'إدارة الرعاية الصحية', en: 'Healthcare Administration' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_10', name: { ar: 'المسجد الرئيسي', en: 'Main Mosque' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_11', name: { ar: 'الغرف التعليمية والمكتبة', en: 'Education Rooms & Library' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_12', name: { ar: 'الأشعة الرئيسية والأقسام التابعة', en: 'Main Radiology & Sub-departments' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_13', name: { ar: 'مركز التبرع بالدم', en: 'Blood Donation Center' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_14', name: { ar: 'جناح 40-41-50-51، المختبر المركزي الجديد', en: 'Ward 40-41-50-51, New Central Lab' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_15', name: { ar: 'غرف الانتظار الخارجية', en: 'External Waiting Rooms' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_16', name: { ar: 'مواقف السيارات الزوار', en: 'Visitor Parking' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_17', name: { ar: 'غرف الأطباء المناوبين رجال ونساء', en: 'On-call Doctors Rooms (M/F)' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_18', name: { ar: 'مصليات النساء', en: 'Female Prayer Rooms' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_19', name: { ar: 'CSSD - NTCC - عمليات اليوم الواحد', en: 'CSSD - NTCC - Day Surgery' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_20', name: { ar: 'قاعة الإندجاني', en: 'Al-Endijani Hall' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_21', name: { ar: 'جميع الصيدليات', en: 'All Pharmacies' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_22', name: { ar: 'مواقف السيارات المبنى الإداري', en: 'Admin Building Parking' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_23', name: { ar: 'مصليات العلاج', en: 'Therapy Prayer Rooms' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_24', name: { ar: 'PENT HOUSE', en: 'Penthouse' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_25', name: { ar: 'Pergola medical', en: 'Medical Pergola' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_26', name: { ar: 'Guest House', en: 'Guest House' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_27', name: { ar: 'الطبيعي القديم', en: 'Old Natural Therapy' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_28', name: { ar: 'مكاتب أهلية العلاج', en: 'Private Therapy Offices' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_29', name: { ar: 'الصيدلة الداخلية الرئيسية', en: 'Main Inpatient Pharmacy' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_30', name: { ar: 'إدارة المواصلات', en: 'Transportation Dept.' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_31', name: { ar: 'قسم الأعمال والتموين', en: 'Business & Catering Dept.' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_32', name: { ar: 'Pergola admin', en: 'Admin Pergola' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_33', name: { ar: 'مركز المعلومات', en: 'Information Center' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_34', name: { ar: 'بنك الدم', en: 'Blood Bank' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_35', name: { ar: 'سنترال', en: 'Central Office' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_36', name: { ar: 'Day Care', en: 'Day Care' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_37', name: { ar: 'التنسيق الطبي', en: 'Medical Coordination' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_38', name: { ar: 'مكاتب إدارة المشاريع', en: 'Project Management Offices' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_39', name: { ar: 'PHC الطب الميداني الجديد', en: 'PHC New Field Medicine' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_40', name: { ar: 'مواقف مركز الأعصاب والطوارئ', en: 'Neurology & ER Parking' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_41', name: { ar: 'إدارة MC2 والصيانة والأجهزة الطبية', en: 'MC2, Maintenance & Medical Eq. Mgmt.' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_42', name: { ar: 'مبنى المولدات (الأعصاب)', en: 'Generator Building (Neurology)' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_43', name: { ar: 'البريد والمالية والتحقيق والممتلكات والعقود', en: 'Mail, Finance, Investigation, Property, Contracts' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_44', name: { ar: 'مواقف السيارات العلاج الطبيعي', en: 'Physical Therapy Parking' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_45', name: { ar: 'مكاتب مكافحة العدوى والاتصالات', en: 'Infection Control & Comm. Offices' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_46', name: { ar: 'مسجد ومواقف العلاج الطبيعي', en: 'Physical Therapy Mosque & Parking' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_47', name: { ar: 'إسكان الحرس الوطني بجدة', en: 'National Guard Housing, Jeddah' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_48', name: { ar: 'مراكز صحية (أم السلم، الشرائع، بحرة، الطائف، جازان)', en: 'Health Centers (Umm Al-Salam, etc.)' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_49', name: { ar: 'مركز الطب الوقائي', en: 'Preventive Medicine Center' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_50', name: { ar: 'عيادة PHC', en: 'PHC Clinic' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_51', name: { ar: 'PHC supervisor\'s', en: 'PHC Supervisor\'s Office' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_52', name: { ar: 'مبنى الغلايات (الأعصاب)', en: 'Boiler Building (Neurology)' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_53', name: { ar: 'مسجد الطائف', en: 'Taif Mosque' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_54', name: { ar: 'عيادة CMC', en: 'CMC Clinic' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_55', name: { ar: 'مركز التدريب', en: 'Training Center' }, zoneId: 'zone_low', formId: 'form3' },
  { id: 'loc_l_56', name: { ar: 'مركز العيادات التخصصية الشاملة', en: 'Comprehensive Specialty Clinics Center' }, zoneId: 'zone_low', formId: 'form3' },
];

// CDR Constants
export const SERVICE_TYPES: CDRServiceType[] = Object.values(CDRServiceType);
export const MANPOWER_DISCREPANCY_OPTIONS = ['Not aware of EVS mission', 'Poor communicator / non-English-speaking staff', 'Uncooperative staff', 'Unauthorized staff / No ID badge', 'Personal hygiene', 'Not approved uniform / No uniform', 'Untrained staff / Not aware of chemical dilution', 'Shortage of staff'];
export const MATERIAL_DISCREPANCY_OPTIONS = ['Using unauthorized supplies', 'Expired items', 'Shortage of supplies', 'No MSDS on site', 'Not maintaining minimum/maximum stock'];
export const EQUIPMENT_DISCREPANCY_OPTIONS = ['Equipment not clean', 'Unauthorized / untagged equipment', 'Improper equipment handling', 'Default of equipment', 'No scheduled maintenance'];
export const ON_SPOT_ACTION_OPTIONS = ['Informing supervisor', 'Stopped procedure', 'Highlighted policy'];
export const ACTION_PLAN_OPTIONS = ['Root cause analysis', 'Process review', 'Implement', 'Involve all stakeholders'];

// Penalty Prices
export const PENALTY_RATES: Record<string, number> = {
  'Not aware of EVS mission': 1000,
  'Uncooperative staff': 500, // As per instruction
  'Poor communicator / non-English-speaking staff': 1000,
  'Unauthorized staff / No ID badge': 3000,
  'Not approved uniform / No uniform': 1500,
  'Shortage of staff': 1000,
  'Untrained staff / Not aware of chemical dilution': 2000,
  'Personal hygiene': 1500,
  
  'Using unauthorized supplies': 2500,
  'Expired items': 300, // As per instruction
  'Shortage of supplies': 800,
  'No MSDS on site': 4000,
  'Not maintaining minimum/maximum stock': 1000,
  
  'Equipment not clean': 1500,
  'Unauthorized / untagged equipment': 4000,
  'Improper equipment handling': 1000,
  'Default of equipment': 2000,
  'No scheduled maintenance': 3000,

  // Fallback
  'Other': 500
};

// =================================================================================================
// DATA GENERATION
// =================================================================================================

const generateItems = (formItems: EvaluationItem[], scoreModifier: number = 0) => {
  const lowScoreItemIndex = scoreModifier < 0 ? Math.floor(Math.random() * formItems.length) : -1;

  return formItems.map((item, index) => {
    let score = Math.max(0, item.maxScore - Math.floor(Math.random() * 2)); // Most scores are good
    if (scoreModifier < 0 && index === lowScoreItemIndex) {
      score = Math.max(0, item.maxScore + scoreModifier * 3);
    } else if (scoreModifier < -1) {
       score = Math.max(0, item.maxScore + scoreModifier);
    }
    
    const hasDefect = score < item.maxScore;

    return {
      itemId: item.id,
      score: score,
      comment: hasDefect ? 'Minor issue noted during inspection.' : 'All clear.',
      defects: hasDefect ? [DEFECT_KEYS[Math.floor(Math.random() * DEFECT_KEYS.length)]] : [],
      photos: [],
    };
  });
};

const generateYearlyData = () => {
    const generatedReports: InspectionReport[] = [];
    const generatedCDRs: CDR[] = [];
    const generatedNotifications: Notification[] = [];
    const inspectors = ['user1', 'user2', 'user4', 'user5'];
    let reportCounter = 1;
    let cdrCounter = 1;

    // Iterate through months Jan (0) to Dec (11) for 2025
    for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(2025, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(2025, month, day);
            const dateStr = date.toISOString().split('T')[0];
            
            // Generate Reports (Random volume per day)
            const numReportsToday = Math.floor(Math.random() * 4) + 1; // 1-4 reports daily

            for (let i = 0; i < numReportsToday; i++) {
                const inspectorId = inspectors[Math.floor(Math.random() * inspectors.length)];
                const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
                const form = FORMS.find(f => f.id === location.formId);
                if (!form) continue;

                const qualityRoll = Math.random();
                let scoreModifier = 0;
                
                // Simulating trends: Summer months (Jun, Jul, Aug) have slightly lower scores
                const isSummer = month >= 5 && month <= 7;
                const failureChance = isSummer ? 0.2 : 0.1;

                if (qualityRoll < failureChance) scoreModifier = -4; // Low score
                else if (qualityRoll < (failureChance + 0.15)) scoreModifier = -2; // Med-Low
                
                const newReport: InspectionReport = {
                    id: `rep_${month}_${day}_${i}`,
                    referenceNumber: `INSP-2025-${(month + 1).toString().padStart(2, '0')}-${String(reportCounter).padStart(3, '0')}`,
                    inspectorId,
                    locationId: location.id,
                    date: new Date(date.getTime() + i * 3600000 + 32400000).toISOString(), // Start at 9 AM + offset
                    status: ReportStatus.Reviewed,
                    items: generateItems(form.items, scoreModifier),
                    supervisorComment: scoreModifier < -1 ? 'Please improve.' : undefined
                };
                generatedReports.push(newReport);
                reportCounter++;

                // Generate CDRs for low scoring reports or randomly
                const shouldGenerateCDR = scoreModifier < -1 || Math.random() > 0.95;

                if (shouldGenerateCDR) {
                    const isPenalty = Math.random() > 0.4; // 60% chance of penalty if CDR is generated
                    const statusRoll = Math.random();
                    let status = CDRStatus.Approved;
                    if (statusRoll > 0.8) status = CDRStatus.Submitted;
                    else if (statusRoll > 0.95) status = CDRStatus.Draft;

                    // Pick random violations for penalties
                    const discrepancies = [];
                    if (Math.random() > 0.5) discrepancies.push('Not approved uniform / No uniform');
                    if (Math.random() > 0.7) discrepancies.push('Expired items');
                    if (Math.random() > 0.8) discrepancies.push('No MSDS on site');
                    if (discrepancies.length === 0) discrepancies.push('Uncooperative staff');

                    const newCDR: CDR = {
                        id: `cdr_${month}_${day}_${i}`,
                        referenceNumber: `CDR-2025-${(month + 1).toString().padStart(2, '0')}-${String(cdrCounter).padStart(3, '0')}`,
                        employeeId: inspectorId,
                        date: dateStr,
                        time: '10:00',
                        locationId: location.id,
                        incidentType: Math.random() > 0.7 ? CDRIncidentType.Repetitive : CDRIncidentType.First,
                        inChargeName: 'Unit Manager',
                        inChargeId: 'U123',
                        inChargeEmail: 'unit@hospital.com',
                        serviceTypes: [CDRServiceType.Housekeeping],
                        manpowerDiscrepancy: isPenalty ? [discrepancies[0]] : [],
                        materialDiscrepancy: isPenalty && discrepancies.length > 1 ? [discrepancies[1]] : [],
                        equipmentDiscrepancy: [],
                        onSpotAction: ['Informing supervisor'],
                        actionPlan: ['Training'],
                        staffComment: 'Violation noted during routine inspection.',
                        attachments: [],
                        employeeSignature: USERS.find(u => u.id === inspectorId)?.name || 'Inspector',
                        status: status,
                        managerDecision: status === CDRStatus.Approved ? (isPenalty ? CDRManagerDecision.Penalty : CDRManagerDecision.Warning) : undefined,
                        managerComment: status === CDRStatus.Approved ? 'Approved.' : undefined,
                        managerSignature: status === CDRStatus.Approved ? 'Manager Ahmed' : undefined,
                        finalizedDate: status === CDRStatus.Approved ? dateStr : undefined
                    };
                    generatedCDRs.push(newCDR);
                    cdrCounter++;

                    // Generate Notification
                    generatedNotifications.push({
                        id: `notif_${month}_${day}_${i}`,
                        type: status === CDRStatus.Approved ? 'info' : 'alert',
                        message: status === CDRStatus.Approved 
                            ? `CDR ${newCDR.referenceNumber} approved.` 
                            : `New CDR ${newCDR.referenceNumber} submitted by ${USERS.find(u => u.id === inspectorId)?.name}.`,
                        timestamp: new Date(date.getTime() + 40000000).toISOString(),
                        isRead: Math.random() > 0.2,
                        link: `/cdr/${newCDR.id}`
                    });
                }
            }
        }
    }
    
    // Sort descending
    generatedReports.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    generatedCDRs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    generatedNotifications.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return { generatedReports, generatedCDRs, generatedNotifications };
};

const { generatedReports, generatedCDRs, generatedNotifications } = generateYearlyData();

export const INITIAL_REPORTS: InspectionReport[] = generatedReports;
export const INITIAL_CDRS: CDR[] = generatedCDRs;
export const INITIAL_NOTIFICATIONS: Notification[] = generatedNotifications;
