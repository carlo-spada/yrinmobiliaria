import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type OrgValue = string | 'all' | null;

const STORAGE_KEY = 'admin-selected-org';

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

const getStoredOrgId = (canViewAll: boolean, fallbackOrgId: string | null): OrgValue => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Validate stored value
      if (stored === 'all' && canViewAll) return 'all';
      if (stored !== 'all') return stored;
    }
  } catch {
    // localStorage not available
  }
  return canViewAll ? 'all' : fallbackOrgId;
};

export const AdminOrgProvider = ({
  children,
  organizationId,
  canViewAll,
}: AdminOrgProviderProps) => {
  const [selectedOrgId, setSelectedOrgIdState] = useState<OrgValue>(() =>
    getStoredOrgId(canViewAll, organizationId)
  );

  // Wrapper to persist selection
  const setSelectedOrgId = (orgId: OrgValue) => {
    setSelectedOrgIdState(orgId);
    try {
      if (orgId) {
        localStorage.setItem(STORAGE_KEY, orgId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage not available
    }
  };

  // Keep selection in sync with role/org changes (e.g., after login or role swap)
  useEffect(() => {
    setSelectedOrgIdState((prev) => {
      if (canViewAll) {
        // If user can view all, keep their preference unless it was never set
        return prev ?? 'all';
      }
      // Non-superadmins are locked to their org
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
