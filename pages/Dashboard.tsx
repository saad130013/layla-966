
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { UserRole } from '../types';
import InspectorDashboard from '../components/dashboard/InspectorDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';

const Dashboard: React.FC = () => {
  const { user } = useContext(AppContext);

  if (!user) return null;

  return user.role === UserRole.Inspector ? <InspectorDashboard /> : <ManagerDashboard />;
};

export default Dashboard;
