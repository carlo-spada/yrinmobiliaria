import { ReactNode, useCallback, useMemo, useSyncExternalStore } from 'react';

import { AdminOrgContext, type AdminOrgContextValue, type OrgValue } from './AdminOrgContextBase';

const STORAGE_KEY = 'admin-selected-org';

interface AdminOrgProviderProps {
  children: ReactNode;
  organizationId: string | null;
  canViewAll: boolean;
}

// External store for localStorage to avoid setState in effects
const storageListeners = new Set<() => void>();

const getStoredValue = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const setStoredValue = (value: OrgValue) => {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage not available
  }
  storageListeners.forEach((listener) => listener());
};

const subscribeToStorage = (callback: () => void) => {
  storageListeners.add(callback);
  return () => storageListeners.delete(callback);
};

export const AdminOrgProvider = ({
  children,
  organizationId,
  canViewAll,
}: AdminOrgProviderProps) => {
  // Use useSyncExternalStore to read from localStorage without setState in effects
  const storedValue = useSyncExternalStore(subscribeToStorage, getStoredValue, () => null);

  // Compute the effective selected org based on props and stored value
  const selectedOrgId = useMemo<OrgValue>(() => {
    if (!canViewAll) {
      // Non-superadmins are locked to their org
      return organizationId;
    }
    // Superadmins: use stored value if valid, otherwise default to 'all'
    if (storedValue === 'all') return 'all';
    if (storedValue && storedValue !== 'all') return storedValue;
    return 'all';
  }, [canViewAll, organizationId, storedValue]);

  const setSelectedOrgId = useCallback((orgId: OrgValue) => {
    setStoredValue(orgId);
  }, []);

  const value = useMemo<AdminOrgContextValue>(() => {
    const isAllOrganizations = canViewAll && selectedOrgId === 'all';
    return {
      selectedOrgId,
      setSelectedOrgId,
      effectiveOrgId: isAllOrganizations ? null : (selectedOrgId as string | null),
      isAllOrganizations,
      canViewAll,
    };
  }, [canViewAll, selectedOrgId, setSelectedOrgId]);

  return <AdminOrgContext.Provider value={value}>{children}</AdminOrgContext.Provider>;
};
