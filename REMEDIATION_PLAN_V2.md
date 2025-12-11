# YR Inmobiliaria — Remediation Plan V2

> Bringing the codebase to production-grade excellence.

**Created:** December 11, 2025
**Status:** Ready for Implementation
**Total Sessions:** 6
**Estimated Total Effort:** 6-8 hours

---

## Executive Summary

This plan addresses 13 identified issues plus additional improvements to achieve the highest technical and quality standards. Issues are organized by impact and logical grouping to maximize efficiency.

### Issue Severity Distribution

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 4 | Bugs that can cause crashes or data corruption |
| 🟠 Performance | 3 | Memory leaks and inefficiencies |
| 🟡 Security | 3 | Input validation and abuse prevention |
| 🔵 UX/A11y | 3 | User experience and accessibility gaps |

---

## Session 1: Critical Stability Fixes

**Estimated Tokens:** 70-90K
**Priority:** CRITICAL
**Theme:** Fix bugs that can crash the app or corrupt data

### Files to Modify

- `src/hooks/useFavorites.ts`
- `src/pages/MapView.tsx`
- `src/pages/PropertyDetail.tsx`
- `src/components/AgentContactCard.tsx`

### Issues Addressed (4 Critical Issues)

| ID | Severity | Issue | File | Line |
|----|----------|-------|------|------|
| C1 | 🔴 Critical | Race condition in useFavorites during auth | useFavorites.ts | 55-94 |
| C2 | 🔴 Critical | Null reference in MapView bounds calculation | MapView.tsx | 306-310 |
| C3 | 🔴 Critical | Browser alert() blocks UI | PropertyDetail.tsx | 131 |
| C4 | 🔴 Critical | window.location.href loses React state | AgentContactCard.tsx | 94, 106 |

### Implementation Details

#### C1: Race Condition in useFavorites

**Problem:** When a user logs in, `syncLocalFavoritesToDatabase` runs asynchronously while the component may re-render with new data, causing:
- Duplicate favorites in database
- `setFavorites` called multiple times with stale data
- `isSyncingRef` guard bypassed when `useCallback` recreates the function

**Current Code (Problematic):**
```typescript
// Lines 55-94 - Race condition between sync and load
useEffect(() => {
  const loadFavorites = async () => {
    if (!user) {
      setFavorites(getLocalFavorites());
      return;
    }

    // Problem: This runs async while component state changes
    await syncLocalFavoritesToDatabase(user.id);

    // By this point, user state may have changed
    const { data } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', user.id);

    setFavorites(data?.map(f => f.property_id) || []);
  };

  loadFavorites();
}, [user]);
```

**Solution:** Implement proper async state machine with cancellation:
```typescript
import { useRef, useEffect, useState, useCallback } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  const loadFavorites = useCallback(async (userId: string | null) => {
    // Cancel any pending operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this operation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    currentUserIdRef.current = userId;

    setIsLoading(true);

    try {
      if (!userId) {
        // Anonymous user - use localStorage only
        if (!abortController.signal.aborted) {
          setFavorites(getLocalFavorites());
          setIsLoading(false);
        }
        return;
      }

      // Authenticated user - sync then load
      setSyncStatus('syncing');

      // Step 1: Get local favorites to sync
      const localFavorites = getLocalFavorites();

      // Step 2: Sync local to database (if any)
      if (localFavorites.length > 0) {
        const { error: syncError } = await supabase
          .from('favorites')
          .upsert(
            localFavorites.map(propertyId => ({
              user_id: userId,
              property_id: propertyId,
            })),
            { onConflict: 'user_id,property_id', ignoreDuplicates: true }
          );

        if (syncError) {
          logger.error('Failed to sync favorites:', syncError);
        } else {
          // Clear local storage after successful sync
          clearLocalFavorites();
        }
      }

      // Check if operation was cancelled
      if (abortController.signal.aborted || currentUserIdRef.current !== userId) {
        return;
      }

      // Step 3: Load from database
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', userId);

      // Final check before updating state
      if (abortController.signal.aborted || currentUserIdRef.current !== userId) {
        return;
      }

      if (error) {
        logger.error('Failed to load favorites:', error);
        setSyncStatus('error');
      } else {
        setFavorites(data?.map(f => f.property_id) || []);
        setSyncStatus('synced');
      }
    } finally {
      if (!abortController.signal.aborted && currentUserIdRef.current === userId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadFavorites(user?.id ?? null);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?.id, loadFavorites]);

  // ... rest of hook
}
```

**Key Improvements:**
1. AbortController cancels pending operations on user change
2. `currentUserIdRef` prevents stale updates
3. `syncStatus` provides visibility into sync state
4. Cleanup function prevents memory leaks

---

#### C2: Null Reference in MapView Bounds

**Problem:** `normalizeCoord()` returns `number | null`, but code uses non-null assertion without validation.

**Current Code (Problematic):**
```typescript
// Lines 306-310
const bounds = new LatLngBounds(
  filteredProperties.map(p => [
    normalizeCoord(p.location.coordinates.lat)!,  // Dangerous!
    normalizeCoord(p.location.coordinates.lng)!   // Dangerous!
  ])
);
```

**Solution:**
```typescript
const handleResetView = useCallback(() => {
  if (filteredProperties.length === 0) return;

  // Filter to only properties with valid coordinates
  const validCoords = filteredProperties
    .map(p => {
      const lat = normalizeCoord(p.location.coordinates.lat);
      const lng = normalizeCoord(p.location.coordinates.lng);
      return lat !== null && lng !== null ? [lat, lng] as [number, number] : null;
    })
    .filter((coord): coord is [number, number] => coord !== null);

  if (validCoords.length === 0) {
    // Fallback to Oaxaca center if no valid coordinates
    setFlyToCenter([17.0732, -96.7266]);
    return;
  }

  const bounds = new LatLngBounds(validCoords);
  setFlyToCenter([bounds.getCenter().lat, bounds.getCenter().lng]);
}, [filteredProperties]);
```

---

#### C3: Browser alert() Blocks UI

**Problem:** Uses blocking `alert()` instead of non-blocking toast.

**Current Code:**
```typescript
// Line 131
alert(language === "es" ? "Mensaje enviado" : "Message sent");
```

**Solution:**
```typescript
import { toast } from 'sonner';

// Replace alert with toast
toast.success(
  language === "es" ? "Mensaje enviado" : "Message sent",
  {
    description: language === "es"
      ? "Nos pondremos en contacto pronto"
      : "We'll get back to you soon"
  }
);
```

---

#### C4: window.location.href Loses React State

**Problem:** Direct URL manipulation bypasses React Router, losing state and causing full page reload.

**Current Code:**
```typescript
// Lines 94, 106
window.location.href = `/contacto?agent=${agent.id}...`;
window.location.href = `/agendar?property=${propertyId}`;
```

**Solution:**
```typescript
import { useNavigate } from 'react-router-dom';

// Inside component
const navigate = useNavigate();

// Replace window.location.href
const handleContactClick = () => {
  const params = new URLSearchParams();
  params.set('agent', agent.id);
  if (propertyId) params.set('property', propertyId);
  navigate(`/contacto?${params.toString()}`);
};

const handleScheduleClick = () => {
  navigate(`/agendar?property=${propertyId}`);
};
```

### Verification Steps

1. `npm run lint` - Must pass
2. `npm run build` - Must pass
3. `npm run test` - All pass
4. Manual testing:
   - Log in/out rapidly while favorites are loading
   - Reset map view with mixed valid/invalid coordinates
   - Submit contact form and verify toast appears
   - Click contact/schedule buttons and verify no page reload

### Success Criteria

- [ ] No race conditions in favorites sync
- [ ] Map handles null coordinates gracefully
- [ ] Toast notifications instead of alerts
- [ ] React Router navigation preserves state

---

## Session 2: Memory & Performance Foundations

**Estimated Tokens:** 50-70K
**Priority:** HIGH
**Theme:** Fix memory leaks and optimize query patterns

### Files to Modify

- `src/pages/MapView.tsx`
- `src/components/admin/PropertiesTable.tsx`
- `src/hooks/useProperties.ts` (if needed)

### Issues Addressed (3 Performance Issues)

| ID | Severity | Issue | File | Line |
|----|----------|-------|------|------|
| P1 | 🟠 High | Debounce cleanup missing on unmount | MapView.tsx | 282-291 |
| P2 | 🟠 Medium | Query invalidation too broad | PropertiesTable.tsx | 102 |
| P3 | 🟠 Low | Icon cache grows unbounded | MapView.tsx | 53-78 |

### Implementation Details

#### P1: Debounce Cleanup Missing

**Problem:** Timeout not cleared on unmount, causing state updates on unmounted component.

**Current Code:**
```typescript
const debounceRef = useRef<number | undefined>(undefined);
const handleBoundsChange = useCallback((bounds: LatLngBounds): void => {
  if (debounceRef.current) {
    clearTimeout(debounceRef.current);
  }
  debounceRef.current = window.setTimeout(() => {
    setMapBounds(bounds);  // Can fire after unmount!
  }, 400);
}, []);
```

**Solution:**
```typescript
const debounceRef = useRef<number | undefined>(undefined);
const isMountedRef = useRef(true);

// Cleanup on unmount
useEffect(() => {
  isMountedRef.current = true;
  return () => {
    isMountedRef.current = false;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };
}, []);

const handleBoundsChange = useCallback((bounds: LatLngBounds): void => {
  if (debounceRef.current) {
    clearTimeout(debounceRef.current);
  }
  debounceRef.current = window.setTimeout(() => {
    if (isMountedRef.current) {
      setMapBounds(bounds);
    }
  }, 400);
}, []);
```

---

#### P2: Query Invalidation Too Broad

**Problem:** Invalidates all admin-properties queries instead of scoped one.

**Current Code:**
```typescript
queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
```

**Solution:**
```typescript
// Invalidate only the specific org's query
queryClient.invalidateQueries({
  queryKey: ['admin-properties', scopedOrgId],
  exact: true
});
```

Also update all delete/update mutations to use scoped invalidation.

---

#### P3: Icon Cache Unbounded Growth

**Problem:** `iconCache` Map grows without limit.

**Solution:** Add cache size limit or clear on filter changes:
```typescript
const MAX_ICON_CACHE_SIZE = 20;

function getPropertyIcon(type: PropertyType, selected: boolean = false): Icon {
  const cacheKey = `${type}-${selected}`;
  let icon = iconCache.get(cacheKey);

  if (!icon) {
    // Clear oldest entries if cache is full
    if (iconCache.size >= MAX_ICON_CACHE_SIZE) {
      const firstKey = iconCache.keys().next().value;
      iconCache.delete(firstKey);
    }

    icon = new Icon({
      // ... icon creation
    });
    iconCache.set(cacheKey, icon);
  }

  return icon;
}
```

### Verification Steps

1. Navigate away from map while panning - no React warnings
2. Delete property - only affected org's list refreshes
3. Check memory usage doesn't grow unbounded

### Success Criteria

- [ ] No memory leaks from debounce
- [ ] Scoped query invalidation
- [ ] Bounded icon cache

---

## Session 3: Security Hardening

**Estimated Tokens:** 60-80K
**Priority:** HIGH
**Theme:** Validate inputs and prevent abuse

### Files to Modify

- `src/utils/favoritesStorage.ts`
- `src/hooks/useSavedSearches.ts`
- `src/hooks/useFavorites.ts`

### Issues Addressed (3 Security Issues)

| ID | Severity | Issue | File | Line |
|----|----------|-------|------|------|
| S1 | 🟡 Medium | localStorage JSON parsing without validation | favoritesStorage.ts | 6 |
| S2 | 🟡 Medium | Same issue in saved searches | useSavedSearches.ts | 18 |
| S3 | 🟡 Medium | No rate limiting on favorites toggle | useFavorites.ts | 103-140 |

### Implementation Details

#### S1 & S2: localStorage JSON Validation

**Problem:** JSON.parse trusts localStorage content without validation.

**Solution for favoritesStorage.ts:**
```typescript
import { z } from 'zod';

const FavoritesSchema = z.array(z.string().uuid());

export const getLocalFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    const validated = FavoritesSchema.safeParse(parsed);

    if (!validated.success) {
      logger.warn('Invalid favorites data in localStorage, clearing');
      localStorage.removeItem(FAVORITES_KEY);
      return [];
    }

    return validated.data;
  } catch {
    logger.warn('Failed to parse favorites from localStorage');
    return [];
  }
};
```

**Solution for useSavedSearches.ts:**
```typescript
import { z } from 'zod';

const SavedSearchSchema = z.object({
  id: z.string(),
  name: z.string(),
  filters: z.record(z.unknown()),
  createdAt: z.string(),
});

const SavedSearchesSchema = z.array(SavedSearchSchema);

const loadSearches = (): SavedSearch[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    const validated = SavedSearchesSchema.safeParse(parsed);

    if (!validated.success) {
      logger.warn('Invalid saved searches in localStorage, clearing');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return validated.data;
  } catch {
    return [];
  }
};
```

---

#### S3: Rate Limiting on Favorites

**Problem:** Rapid toggling can spam the database.

**Solution:**
```typescript
import { useRef, useCallback } from 'react';

const RATE_LIMIT_MS = 500;  // Minimum time between operations

export function useFavorites() {
  const lastOperationRef = useRef<number>(0);
  const pendingOperationRef = useRef<NodeJS.Timeout | null>(null);

  const addFavorite = useCallback(async (propertyId: string) => {
    const now = Date.now();
    const timeSinceLastOp = now - lastOperationRef.current;

    // Clear any pending operation
    if (pendingOperationRef.current) {
      clearTimeout(pendingOperationRef.current);
    }

    if (timeSinceLastOp < RATE_LIMIT_MS) {
      // Debounce rapid toggles
      return new Promise<void>((resolve) => {
        pendingOperationRef.current = setTimeout(async () => {
          lastOperationRef.current = Date.now();
          await performAddFavorite(propertyId);
          resolve();
        }, RATE_LIMIT_MS - timeSinceLastOp);
      });
    }

    lastOperationRef.current = now;
    await performAddFavorite(propertyId);
  }, []);

  // Similar for removeFavorite...
}
```

### Verification Steps

1. Corrupt localStorage data and reload - app should recover gracefully
2. Rapidly toggle favorites - only last state persists
3. Check network tab - no rapid-fire database requests

### Success Criteria

- [ ] localStorage data validated with Zod
- [ ] Malformed data cleared automatically
- [ ] Rate limiting prevents abuse

---

## Session 4: UX Polish

**Estimated Tokens:** 70-90K
**Priority:** MEDIUM
**Theme:** Improve user experience and accessibility

### Files to Modify

- `src/pages/PropertyDetail.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/contexts/LanguageContext.tsx` (for translations)
- `src/utils/translations.ts`

### Issues Addressed (3 UX Issues)

| ID | Severity | Issue | File | Line |
|----|----------|-------|------|------|
| U1 | 🔵 Medium | Missing loading state in contact form | PropertyDetail.tsx | 430-472 |
| U2 | 🔵 Medium | ErrorBoundary shows Spanish only | ErrorBoundary.tsx | 74-79 |
| U3 | 🔵 Low | No keyboard navigation for gallery | PropertyDetail.tsx | 245-263 |

### Implementation Details

#### U1: Loading State for Contact Form

**Problem:** No feedback while form submits.

**Solution:**
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleContactSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // ... form submission logic
    toast.success(language === "es" ? "Mensaje enviado" : "Message sent");
    // Reset form
  } catch (error) {
    toast.error(language === "es" ? "Error al enviar" : "Failed to send");
  } finally {
    setIsSubmitting(false);
  }
};

// In JSX:
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {language === "es" ? "Enviando..." : "Sending..."}
    </>
  ) : (
    language === "es" ? "Enviar mensaje" : "Send message"
  )}
</Button>
```

---

#### U2: ErrorBoundary i18n

**Problem:** Error messages hardcoded in Spanish.

**Solution:**
```typescript
// Add to translations.ts
errorBoundary: {
  title: 'Algo salió mal',
  titleEn: 'Something went wrong',
  description: 'Ha ocurrido un error inesperado.',
  descriptionEn: 'An unexpected error has occurred.',
  retry: 'Intentar de nuevo',
  retryEn: 'Try again',
  goHome: 'Ir al inicio',
  goHomeEn: 'Go home',
}

// Update ErrorBoundary.tsx to accept language prop or use context
// Since error boundaries can't use hooks, pass language as prop
interface ErrorBoundaryProps {
  children: React.ReactNode;
  language?: 'es' | 'en';
}

// In fallback UI:
<h1>{language === 'en' ? 'Something went wrong' : 'Algo salió mal'}</h1>
```

---

#### U3: Keyboard Navigation for Gallery

**Problem:** Can't navigate thumbnails with arrow keys.

**Solution:**
```typescript
const [selectedImageIndex, setSelectedImageIndex] = useState(0);

const handleKeyDown = useCallback((e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    setSelectedImageIndex(prev =>
      prev > 0 ? prev - 1 : property.images.length - 1
    );
  } else if (e.key === 'ArrowRight') {
    setSelectedImageIndex(prev =>
      prev < property.images.length - 1 ? prev + 1 : 0
    );
  }
}, [property.images.length]);

useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleKeyDown]);

// Add visual indicator for keyboard focus
<div
  className="gallery-container"
  tabIndex={0}
  role="region"
  aria-label={language === 'es' ? 'Galería de imágenes' : 'Image gallery'}
>
  {/* thumbnails */}
</div>
```

### Verification Steps

1. Submit contact form - see loading spinner
2. Trigger error boundary in English mode - see English text
3. Focus gallery, use arrow keys - images change
4. Screen reader announces gallery navigation

### Success Criteria

- [ ] Loading states on all forms
- [ ] Bilingual error messages
- [ ] Full keyboard navigation
- [ ] ARIA labels for accessibility

---

## Session 5: List Virtualization

**Estimated Tokens:** 90-110K
**Priority:** MEDIUM
**Theme:** Handle large datasets efficiently

### Files to Modify

- `src/pages/Properties.tsx`
- `src/pages/MapView.tsx`
- `package.json` (add @tanstack/react-virtual)

### Issues Addressed

| ID | Severity | Issue | File |
|----|----------|-------|------|
| V1 | 🟠 Medium | No virtualization for property grid | Properties.tsx |
| V2 | 🟠 Medium | No virtualization for map sidebar | MapView.tsx |

### Implementation Details

#### Install Dependencies

```bash
npm install @tanstack/react-virtual
```

#### V1: Virtualize Properties Grid

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

// Inside Properties component
const parentRef = useRef<HTMLDivElement>(null);

const rowVirtualizer = useVirtualizer({
  count: Math.ceil(filteredProperties.length / 3), // 3 columns
  getScrollElement: () => parentRef.current,
  estimateSize: () => 400, // Estimated row height
  overscan: 2,
});

// Render
<div ref={parentRef} className="h-[80vh] overflow-auto">
  <div
    style={{
      height: `${rowVirtualizer.getTotalSize()}px`,
      position: 'relative',
    }}
  >
    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
      const startIndex = virtualRow.index * 3;
      const rowProperties = filteredProperties.slice(startIndex, startIndex + 3);

      return (
        <div
          key={virtualRow.key}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {rowProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      );
    })}
  </div>
</div>
```

#### V2: Virtualize MapView Sidebar List

Similar implementation for the property list in the map sidebar.

### Verification Steps

1. Load 500+ properties - no lag
2. Scroll performance smooth
3. Memory usage stable during scroll

### Success Criteria

- [ ] Virtualized property grid
- [ ] Virtualized map sidebar
- [ ] Smooth scrolling with 500+ items
- [ ] Memory usage under control

---

## Session 6: Final Polish & Testing

**Estimated Tokens:** 50-70K
**Priority:** HIGH
**Theme:** Ensure all changes are tested and documented

### Tasks

1. **Update existing tests** for changed components
2. **Add new tests** for:
   - useFavorites race condition handling
   - localStorage validation
   - Rate limiting behavior
3. **Run full test suite** with coverage
4. **Update documentation**
5. **Final quality gates**

### Test Cases to Add

```typescript
// src/hooks/useFavorites.test.tsx
describe('useFavorites race conditions', () => {
  it('cancels pending sync when user changes', async () => {
    // Test abort controller behavior
  });

  it('prevents duplicate favorites during rapid auth changes', async () => {
    // Simulate login/logout rapidly
  });
});

// src/utils/favoritesStorage.test.ts
describe('favoritesStorage validation', () => {
  it('rejects non-array data', () => {
    localStorage.setItem('favorites', '{"invalid": true}');
    expect(getLocalFavorites()).toEqual([]);
  });

  it('rejects array with non-UUID strings', () => {
    localStorage.setItem('favorites', '["not-a-uuid", "also-invalid"]');
    expect(getLocalFavorites()).toEqual([]);
  });
});
```

### Final Quality Gates

```bash
npm run lint          # Zero errors
npm run build         # Passes
npm run test          # All pass
npm audit             # Zero high vulnerabilities
npx tsc --noEmit      # No type errors
```

### Success Criteria

- [ ] All tests pass
- [ ] Test coverage maintained/improved
- [ ] Documentation updated
- [ ] All quality gates pass

---

## Progress Tracking

| Session | Status | Date | Issues Fixed |
|---------|--------|------|--------------|
| 1 | Pending | - | C1, C2, C3, C4 |
| 2 | Pending | - | P1, P2, P3 |
| 3 | Pending | - | S1, S2, S3 |
| 4 | Pending | - | U1, U2, U3 |
| 5 | Pending | - | V1, V2 |
| 6 | Pending | - | Testing & docs |

---

## Execution Checklist

### Before Starting Each Session

- [ ] `git fetch --all && git status -sb` - Sync first
- [ ] Read relevant section of this plan
- [ ] Review files to be modified

### After Each Session

- [ ] `npm run lint` - Zero errors
- [ ] `npm run build` - Passes
- [ ] `npm run test` - All pass
- [ ] Commit changes with clear message
- [ ] Update progress in this file

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| useFavorites refactor breaks existing functionality | Comprehensive tests, staged rollout |
| Virtualization affects scroll behavior | Test with various viewport sizes |
| Rate limiting frustrates users | Use debounce, not hard block |

---

## Notes

- Sessions 1-3 are foundational and should be done first
- Sessions 4-5 can be done in parallel if needed
- Session 6 must be last

---

**Last Updated:** December 11, 2025
