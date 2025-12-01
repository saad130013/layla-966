
export enum UserRole {
  Inspector = 'INSPECTOR',
  Supervisor = 'SUPERVISOR',
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

export enum RiskCategory {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export interface Location {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  zoneId: string;
  formId: string;
}

export interface Zone {
  id: string;
  name: string;
  riskCategory: RiskCategory;
}

export interface EvaluationItem {
  id: string;
  name: string;
  maxScore: number;
  predefinedDefects: string[];
}

export interface InspectionForm {
  id:string;
  name:string;
  items: EvaluationItem[];
}

export interface InspectionResultItem {
  itemId: string;
  score: number;
  comment: string;
  defects: string[];
  photos: string[];
}

export enum ReportStatus {
    Draft = 'Draft',
    Submitted = 'Submitted',
    Reviewed = 'Reviewed',
    NeedsAction = 'Needs Corrective Action',
}


export interface InspectionReport {
  id: string;
  referenceNumber: string;
  inspectorId: string;
  locationId: string;
  date: string;
  status: ReportStatus;
  items: InspectionResultItem[];
  supervisorComment?: string;
  subLocations?: string[];
  batchLocationIds?: string[];
}

export interface Language {
  code: 'en' | 'ar';
  name: string;
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export interface Notification {
  id: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

// CDR Types
export enum CDRStatus {
  Draft = 'Draft',
  Submitted = 'Submitted to Manager',
  Approved = 'Approved / Final',
}

export enum CDRIncidentType {
  First = 'First Incident',
  Repetitive = 'Repetitive',
  Routine = 'Routine',
  Investigation = 'Investigation',
}

export enum CDRServiceType {
    Housekeeping = 'Housekeeping',
    Laundry = 'Laundry',
    PestControl = 'Pest Control',
    HazardousWaste = 'Hazardous Material & Medical Waste',
    Horticulture = 'Horticulture',
}

export enum CDRManagerDecision {
    Penalty = 'Penalty',
    Warning = 'Warning',
    Attention = 'Attention',
    NoValidCase = 'No Valid Case',
}

export interface CDR {
  id: string;
  referenceNumber: string;
  employeeId: string;
  date: string;
  time: string;
  locationId: string;
  incidentType: CDRIncidentType;
  inChargeName: string;
  inChargeId: string;
  inChargeEmail: string;
  serviceTypes: CDRServiceType[];
  manpowerDiscrepancy: string[];
  materialDiscrepancy: string[];
  equipmentDiscrepancy: string[];
  onSpotAction: string[];
  actionPlan: string[];
  staffComment: string;
  attachments: string[]; // For simplicity, we'll handle base64 strings
  employeeSignature: string; // Typed name
  status: CDRStatus;
  managerDecision?: CDRManagerDecision;
  managerComment?: string;
  managerSignature?: string;
  finalizedDate?: string;
}

// Penalty Invoice Types
export interface PenaltyItem {
  description: string;
  category: string; // Manpower, Material, etc.
  amount: number;
}

export enum PenaltyStatus {
  Pending = 'Pending Approval',
  Deducted = 'Approved Penalty Case',
}

export interface PenaltyInvoice {
  id: string;
  cdrId: string;
  cdrReference: string;
  dateGenerated: string;
  locationName: string;
  inspectorName: string;
  items: PenaltyItem[];
  totalAmount: number;
  status: PenaltyStatus;
  managerName?: string;
  approvalDate?: string;
  comments?: string;
}

// Global Penalty Statement Types
export enum GlobalPenaltyStatus {
  Draft = 'Draft',
  Approved = 'Approved',
}

export enum GlobalPenaltyItemStatus {
  Approved = 'Approved',
  Rejected = 'Rejected',
  Pending = 'Pending'
}

export interface GlobalPenaltyItem {
  id: string; // unique id for the row
  violationName: string;
  category: string;
  occurrenceCount: number;
  penaltyPerOccurrence: number;
  total: number;
  status: GlobalPenaltyItemStatus;
  managerNotes?: string;
}

export interface GlobalPenaltyStatement {
  id: string;
  referenceNumber: string;
  month: number; // 0-11
  year: number;
  status: GlobalPenaltyStatus;
  contractorName: string;
  generatedDate: string;
  approvedDate?: string;
  approvedBy?: string;
  items: GlobalPenaltyItem[];
  totalAmount: number;
  totalViolations: number;
  totalInvoices?: number;
  managerGeneralComment?: string;
}