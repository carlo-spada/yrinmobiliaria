import { createContext } from 'react';

export type OrgValue = string | 'all' | null;

export interface AdminOrgContextValue {
  selectedOrgId: OrgValue;
  setSelectedOrgId: (orgId: OrgValue) => void;
  effectiveOrgId: string | null;
  isAllOrganizations: boolean;
  canViewAll: boolean;
}

export const AdminOrgContext = createContext<AdminOrgContextValue | undefined>(undefined);
