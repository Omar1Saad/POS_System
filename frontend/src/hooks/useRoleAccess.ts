import { useAuth } from '@/contexts/AuthContext';

export const useRoleAccess = () => {
  const { user } = useAuth();

  const hasAdminAccess = () => user?.role === 'admin';
  const hasManagerAccess = () => user?.role === 'manager' || user?.role === 'admin';
  const hasCashierAccess = () => user?.role === 'cashier';
  
  const hasAnalyticsAccess = () => hasManagerAccess();
  
  const canAccessDashboard = () => hasAnalyticsAccess();

  return {
    hasAdminAccess,
    hasManagerAccess,
    hasCashierAccess,
    hasAnalyticsAccess,
    canAccessDashboard,
    userRole: user?.role
  };
};
