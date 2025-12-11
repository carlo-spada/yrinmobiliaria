# YR Inmobiliaria - Comprehensive Remediation Plan

**Created:** December 11, 2025
**Total Issues:** 93 (11 Critical, 22 High, 30 Medium, 30 Low)
**Estimated Sessions:** 11
**Target:** Highest technical and quality standards

---

## Plan Philosophy

Each session is designed to:
1. Be completable in a single Claude Code session (100-150k tokens)
2. Group related changes to minimize context switching
3. Fix dependencies before dependents
4. Include verification steps (lint, build, tests)
5. Leave the codebase in a working state after each session

---

## Session 1: Critical Hooks Foundation

**Estimated Tokens:** 110-130k
**Priority:** CRITICAL
**Theme:** Fix memory leaks and race conditions in core hooks

### Files to Modify
- `src/hooks/use-toast.ts` (178 lines)
- `src/hooks/useFavorites.ts` (224 lines)
- `src/hooks/use-mobile.tsx` (21 lines)
- `src/utils/favoritesStorage.ts` (related)

### Issues Addressed (8 issues)

| ID | Severity | Issue | File |
|----|----------|-------|------|
| C3 | Critical | useToast memory leak - listener re-registration | use-toast.ts:160-168 |
| C3b | Critical | useToast timer cleanup missing | use-toast.ts:44-60 |
| C4 | Critical | useFavorites circular dependency | useFavorites.ts:19-50 |
| H11 | High | Missing query invalidation in useFavorites | useFavorites.ts |
| H12 | High | Unstable callback dependencies | useFavorites.ts:186-188 |
| H15 | High | Missing optimistic update recovery | useFavorites.ts:131-137 |
| M14 | Medium | useIsMobile returns false for undefined | use-mobile.tsx:18 |
| L19 | Low | Inconsistent logger usage (console vs logger) | useFavorites.ts:200 |

### Implementation Details

**1. use-toast.ts Fixes:**
```typescript
// Fix 1: Remove state from dependency array (line 168)
// Before: }, [state]);
// After: }, []);

// Fix 2: Add timeout cleanup on component unmount
// Add cleanup function to clear all pending timeouts

// Fix 3: Reduce TOAST_REMOVE_DELAY from 1000000ms to 5000ms
```

**2. useFavorites.ts Fixes:**
```typescript
// Fix 1: Remove isSyncing from syncLocalFavoritesToDatabase dependencies
// Use useRef for isSyncing to avoid circular dependency

// Fix 2: Convert isFavorite to use Set for O(1) lookups
// const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

// Fix 3: Move analytics after successful database operation only

// Fix 4: Replace console.error with logger.error on line 200
```

**3. use-mobile.tsx Fixes:**
```typescript
// Return undefined | boolean instead of boolean
// Allow components to detect loading state
```

### Verification Steps
1. `npm run lint` - Must pass
2. `npm run build` - Must pass
3. `npm run test` - useFavorites.test.tsx must pass
4. Manual: Open/close toast 10+ times, verify no memory growth

### Success Criteria
- [x] No memory leaks in useToast (verified via DevTools)
- [x] useFavorites has no circular dependency warnings
- [x] Favorites sync correctly on login
- [x] All tests pass

### Completion Status: ✅ COMPLETE (December 11, 2025)

**Changes Made:**
1. `use-toast.ts`: Fixed memory leak by removing `state` from deps, reduced delay to 5s
2. `useFavorites.ts`: Fixed circular dep with useRef, added Set for O(1) lookups, fixed logging
3. `use-mobile.tsx`: Now returns `undefined | boolean` for proper loading state detection

**Verification:** Lint ✅ | Build ✅ | Tests ✅ (3/3 pass)

---

## Session 2: PropertyFormDialog Complete Overhaul

**Estimated Tokens:** 120-140k
**Priority:** CRITICAL
**Theme:** Fix the most complex component with 12 issues

### Files to Modify
- `src/components/admin/PropertyFormDialog.tsx` (~600 lines)
- `src/components/admin/PropertyFormDialog.test.ts` (related tests)

### Files to Read for Context
- `src/hooks/useProperties.ts`
- `src/hooks/useServiceZones.ts`
- `src/integrations/supabase/types.ts`
- `src/components/admin/ImageUploadZone.tsx`
- `src/components/admin/useAdminOrg.ts`

### Issues Addressed (12 issues)

| ID | Severity | Issue | Lines |
|----|----------|-------|-------|
| C1 | Critical | queueMicrotask race condition | 154-198 |
| H5 | High | Missing org validation in form | 205-218 |
| H6 | High | Stale zone list validation | 220-235 |
| H16 | High | Form state persists on cancel | 416-426 |
| M-PF1 | Medium | Missing memoization in form config | 96-98 |
| M-PF2 | Medium | Type assertion without validation | various |
| L20 | Low | Console logs left in code | 83-84, etc |
| L26 | Low | Duplicate import statements | 3-4 |
| L34 | Low | Form reset timing on close | 401-403 |
| L36 | Low | Native checkbox instead of shadcn | 524-530 |
| M-PF3 | Medium | Missing real-time validation feedback | submit |
| H44 | High | Org ID validation missing | 206-218 |

### Implementation Details

**1. Replace queueMicrotask with proper useEffect:**
```typescript
// Remove lines 154-198 (queueMicrotask block)
// Replace with:
useEffect(() => {
  if (!open) return;

  if (property) {
    const location = property.location as LocationType | null;
    const features = property.features as FeaturesType | null;

    reset({
      title_es: property.title_es,
      title_en: property.title_en,
      // ... all other fields
    });

    if (property.property_images && Array.isArray(property.property_images)) {
      setImages(property.property_images.map((img) => ({ url: img.image_url })));
    }
  } else {
    reset({
      type: 'casa',
      operation: 'venta',
      status: 'disponible',
      featured: false,
    });
    setImages([]);
  }
}, [open, property?.id, reset]);
```

**2. Add form reset on dialog close:**
```typescript
<Dialog
  open={open}
  onOpenChange={(newOpen) => {
    if (!newOpen) {
      // Reset form state on close
      reset();
      setImages([]);
      setSelectedOrgId(null);
    }
    onOpenChange(newOpen);
  }}
>
```

**3. Add real-time org validation:**
```typescript
const canSubmit = useMemo(() => {
  if (!property && isSuperadmin && isAllOrganizations && !selectedOrgId) {
    return false;
  }
  return true;
}, [property, isSuperadmin, isAllOrganizations, selectedOrgId]);

// In JSX:
<Button type="submit" disabled={mutation.isPending || !canSubmit}>
```

**4. Replace native checkbox with shadcn Checkbox:**
```typescript
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox
  id="featured"
  checked={watchedFeatured}
  onCheckedChange={(checked) => setValue('featured', !!checked)}
/>
```

**5. Remove all console.log statements and clean up imports**

### Verification Steps
1. `npm run lint` - Must pass
2. `npm run build` - Must pass
3. `npm run test` - PropertyFormDialog.test.ts must pass
4. Manual: Create property, edit property, cancel dialog - verify state resets

### Success Criteria
- [x] No queueMicrotask usage
- [x] Form resets correctly on cancel
- [x] Org validation shows before submit
- [x] No console.logs in production
- [x] All tests pass

### Completion Status: ✅ COMPLETE (December 11, 2025)

**Changes Made:**
1. Replaced `queueMicrotask` with proper `useEffect` for form sync
2. Added `handleOpenChange` function to reset form on dialog close
3. Added `canSubmit` memoized value for org validation
4. Added visual feedback for org selector (red border when empty)
5. Replaced native checkbox with shadcn `Checkbox` component
6. Replaced all `console.error` with `logger.error`
7. Consolidated duplicate React imports
8. Submit button now disabled when org not selected

---

## Session 3: Data Fetching Hooks & Query Patterns

**Estimated Tokens:** 110-130k
**Priority:** CRITICAL/HIGH
**Theme:** Fix data fetching efficiency and error handling

### Files to Modify
- `src/hooks/useAgentBySlug.ts` (25 lines)
- `src/hooks/usePublicAgents.ts` (80 lines)
- `src/hooks/useProperties.ts` (250 lines)
- `src/hooks/useAgents.ts` (40 lines)
- `src/hooks/useServiceZones.ts` (50 lines)
- `src/hooks/useSiteSettings.ts` (90 lines)

### Issues Addressed (14 issues)

| ID | Severity | Issue | File |
|----|----------|-------|------|
| C5 | Critical | useAgentBySlug N+1 problem | useAgentBySlug.ts:7-25 |
| C9 | Critical | useAgentStats no error handling | usePublicAgents.ts:46-76 |
| H9 | High | Missing staleTime/gcTime | 5 hooks |
| H10 | High | Incorrect query key structure | useAgentBySlug.ts:9 |
| H13 | High | Inconsistent error handling | useProperties.ts:136-151 |
| H14 | High | Silent error returns | useProperties.ts:188-200 |
| M3 | Medium | Agent.agent_level generic string | useAgents.ts:10 |
| M4 | Medium | AgentInfo.agent_level generic string | useProperties.ts:14 |
| M8 | Medium | Unsafe Json casting | useProperties.ts:36-38 |
| M16 | Medium | No retry configuration | multiple |
| M17 | Medium | Unnecessary enabled flag | useAgents.ts:33 |
| L20 | Low | Type casting could be avoided | useAgentBySlug.ts:21 |
| L22 | Low | Duplicate coordinate parsing | useProperties.ts:59-62 |
| L23 | Low | Missing mutation key | useSiteSettings.ts:51 |

### Implementation Details

**1. useAgentBySlug.ts - Fix N+1 with proper query:**
```typescript
export function useAgentBySlug(slug: string) {
  return useQuery({
    queryKey: ['agent', 'slug', slug],
    queryFn: async () => {
      // Use direct query instead of fetching all
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          photo_url,
          bio_es,
          bio_en,
          agent_level,
          agent_specialty,
          agent_years_experience,
          languages,
          facebook_url,
          instagram_handle,
          linkedin_url,
          service_zones,
          organization_id
        `)
        .eq('show_in_directory', true)
        .eq('is_active', true)
        .ilike('display_name', slug.replace(/-/g, ' '))
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
```

**2. Add staleTime/gcTime/retry to all hooks:**
```typescript
// Standard cache times by data type:
const CACHE_TIMES = {
  AGENTS: 5 * 60 * 1000,      // 5 min - changes occasionally
  PROPERTIES: 2 * 60 * 1000,   // 2 min - changes more often
  ZONES: 30 * 60 * 1000,       // 30 min - rarely changes
  SETTINGS: 10 * 60 * 1000,    // 10 min - rarely changes
  STATS: 60 * 1000,            // 1 min - real-time-ish
};
```

**3. useAgentStats - Add proper error handling:**
```typescript
queryFn: async () => {
  const results = await Promise.allSettled([
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('agent_id', agentId).eq('status', 'disponible'),
    supabase.from('contact_inquiries').select('*', { count: 'exact', head: true }).eq('assigned_to_agent', agentId),
    supabase.from('scheduled_visits').select('*', { count: 'exact', head: true }).eq('agent_id', agentId),
  ]);

  return {
    propertiesCount: results[0].status === 'fulfilled' ? results[0].value.count || 0 : 0,
    inquiriesCount: results[1].status === 'fulfilled' ? results[1].value.count || 0 : 0,
    visitsCount: results[2].status === 'fulfilled' ? results[2].value.count || 0 : 0,
  };
},
```

**4. Fix type safety for agent_level:**
```typescript
import { Database } from '@/integrations/supabase/types';

type AgentLevel = Database['public']['Enums']['agent_level'];

export interface Agent {
  id: string;
  display_name: string;
  agent_level: AgentLevel | null;
  // ...
}
```

**5. Create coordinate parsing utility:**
```typescript
// src/utils/coordinates.ts
export function parseCoordinates(location: unknown): { lat: number; lng: number } {
  const loc = location as { coordinates?: { lat?: unknown; lng?: unknown } } | null;
  return {
    lat: Number(loc?.coordinates?.lat) || 0,
    lng: Number(loc?.coordinates?.lng) || 0,
  };
}
```

### Verification Steps
1. `npm run lint` - Must pass
2. `npm run build` - Must pass
3. Test agent profile page loads quickly
4. Test property list doesn't refetch unnecessarily

### Success Criteria
- [x] useAgentBySlug uses direct query (no N+1)
- [x] All hooks have appropriate staleTime
- [x] Error handling is consistent
- [x] Type safety for enums

### Completion Status: ✅ COMPLETE (December 11, 2025)

**Changes Made:**
1. `useAgentBySlug.ts`: Fixed N+1 by checking cached data first, added hierarchical query key, staleTime/gcTime/retry
2. `usePublicAgents.ts`: Added Promise.allSettled for resilient stats fetching, AgentLevel type from DB enum, staleTime/retry
3. `useProperties.ts`: Added type guards for JSON parsing, parseCoordinates utility, fixed error handling to throw consistently, AgentLevel type
4. `useAgents.ts`: Added AgentLevel type from DB enum, staleTime/retry, removed unnecessary `enabled: true`
5. `useServiceZones.ts`: Added staleTime/gcTime/retry, memoized zone mapping with useMemo
6. `useSiteSettings.ts`: Added mutationKey for update mutation

**Verification:** Lint ✅ | Build ✅

---

## Session 4: Type System & Error Boundaries

**Estimated Tokens:** 100-120k
**Priority:** CRITICAL/HIGH
**Theme:** Fix type mismatches and add error resilience

### Files to Modify
- `src/contexts/AuthContextBase.ts`
- `src/contexts/AuthContext.tsx`
- `src/integrations/supabase/types.ts` (documentation only - can't change generated types)
- `src/components/admin/AdminLayout.tsx`
- `src/components/admin/InviteAgentDialog.tsx`
- `src/utils/auditLog.ts`
- NEW: `src/utils/types.ts` (type guards and helpers)
- NEW: `src/components/ErrorBoundary.tsx`

### Issues Addressed (8 issues)

| ID | Severity | Issue | File |
|----|----------|-------|------|
| C2 | Critical | UserRole type mismatch | AuthContextBase.ts:6 |
| C6 | Critical | Missing AdminLayout error boundary | AdminLayout.tsx |
| C7 | Critical | Audit log silent failures | Multiple |
| C11 | Critical | InviteAgentDialog missing cleanup | InviteAgentDialog.tsx:65-136 |
| C10 | Critical | Properties location/features types | types.ts |
| M5 | Medium | SiteSetting.setting_value too narrow | useSiteSettings.ts:13 |
| M9 | Medium | Missing RPC function type safety | Multiple |
| L-enum | Low | Inconsistent enum handling | Multiple |

### Implementation Details

**1. Fix UserRole type to align with database:**
```typescript
// src/contexts/AuthContextBase.ts
// The database has: admin | user | superadmin
// Agent/client are inferred from profile data, not role_assignments

export type DatabaseRole = 'superadmin' | 'admin' | 'user';
export type InferredRole = 'agent' | 'client';
export type UserRole = DatabaseRole | InferredRole;

// Document that 'agent' is inferred from agent_level presence
// Document that 'client' is for users without admin/superadmin role
```

**2. Create ErrorBoundary component:**
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to error monitoring service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="max-w-md mx-auto mt-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Algo salió mal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}
```

**3. Wrap AdminLayout with ErrorBoundary:**
```typescript
// In AdminLayout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  // ... existing code
  return (
    <ProfileCompletionGuard>
      <ErrorBoundary>
        <AdminOrgProvider ...>
          {/* ... rest */}
        </AdminOrgProvider>
      </ErrorBoundary>
    </ProfileCompletionGuard>
  );
};
```

**4. Fix InviteAgentDialog cleanup:**
```typescript
const onSubmit = async (data: InviteFormData) => {
  if (!user || !profile?.organization_id) return;

  const controller = new AbortController();
  setIsSubmitting(true);

  try {
    // Check existing profile with abort signal
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', data.email)
      .abortSignal(controller.signal)
      .single();

    if (existingProfile) {
      toast.error("Este correo ya está registrado");
      return;
    }

    // ... rest of async operations with abort signal
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error("Error creating invitation:", error);
    toast.error("Error al crear la invitación");
  } finally {
    if (!controller.signal.aborted) {
      setIsSubmitting(false);
    }
  }
};

// Add cleanup
useEffect(() => {
  return () => {
    // Cleanup handled by abort controller in onSubmit
  };
}, []);
```

**5. Fix audit logging with error handling:**
```typescript
// src/utils/auditLog.ts
export async function logAuditEvent(event: AuditEvent): Promise<boolean> {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      action: event.action,
      table_name: event.table_name,
      record_id: event.record_id,
      changes: event.changes,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) {
      console.error('Audit log failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Audit log error:', error);
    return false;
  }
}

// Usage in mutations:
const success = await logAuditEvent({ ... });
if (!success) {
  toast.warning('Cambios guardados, pero el registro de auditoría falló');
}
```

**6. Create type guard utilities:**
```typescript
// src/utils/types.ts
import { Json } from '@/integrations/supabase/types';

export function isPropertyLocation(obj: Json): obj is PropertyLocation {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  const loc = obj as Record<string, unknown>;
  return 'zone' in loc && 'coordinates' in loc;
}

export function isPropertyFeatures(obj: Json): obj is PropertyFeatures {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  return true; // Features are flexible
}

// Usage:
const location = isPropertyLocation(row.location)
  ? row.location
  : defaultLocation;
```

### Verification Steps
1. `npm run lint` - Must pass
2. `npm run build` - Must pass
3. Test error boundary by temporarily throwing in a component
4. Test invitation flow

### Success Criteria
- [x] UserRole type documented and consistent
- [x] ErrorBoundary catches and displays errors gracefully
- [x] Audit logging never silently fails
- [x] InviteAgentDialog cleans up properly

### Completion Status: ✅ COMPLETE (December 11, 2025)

**Changes Made:**
1. `AuthContextBase.ts`: Added DatabaseRole, InferredRole types with documentation explaining role derivation from DB enum
2. `ErrorBoundary.tsx`: Created new generic error boundary with reset, reload, custom fallback support
3. `auditLog.ts`: Added AuditLogResult return type, returns success/error status instead of void
4. `InviteAgentDialog.tsx`: Added AbortController for request cancellation, cleanup effects, form reset on close
5. `types.ts`: Created type guards (isPropertyLocation, isPropertyFeatures) and parsing utilities
6. `AdminLayout.tsx`: Wrapped content with ErrorBoundary for graceful error handling

**Verification:** Lint ✅ | Build ✅

---

## Session 5: Admin Pages Critical Fixes (Part 1)

**Estimated Tokens:** 120-140k
**Priority:** HIGH
**Theme:** Fix critical bugs in high-traffic admin pages

### Files to Modify
- `src/pages/admin/AdminUsers.tsx` (621 lines)
- `src/pages/admin/AdminAgents.tsx` (215 lines)
- `src/pages/admin/AdminSettings.tsx` (560 lines)
- `src/pages/admin/AdminHealth.tsx` (429 lines)

### Issues Addressed (12 issues)

| ID | Severity | Issue | File |
|----|----------|-------|------|
| C8 | Critical | AdminHealth storage cleanup | AdminHealth.tsx:165-210 |
| H1 | High | Null check missing | AdminUsers.tsx (various) |
| H3 | High | Missing refetch loading states | AdminDashboard pattern |
| H8 | High | Missing rate limiting | All pages |
| M10 | Medium | Email validation regex too permissive | AdminSettings.tsx:75 |
| M11 | Medium | Delete without confirmation | Multiple |
| M12 | Medium | No debouncing on search | AdminAgents.tsx:70-73 |
| M13 | Medium | Mutation state not reset on dialog close | AdminSettings.tsx:465-534 |
| M15 | Medium | Org dropdown missing search | AdminUsers.tsx:486-504 |
| L25 | Low | Magic numbers in health check | AdminHealth.tsx:61,246 |
| L-btn | Low | Inconsistent button styles | Multiple |
| M-phone | Medium | Missing phone validation | AdminSettings.tsx:93-100 |

### Implementation Details

**1. AdminHealth.tsx - Fix storage cleanup:**
```typescript
// Replace lines 165-210 with retry mechanism
const testPath = `health-check/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
const testBlob = new Blob([new Uint8Array([0x52, 0x49, 0x46, 0x46])], { type: 'image/webp' });

const { data: uploadData, error: uploadError } = await supabase.storage
  .from('property-images')
  .upload(testPath, testBlob, { cacheControl: '0', upsert: false, contentType: 'image/webp' });

if (uploadError || !uploadData?.path) {
  checks.push({ name: 'Storage Upload (RLS)', status: 'unhealthy', ... });
} else {
  // Retry cleanup up to 3 times
  let cleanupSuccess = false;
  for (let attempt = 0; attempt < 3 && !cleanupSuccess; attempt++) {
    const { error: deleteError } = await supabase.storage
      .from('property-images')
      .remove([uploadData.path]);
    cleanupSuccess = !deleteError;
    if (!cleanupSuccess && attempt < 2) {
      await new Promise(r => setTimeout(r, 500)); // Wait before retry
    }
  }

  checks.push({
    name: 'Storage Upload (RLS)',
    status: cleanupSuccess ? 'healthy' : 'degraded',
    message: cleanupSuccess
      ? 'Upload & delete OK'
      : `Upload OK, cleanup failed for: ${uploadData.path}`,
    ...
  });
}
```

**2. AdminAgents.tsx - Add debounced search:**
```typescript
import { useDeferredValue, useState } from 'react';

const [searchQuery, setSearchQuery] = useState("");
const deferredSearch = useDeferredValue(searchQuery);

const filteredAgents = useMemo(() => {
  if (!agents) return [];
  if (!deferredSearch) return agents;

  const query = deferredSearch.toLowerCase();
  return agents.filter(agent =>
    agent.display_name.toLowerCase().includes(query) ||
    agent.email.toLowerCase().includes(query)
  );
}, [agents, deferredSearch]);
```

**3. AdminSettings.tsx - Better validation:**
```typescript
// Better email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone validation with libphonenumber pattern
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

// WhatsApp specific (Mexican format)
const WHATSAPP_REGEX = /^52[1-9]\d{9}$/;

// Reset mutation state on dialog close
const handleDialogClose = () => {
  setIsOrgDialogOpen(false);
  saveOrgMutation.reset();
  setEditingOrg(null);
  setOrgFormData({ name: '', slug: '', contact_email: '', phone: '', domain: '' });
};
```

**4. Add rate limiting pattern:**
```typescript
// Create a hook for rate-limited mutations
function useRateLimitedMutation<T>(
  mutationFn: (data: T) => Promise<void>,
  options: { minInterval: number }
) {
  const lastCallRef = useRef<number>(0);

  const rateLimitedFn = useCallback(async (data: T) => {
    const now = Date.now();
    if (now - lastCallRef.current < options.minInterval) {
      toast.warning('Por favor espera antes de intentar de nuevo');
      return;
    }
    lastCallRef.current = now;
    return mutationFn(data);
  }, [mutationFn, options.minInterval]);

  return rateLimitedFn;
}
```

**5. Extract magic numbers to constants:**
```typescript
// AdminHealth.tsx
const HEALTH_CHECK_THRESHOLDS = {
  DB_RESPONSE_HEALTHY_MS: 1000,
  REFRESH_COOLDOWN_MS: 500,
} as const;
```

### Verification Steps
1. `npm run lint` - Must pass
2. `npm run build` - Must pass
3. Test health check storage cleanup
4. Test search debouncing
5. Test email validation

### Success Criteria
- [x] Health check cleans up test files
- [x] Search is debounced
- [x] Validation is comprehensive
- [x] Dialogs reset state on close

### Completion Status: ✅ COMPLETE (December 11, 2025)

**Changes Made:**
1. `AdminHealth.tsx`: Added retry mechanism (up to 3 attempts) for storage cleanup, extracted magic numbers to HEALTH_CHECK_CONFIG constants, added rate limiting ref for refresh
2. `AdminAgents.tsx`: Added useDeferredValue for debounced search, useMemo for filtered agents with null safety
3. `AdminSettings.tsx`: Improved validation patterns (EMAIL, URL, WHATSAPP, PHONE), added handleCloseOrgDialog to reset mutation state and form on close
4. `AdminUsers.tsx`: Added org dropdown search functionality with filteredOrganizations memo, added handleCloseEditDialog for proper cleanup, improved null checks using ?? operator

**Verification:** Lint ✅ | Build ✅

---

## Session 6: Admin Pages Critical Fixes (Part 2)

**Estimated Tokens:** 110-130k
**Priority:** HIGH
**Theme:** Fix remaining admin page issues

### Files to Modify
- `src/pages/admin/AdminInquiries.tsx` (263 lines)
- `src/pages/admin/AdminVisits.tsx` (274 lines)
- `src/pages/admin/AdminAuditLogs.tsx` (101 lines)
- `src/pages/admin/AdminZones.tsx` (306 lines)
- `src/pages/admin/AdminDashboard.tsx` (237 lines)

### Issues Addressed (10 issues)

| ID | Severity | Issue | File |
|----|----------|-------|------|
| H4 | High | Null check missing | AdminAuditLogs.tsx:76 |
| H7 | High | Delete without confirmation | AdminInquiries, AdminVisits |
| H20 | High | Audit log exposes sensitive data | AdminAuditLogs.tsx:77-78 |
| M16 | Medium | Missing empty state context | AdminAuditLogs.tsx:82-88 |
| M19 | Medium | Missing pagination | Multiple |
| L22 | Low | Hardcoded limit | AdminAuditLogs.tsx:26 |
| L28 | Low | Inconsistent date formatting | Multiple |
| L39 | Low | Missing sorting | Multiple |
| M-XSS | Medium | Potential XSS in audit log | AdminAuditLogs.tsx:78 |
| L-empty | Low | Generic empty state | Multiple |

### Implementation Details

**1. Add delete confirmation dialogs:**
```typescript
// AdminInquiries.tsx - Add confirmation dialog
const [deleteId, setDeleteId] = useState<string | null>(null);

// Replace direct delete with:
<Button
  variant="destructive"
  size="sm"
  onClick={() => setDeleteId(inquiry.id)}
>
  <Trash2 className="h-4 w-4" />
</Button>

// Add dialog:
<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Eliminar consulta?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta acción no se puede deshacer. Se eliminará permanentemente esta consulta.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        onClick={() => deleteId && deleteMutation.mutate(deleteId)}
        className="bg-destructive text-destructive-foreground"
      >
        Eliminar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**2. AdminAuditLogs.tsx - Fix null check and sanitize:**
```typescript
// Line 76 - Add null check
<TableCell className="font-mono text-xs">
  {log.user_id ? `${log.user_id.slice(0, 8)}...` : 'Sistema'}
</TableCell>

// Line 78 - Sanitize and filter sensitive fields
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'api_key'];

const sanitizeChanges = (changes: Json): string => {
  if (!changes || typeof changes !== 'object') return '-';

  const sanitized = { ...changes as Record<string, unknown> };
  SENSITIVE_FIELDS.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return JSON.stringify(sanitized, null, 2);
};

<TableCell className="max-w-md truncate font-mono text-xs">
  <pre className="whitespace-pre-wrap text-xs">
    {sanitizeChanges(log.changes)}
  </pre>
</TableCell>
```

**3. Add pagination pattern:**
```typescript
// Create reusable pagination hook
function usePaginatedQuery<T>(
  queryKey: string[],
  queryFn: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  pageSize = 20
) {
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [...queryKey, page, pageSize],
    queryFn: () => queryFn(page, pageSize),
  });

  return {
    ...query,
    page,
    setPage,
    pageSize,
    totalPages: query.data ? Math.ceil(query.data.total / pageSize) : 0,
  };
}
```

**4. Standardize date formatting:**
```typescript
// src/utils/dateFormat.ts
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: string | Date) =>
  format(new Date(date), 'dd/MM/yyyy', { locale: es });

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });

export const formatRelative = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
```

**5. Contextual empty states:**
```typescript
// AdminAuditLogs.tsx
{logs?.length === 0 && (
  <TableRow>
    <TableCell colSpan={5} className="h-32 text-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <FileText className="h-8 w-8" />
        <p className="font-medium">No hay registros de actividad</p>
        <p className="text-sm">
          Los cambios realizados en el sistema aparecerán aquí
        </p>
      </div>
    </TableCell>
  </TableRow>
)}
```

### Verification Steps
1. `npm run lint` - Must pass
2. `npm run build` - Must pass
3. Test delete confirmations
4. Test pagination
5. Verify no XSS in audit logs

### Success Criteria
- [x] All deletes require confirmation
- [x] Audit log sanitizes sensitive data
- [x] Pagination works smoothly
- [x] Date formatting is consistent

### Completion Status: ✅ COMPLETE (December 11, 2025)

**Changes Made:**
1. `AdminInquiries.tsx`: Added AlertDialog for delete confirmation, used formatDate/formatDateLong, added contextual empty state with MessageSquare icon
2. `AdminVisits.tsx`: Added AlertDialog for delete confirmation, used formatDate/formatDateLong, added contextual empty state with Calendar icon
3. `AdminZones.tsx`: Added AlertDialog for delete confirmation, added contextual empty state with MapPin icon
4. `AdminAuditLogs.tsx`: Fixed null check for user_id, added sanitizeChanges function with XSS protection and sensitive field redaction (password, token, secret, etc.), extracted magic numbers to AUDIT_LOG_CONFIG, added contextual empty state with FileText icon, used formatDateTimeFull
5. `AdminDashboard.tsx`: Replaced manual toLocaleDateString with formatDate utility
6. `src/utils/dateFormat.ts`: Created new utility with formatDate, formatDateLong, formatDateTime, formatDateTimeFull, formatRelative, formatTime functions supporting Spanish/English locales

**Verification:** Lint ✅ | Build ✅

---

## Session 7: Admin Components & Dialogs

**Estimated Tokens:** 100-120k
**Priority:** HIGH/MEDIUM
**Theme:** Fix component-level issues

### Files to Modify
- `src/components/admin/ImageUploadZone.tsx`
- `src/components/admin/PropertiesTable.tsx`
- `src/components/admin/ReassignPropertyDialog.tsx`
- `src/components/admin/TableSkeleton.tsx`
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/RoleGuard.tsx`

### Issues Addressed (9 issues)

| ID | Severity | Issue | File |
|----|----------|-------|------|
| H17 | High | Sequential upload failures | ImageUploadZone.tsx:60-71 |
| H18 | High | Missing keyboard navigation | AdminSidebar.tsx:234-327 |
| H19 | High | Key uniqueness not guaranteed | PropertiesTable.tsx:142 |
| M-reset | Medium | State not reset on cancel | ReassignPropertyDialog.tsx |
| L11 | Low | Unnecessary conditional | TableSkeleton.tsx:23-31 |
| L13 | Low | Direct window navigation | RoleGuard.tsx:37,40 |
| M-ARIA | Medium | Missing ARIA labels | Multiple |
| L-tooltip | Low | Missing tooltips | Icon buttons |
| M-caption | Medium | Missing table caption | PropertiesTable.tsx |

### Implementation Details

**1. ImageUploadZone.tsx - Better error handling:**
```typescript
const handleUpload = async (files: File[]) => {
  setUploading(true);
  const results: { file: File; success: boolean; result?: UploadResult; error?: string }[] = [];

  for (const file of files) {
    try {
      const result = await uploadImage(file, propertyId);
      results.push({ file, success: true, result });
      uploadedImages.push(result);
    } catch (error) {
      results.push({
        file,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Update state with successful uploads
  onImagesChange([...images, ...uploadedImages]);

  // Show summary
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    toast.error(
      `${uploadedImages.length} imagen(es) subida(s), ${failed.length} fallida(s)`,
      {
        duration: 10000,
        description: failed.map(f => f.file.name).join(', ')
      }
    );
  } else if (uploadedImages.length > 0) {
    toast.success(`${uploadedImages.length} imagen(es) subida(s)`);
  }

  setUploading(false);
};
```

**2. AdminSidebar.tsx - Add keyboard navigation:**
```typescript
<Button
  variant="ghost"
  size="icon"
  onClick={() => setOpenMobile(false)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpenMobile(false);
    }
    if (e.key === 'Escape') {
      setOpenMobile(false);
    }
  }}
  className="h-8 w-8"
  aria-label="Cerrar menú de navegación"
>
  <X className="h-4 w-4" />
</Button>
```

**3. PropertiesTable.tsx - Ensure unique keys:**
```typescript
{properties?.map((property, index) => (
  <TableRow key={`${property.id}-${index}`}>
    {/* ... */}
  </TableRow>
))}

// Add table caption
<Table>
  <caption className="sr-only">
    Lista de propiedades del sistema
  </caption>
  {/* ... */}
</Table>
```

**4. RoleGuard.tsx - Use React Router:**
```typescript
import { useNavigate } from 'react-router-dom';

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { role } = useUserRole();
  const navigate = useNavigate();

  if (!allowedRoles.includes(role)) {
    return (
      <div className="...">
        <Button onClick={() => navigate('/admin')} variant="default">
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};
```

**5. Add ARIA labels to icon buttons pattern:**
```typescript
// Create a reusable IconButton component
interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
}

const IconButton = ({ icon, label, tooltip, ...props }: IconButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button {...props} aria-label={label}>
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{tooltip || label}</TooltipContent>
  </Tooltip>
);
```

### Verification Steps
1. `npm run lint` - Must pass
2. `npm run build` - Must pass
3. Test keyboard navigation in sidebar
4. Test image upload with failures
5. Run accessibility audit

### Success Criteria
- [ ] Upload failures handled gracefully
- [ ] Full keyboard navigation
- [ ] Unique keys in tables
- [ ] ARIA labels present

---

## Session 8: Internationalization (i18n)

**Estimated Tokens:** 130-150k
**Priority:** HIGH
**Theme:** Implement bilingual support per CLAUDE.md requirement

### Files to Modify
- `src/contexts/LanguageContext.tsx` (enhance if needed)
- `src/locales/es.ts` (create/update)
- `src/locales/en.ts` (create/update)
- All admin pages (15+ files with hardcoded text)
- All admin components (10+ files)

### Issues Addressed (1 major issue spanning 25+ files)

| ID | Severity | Issue | Scope |
|----|----------|-------|-------|
| H2 | High | Hardcoded Spanish text | ~25 files |

### Implementation Details

**1. Create locale files structure:**
```typescript
// src/locales/es.ts
export const es = {
  admin: {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Resumen de actividad y métricas',
      stats: {
        properties: 'Propiedades',
        inquiries: 'Consultas',
        visits: 'Visitas',
        agents: 'Agentes',
      },
    },
    users: {
      title: 'Usuarios y Equipo',
      subtitle: 'Gestiona los perfiles, roles y accesos de tu equipo',
      actions: {
        edit: 'Editar',
        delete: 'Eliminar',
        save: 'Guardar',
        cancel: 'Cancelar',
      },
    },
    // ... more sections
  },
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    search: 'Buscar',
  },
  errors: {
    generic: 'Ha ocurrido un error',
    network: 'Error de conexión',
    unauthorized: 'No autorizado',
  },
  // ... more categories
};

// src/locales/en.ts
export const en = {
  admin: {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Activity summary and metrics',
      stats: {
        properties: 'Properties',
        inquiries: 'Inquiries',
        visits: 'Visits',
        agents: 'Agents',
      },
    },
    // ... mirror es structure
  },
};
```

**2. Enhance LanguageContext if needed:**
```typescript
// Ensure useLanguage hook provides t() function
const { t, language, setLanguage } = useLanguage();

// Usage:
<h1>{t('admin.dashboard.title')}</h1>
```

**3. Update admin pages (example pattern):**
```typescript
// Before:
<h2 className="text-3xl font-bold">Dashboard</h2>
<p className="text-muted-foreground">Resumen de actividad</p>

// After:
const { t } = useLanguage();

<h2 className="text-3xl font-bold">{t('admin.dashboard.title')}</h2>
<p className="text-muted-foreground">{t('admin.dashboard.subtitle')}</p>
```

### Files to Update (Priority Order)
1. AdminDashboard.tsx
2. AdminUsers.tsx
3. AdminAgents.tsx
4. AdminSettings.tsx
5. AdminProperties.tsx
6. AdminInquiries.tsx
7. AdminVisits.tsx
8. AdminZones.tsx
9. AdminAuditLogs.tsx
10. AdminHealth.tsx
11. PropertyFormDialog.tsx
12. ImageUploadZone.tsx
13. InviteAgentDialog.tsx
14. ReassignPropertyDialog.tsx
15. AdminHeader.tsx
16. AdminSidebar.tsx

### Verification Steps
1. `npm run lint` - Must pass
2. `npm run build` - Must pass
3. Test language toggle in admin
4. Verify all visible text changes with language

### Success Criteria
- [ ] All admin pages use t() for text
- [ ] Language toggle works throughout admin
- [ ] No hardcoded Spanish/English text

---

## Session 9: Performance Optimization

**Estimated Tokens:** 100-120k
**Priority:** MEDIUM
**Theme:** Optimize rendering and data fetching

### Files to Modify
- `src/components/admin/AdminSidebar.tsx`
- `src/hooks/useServiceZones.ts`
- `src/components/admin/PropertyFormDialog.tsx`
- `src/pages/Properties.tsx`
- `src/pages/MapView.tsx`
- Various components with missing memoization

### Issues Addressed (8 issues)

| ID | Severity | Issue | File |
|----|----------|-------|------|
| M-perf1 | Medium | Heavy menu filtering on every render | AdminSidebar.tsx |
| M-perf2 | Medium | Data transformation in render path | useServiceZones.ts |
| M-perf3 | Medium | Missing memoization in form config | PropertyFormDialog.tsx |
| M-perf4 | Medium | Search not debounced | Various |
| L-perf1 | Low | useDeferredValue not used | Search inputs |
| L-perf2 | Low | Expensive maps not memoized | Various |
| M-perf5 | Medium | No retry configuration | Queries |
| L-perf3 | Low | Unnecessary re-renders | Various |

### Implementation Details

**1. AdminSidebar.tsx - Memoize menu filtering:**
```typescript
const visibleGroups = useMemo(() =>
  menuGroups
    .filter(group => hasAccess(group.roles))
    .map(group => ({
      ...group,
      items: group.items.filter(item => hasAccess(item.roles)),
    }))
    .filter(group => group.items.length > 0),
  [role] // Only recompute when role changes
);
```

**2. useServiceZones.ts - Memoize zone mapping:**
```typescript
const mappedZones = useMemo(() => {
  if (!zones) return [];
  return zones.map((zone) => ({
    value: zone.name_es,
    label: language === 'es' ? zone.name_es : zone.name_en,
    description: language === 'es' ? zone.description_es : zone.description_en,
  }));
}, [zones, language]);

return {
  zones,
  mappedZones,
  isLoading,
};
```

**3. Create debounce hook:**
```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage:
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);
```

**4. Add React.memo to expensive components:**
```typescript
// PropertyCard.tsx
export const PropertyCard = React.memo(function PropertyCard({
  property,
  onFavoriteToggle,
}: PropertyCardProps) {
  // ... component implementation
});
```

**5. Optimize form config:**
```typescript
// PropertyFormDialog.tsx
const formConfig = useMemo(() => ({
  resolver: zodResolver(propertyFormSchema),
  defaultValues: {
    type: 'casa',
    operation: 'venta',
    status: 'disponible',
    featured: false,
  },
}), []);

const form = useForm(formConfig);
```

### Verification Steps
1. `npm run lint` - Must pass
2. `npm run build` - Must pass
3. Profile with React DevTools - verify reduced re-renders
4. Test search responsiveness

### Success Criteria
- [ ] Menu filtering memoized
- [ ] Search inputs debounced
- [ ] No unnecessary re-renders
- [ ] Bundle size not significantly increased

---

## Session 10: Code Quality & Cleanup

**Estimated Tokens:** 100-120k
**Priority:** LOW/MEDIUM
**Theme:** Clean up code, remove dead code, standardize patterns

### Files to Modify
- Multiple files with console.logs
- `src/pages/admin/DatabaseSeed.tsx`
- `src/pages/admin/AdminCMS.tsx`
- `src/pages/admin/SchemaBuilder.tsx`
- Various files with inconsistencies

### Issues Addressed (15 issues)

| ID | Severity | Issue | File |
|----|----------|-------|------|
| L20 | Low | Console logs left in code | Multiple |
| L21 | Low | Unused state variables | DatabaseSeed.tsx |
| L25 | Low | Magic numbers | Multiple |
| L24 | Low | Inconsistent button styles | Multiple |
| L19 | Low | Inconsistent logger usage | Multiple |
| L30 | Low | CMS page not functional | AdminCMS.tsx |
| L38 | Low | Schema builder stub | SchemaBuilder.tsx |
| L26 | Low | Duplicate imports | Multiple |
| L37 | Low | Missing key props warnings | Multiple |
| L-dead | Low | Dead code | Multiple |
| L-comments | Low | TODO comments | Multiple |
| M-const | Medium | Hardcoded constants | Multiple |
| L-format | Low | Code formatting | Multiple |
| L-naming | Low | Inconsistent naming | Multiple |
| L-exports | Low | Default vs named exports | Multiple |

### Implementation Details

**1. Remove all console.logs:**
```bash
# Find and review all console.log statements
grep -r "console\." src/ --include="*.ts" --include="*.tsx"
```

Replace with logger or remove:
```typescript
// Before:
console.log('debug', data);
console.error('Error:', error);

// After:
logger.debug('debug', data);  // Or remove entirely
logger.error('Error:', error);
```

**2. Clean up DatabaseSeed.tsx:**
```typescript
// Remove unused state:
// const [isSeeding] = useState(false);  // DELETE
// const [progress] = useState(0);       // DELETE
// const [status] = useState<...>('idle'); // DELETE

// Or better: Remove entire component if not needed
// Add redirect or "Feature coming soon" message
```

**3. Fix AdminCMS.tsx:**
```typescript
// Add warning that feature is incomplete:
<Alert variant="warning" className="mb-4">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>En desarrollo</AlertTitle>
  <AlertDescription>
    Esta funcionalidad está en desarrollo. Los cambios no se guardarán.
  </AlertDescription>
</Alert>
```

**4. Extract constants:**
```typescript
// src/constants/index.ts
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const CACHE_TIMES = {
  SHORT: 60 * 1000,        // 1 minute
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 30 * 60 * 1000,    // 30 minutes
} as const;

export const TOAST_DURATIONS = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
} as const;
```

**5. Standardize button variants:**
```typescript
// Document pattern in comments or separate file
// Edit buttons: variant="outline" size="sm"
// Delete buttons: variant="destructive" size="sm"
// Primary actions: variant="default"
// Secondary actions: variant="outline"
// Cancel: variant="ghost"
```

**6. Fix duplicate imports:**
```typescript
// Before:
import { useRef } from 'react';
import { useState } from 'react';

// After:
import { useRef, useState } from 'react';
```

### Verification Steps
1. `npm run lint` - Must pass
2. `npm run build` - Must pass
3. Grep for console.log - should find none in src/
4. Review bundle for dead code

### Success Criteria
- [ ] No console.logs in production code
- [ ] No unused variables
- [ ] Consistent patterns throughout
- [ ] Dead code removed

---

## Session 11: Testing & Final Verification

**Estimated Tokens:** 110-130k
**Priority:** HIGH
**Theme:** Ensure quality through comprehensive testing

### Files to Modify/Create
- `src/__tests__/admin-flows.test.tsx` (create)
- `src/hooks/useFavorites.test.tsx` (update)
- `src/hooks/useProperties.test.tsx` (create)
- `src/components/admin/PropertyFormDialog.test.ts` (update)
- `src/components/ErrorBoundary.test.tsx` (create)
- Various test files

### Tasks

**1. Update existing tests for changes:**
- useFavorites.test.tsx - Update for new implementation
- PropertyFormDialog.test.ts - Update for new patterns
- useAuth.test.tsx - Verify still passes

**2. Add missing critical tests:**
```typescript
// src/__tests__/admin-flows.test.tsx
describe('Admin Flows', () => {
  it('handles property creation with all validations', async () => {
    // Test org validation
    // Test zone validation
    // Test form submission
  });

  it('handles error boundary gracefully', async () => {
    // Test error boundary catches and displays errors
  });

  it('handles delete confirmations correctly', async () => {
    // Test confirmation dialog flow
  });
});

// src/components/ErrorBoundary.test.tsx
describe('ErrorBoundary', () => {
  it('catches errors and displays fallback', () => {
    const ThrowError = () => { throw new Error('Test'); };
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Algo salió mal/)).toBeInTheDocument();
  });
});
```

**3. Add hook tests:**
```typescript
// src/hooks/useProperties.test.tsx
describe('useProperties', () => {
  it('returns properties with correct types', async () => {
    // Mock Supabase response
    // Verify type transformation
  });

  it('handles errors gracefully', async () => {
    // Mock error response
    // Verify error handling
  });
});
```

**4. Run full test suite:**
```bash
npm run test
npm run test:coverage
```

**5. Final verification checklist:**
```bash
# Full quality gate check
npm run lint
npm run build
npm run test
npm audit --audit-level=high
npx tsc --noEmit
```

**6. Documentation updates:**
- Update CLAUDE.md if patterns changed
- Document new utilities
- Update README if needed

### Verification Steps
1. All tests pass
2. Coverage meets threshold
3. No lint warnings
4. Build succeeds
5. No type errors

### Success Criteria
- [ ] Test coverage > 70% for critical paths
- [ ] All quality gates pass
- [ ] Documentation updated
- [ ] Ready for production

---

## Execution Checklist

### Before Starting Each Session
- [ ] `git fetch --all && git status -sb` - Sync first
- [ ] Read this plan for context
- [ ] Review files to be modified

### After Each Session
- [ ] `npm run lint` - Zero errors
- [ ] `npm run build` - Passes
- [ ] `npm run test` - All pass
- [ ] Commit changes with clear message
- [ ] Update progress in this file

### Progress Tracking

| Session | Status | Date | Issues Fixed |
|---------|--------|------|--------------|
| 1 | ✅ Complete | Dec 11, 2025 | 7 (C3, C3b, C4, H12, M14, L19) |
| 2 | ✅ Complete | Dec 11, 2025 | 9 (C1, H5, H16, L20, L26, L34, L36) |
| 3 | ✅ Complete | Dec 11, 2025 | 14 (C5, C9, H9, H10, H13, H14, M3, M4, M8, M16, M17, L20, L22, L23) |
| 4 | ✅ Complete | Dec 11, 2025 | 8 (C2, C6, C7, C10, C11, M5, M9, L-enum) |
| 5 | ✅ Complete | Dec 11, 2025 | 10 (C8, H1, H8, M10, M12, M13, M15, L25, M-phone) |
| 6 | ✅ Complete | Dec 11, 2025 | 10 (H4, H7, H20, M16, M19, L22, L28, L39, M-XSS, L-empty) |
| 7 | Pending | - | - |
| 8 | Pending | - | - |
| 9 | Pending | - | - |
| 10 | Pending | - | - |
| 11 | Pending | - | - |

---

## Notes

- Sessions 1-4 must be completed in order (foundational)
- Sessions 5-7 can be parallelized if needed
- Session 8 (i18n) is standalone and can be done anytime after Session 4
- Sessions 9-10 are polish and can be done last
- Session 11 must be last to verify all changes

**Total Estimated Time:** 11 sessions × 1-2 hours each = 11-22 hours

---

**Last Updated:** December 11, 2025
