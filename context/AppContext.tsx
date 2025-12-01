
import React, { createContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { User, UserRole, InspectionReport, ReportStatus, Zone, Location, InspectionForm, Notification, CDR, PenaltyInvoice, PenaltyStatus, GlobalPenaltyStatement } from '../types';
import { USERS, ZONES, LOCATIONS, FORMS, INITIAL_REPORTS, INITIAL_NOTIFICATIONS, INITIAL_CDRS } from '../constants';

interface AppContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  changePassword: (userId: string, oldPassword: string, newPassword: string) => boolean;
  reports: InspectionReport[];
  submitReport: (report: InspectionReport) => void;
  updateReport: (report: InspectionReport) => void;
  getReportById: (id: string) => InspectionReport | undefined;
  getInspectorById: (id: string) => User | undefined;
  getLocationById: (id: string) => Location | undefined;
  getZoneByLocationId: (locationId: string) => Zone | undefined;
  getFormById: (formId: string) => InspectionForm | undefined;
  zones: Zone[];
  locations: Location[];
  forms: InspectionForm[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  cdrs: CDR[];
  addCDR: (cdr: CDR) => void;
  updateCDR: (cdr: CDR) => void;
  getCDRById: (id: string) => CDR | undefined;
  // Penalty Invoices
  penaltyInvoices: PenaltyInvoice[];
  addPenaltyInvoice: (invoice: PenaltyInvoice) => void;
  updatePenaltyInvoice: (invoice: PenaltyInvoice) => void;
  getPenaltyInvoiceById: (id: string) => PenaltyInvoice | undefined;
  // Global Penalty Statements
  globalPenaltyStatements: GlobalPenaltyStatement[];
  addGlobalPenaltyStatement: (stmt: GlobalPenaltyStatement) => void;
  updateGlobalPenaltyStatement: (stmt: GlobalPenaltyStatement) => void;
  getGlobalPenaltyStatementById: (id: string) => GlobalPenaltyStatement | undefined;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(USERS);
  const [reports, setReports] = useState<InspectionReport[]>(INITIAL_REPORTS);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [cdrs, setCdrs] = useState<CDR[]>(INITIAL_CDRS);
  const [penaltyInvoices, setPenaltyInvoices] = useState<PenaltyInvoice[]>([]);
  const [globalPenaltyStatements, setGlobalPenaltyStatements] = useState<GlobalPenaltyStatement[]>([]);

  const login = useCallback((username: string, password: string): boolean => {
    // Robust check: trim whitespace and lowercase username
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const foundUser = users.find(u => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addUser = useCallback((userToAdd: Omit<User, 'id'>) => {
    const newUser: User = { ...userToAdd, id: `user-${Date.now()}` };
    setUsers(prev => [...prev, newUser]);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user?.id === updatedUser.id) {
        setUser(updatedUser);
    }
  }, [user]);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const changePassword = useCallback((userId: string, oldPassword: string, newPassword: string): boolean => {
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate && userToUpdate.password === oldPassword) {
      const updatedUser = { ...userToUpdate, password: newPassword };
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      if (user?.id === userId) {
        setUser(updatedUser);
      }
      return true;
    }
    return false;
  }, [users, user]);
  
  const submitReport = useCallback((report: InspectionReport) => {
    setReports(prev => [...prev, report]);
  }, []);

  const updateReport = useCallback((updatedReport: InspectionReport) => {
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);
  
  const getReportById = useCallback((id: string) => reports.find(r => r.id === id), [reports]);
  
  const getInspectorById = useCallback((id: string) => users.find(u => u.id === id), [users]);
  
  const getLocationById = useCallback((id: string) => LOCATIONS.find(l => l.id === id), []);

  const getZoneByLocationId = useCallback((locationId: string) => {
    const location = LOCATIONS.find(l => l.id === locationId);
    return location ? ZONES.find(z => z.id === location.zoneId) : undefined;
  }, []);

  const getFormById = useCallback((formId: string) => FORMS.find(f => f.id === formId), []);
  
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // CDR Management
  const addCDR = useCallback((cdr: CDR) => {
    setCdrs(prev => [cdr, ...prev]);
  }, []);

  const updateCDR = useCallback((updatedCDR: CDR) => {
    setCdrs(prev => prev.map(c => c.id === updatedCDR.id ? updatedCDR : c));
  }, []);
  
  const getCDRById = useCallback((id: string) => cdrs.find(c => c.id === id), [cdrs]);

  // Penalty Invoice Management
  const addPenaltyInvoice = useCallback((invoice: PenaltyInvoice) => {
      setPenaltyInvoices(prev => [invoice, ...prev]);
  }, []);

  const updatePenaltyInvoice = useCallback((invoice: PenaltyInvoice) => {
      setPenaltyInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
  }, []);

  const getPenaltyInvoiceById = useCallback((id: string) => penaltyInvoices.find(inv => inv.id === id), [penaltyInvoices]);

  // Global Penalty Statement Management
  const addGlobalPenaltyStatement = useCallback((stmt: GlobalPenaltyStatement) => {
    setGlobalPenaltyStatements(prev => [stmt, ...prev]);
  }, []);

  const updateGlobalPenaltyStatement = useCallback((updatedStmt: GlobalPenaltyStatement) => {
    setGlobalPenaltyStatements(prev => prev.map(s => s.id === updatedStmt.id ? updatedStmt : s));
  }, []);

  const getGlobalPenaltyStatementById = useCallback((id: string) => globalPenaltyStatements.find(s => s.id === id), [globalPenaltyStatements]);


  const value = useMemo(() => ({
    user,
    users,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    changePassword,
    reports,
    submitReport,
    updateReport,
    getReportById,
    getInspectorById,
    getLocationById,
    getZoneByLocationId,
    getFormById,
    zones: ZONES,
    locations: LOCATIONS,
    forms: FORMS,
    theme,
    toggleTheme,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    cdrs,
    addCDR,
    updateCDR,
    getCDRById,
    penaltyInvoices,
    addPenaltyInvoice,
    updatePenaltyInvoice,
    getPenaltyInvoiceById,
    globalPenaltyStatements,
    addGlobalPenaltyStatement,
    updateGlobalPenaltyStatement,
    getGlobalPenaltyStatementById,
  }), [user, users, reports, theme, notifications, cdrs, penaltyInvoices, globalPenaltyStatements, login, logout, addUser, updateUser, deleteUser, changePassword, submitReport, updateReport, getReportById, getInspectorById, getLocationById, getZoneByLocationId, getFormById, toggleTheme, markNotificationAsRead, markAllNotificationsAsRead, addCDR, updateCDR, getCDRById, addPenaltyInvoice, updatePenaltyInvoice, getPenaltyInvoiceById, addGlobalPenaltyStatement, updateGlobalPenaltyStatement, getGlobalPenaltyStatementById]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};