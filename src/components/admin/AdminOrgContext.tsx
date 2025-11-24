import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type OrgValue = string | 'all' | null;

interface AdminOrgContextValue {
  selectedOrgId: OrgValue;
  setSelectedOrgId: (orgId: OrgValue) => void;
  /**
   * Organization that should be applied to queries.
   * Superadmins get `null` when "all" is selected to avoid filtering.
   */
  effectiveOrgId: string | null;
  isAllOrganizations: boolean;
  canViewAll: boolean;
}

const AdminOrgContext = createContext<AdminOrgContextValue | undefined>(undefined);

interface AdminOrgProviderProps {
  children: ReactNode;
  organizationId: string | null;
  canViewAll: boolean;
}

export const AdminOrgProvider = ({
  children,
  organizationId,
  canViewAll,
}: AdminOrgProviderProps) => {
  const [selectedOrgId, setSelectedOrgId] = useState<OrgValue>(
    canViewAll ? 'all' : organizationId,
  );

  // Keep selection in sync with role/org changes (e.g., after login or role swap)
  useEffect(() => {
    setSelectedOrgId((prev) => {
      if (canViewAll) {
        return prev ?? 'all';
      }
      return organizationId;
    });
  }, [canViewAll, organizationId]);

  const value = useMemo<AdminOrgContextValue>(() => {
    const isAllOrganizations = canViewAll && selectedOrgId === 'all';
    return {
      selectedOrgId,
      setSelectedOrgId,
      effectiveOrgId: isAllOrganizations ? null : (selectedOrgId as string | null),
      isAllOrganizations,
      canViewAll,
    };
  }, [canViewAll, selectedOrgId]);

  return <AdminOrgContext.Provider value={value}>{children}</AdminOrgContext.Provider>;
};

export const useAdminOrg = () => {
  const context = useContext(AdminOrgContext);
  if (!context) {
    throw new Error('useAdminOrg must be used within AdminOrgProvider');
  }
  return context;
};
