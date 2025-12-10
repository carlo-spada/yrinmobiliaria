import { useContext } from 'react';

import { AdminOrgContext } from './AdminOrgContextBase';

export function useAdminOrg() {
  const context = useContext(AdminOrgContext);
  if (!context) {
    throw new Error('useAdminOrg must be used within AdminOrgProvider');
  }
  return context;
}
