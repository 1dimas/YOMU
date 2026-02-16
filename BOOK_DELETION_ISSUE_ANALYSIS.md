# Book Deletion Issue Analysis - Category Deletion Failure

## Problem Summary
Books are successfully deleted from the frontend (disappear from table) and categories are refetched, but the backend still rejects category deletion with error: **"Cannot delete category with associated books"**

---

## 1. API CALLS BEING MADE

### Book Deletion Flow (buku/page.tsx - confirmDelete function)
```typescript
// Step 1: Delete book
await booksApi.delete(confirmDeleteId);  // DELETE /api/books/{id}

// Step 2: Update local state immediately
setBooks((prevBooks) => prevBooks.filter(b => b.id !== confirmDeleteId));

// Step 3: Refetch categories to update book counts
const catRes = await categoriesApi.getAll();
setCategories(catRes.data || []);
```

### API Endpoints
**From lib/api.ts:**

```typescript
// Delete Book
export const booksApi = {
    delete: async (id: string) => {
        return fetchApi<ApiResponse<null>>(`/books/${id}`, { method: 'DELETE' });
    },
};

// Refetch Categories
export const categoriesApi = {
    getAll: async () => {
        return fetchApi<ApiResponse<import('@/types').Category[]>>('/categories');
    },
    
    // Category Delete (used later in kategori/page.tsx)
    delete: async (id: string) => {
        return fetchApi<ApiResponse<null>>(`/categories/${id}`, { method: 'DELETE' });
    },
};
```

**Exact Calls Made:**
1. `DELETE /api/books/{bookId}`
2. `GET /api/categories` (with refetch)

---

## 2. RESPONSE STRUCTURE FOR CATEGORIES

### Category Type Definition (types/index.ts)
```typescript
export interface Category {
    id: string;
    name: string;
    color?: string;
    description?: string;
    bookCount?: number;                    // ⚠️ Problem field #1
    _count?: { books: number };            // ⚠️ Problem field #2
    createdAt: string;
}
```

### Data Display in kategori/page.tsx
```tsx
<td>
    <span className="stok-badge high">
        {kategori._count?.books ?? kategori.bookCount ?? 0}  // Falls back through multiple fields
    </span>
</td>
```

### Problem: Dual Book Count Fields
- **`_count.books`**: Prisma-style count (from backend relation count)
- **`bookCount`**: Custom field that might be from API response

The frontend tries **both**, but one might be stale.

---

## 3. CACHING MECHANISMS IN FRONTEND

### Category Caching Strategy (kategori/page.tsx)

**Implemented Caching:**
```typescript
// 1. Last refetch time tracking to debounce
const [lastRefetchTime, setLastRefetchTime] = useState<number>(0);

// 2. Visibility-based refetch
useEffect(() => {
    const handleVisibilityChange = async () => {
        if (document.visibilityState === 'visible') {
            const now = Date.now();
            // Only refetch if 5 seconds have passed since last refetch
            if (now - lastRefetchTime > 5000) {
                setLastRefetchTime(now);
                await fetchCategories(false);
            }
        }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}, [lastRefetchTime]);
```

### Problem in Buku Page (buku/page.tsx)
```typescript
// After book deletion, categories are refetched:
const catRes = await categoriesApi.getAll();
setCategories(catRes.data || []);
```

**BUT:** This refetch happens in the buku/page.tsx context, NOT in kategori/page.tsx.
- Both pages have **separate state** for categories
- Refetch in buku/page.tsx does NOT update kategori/page.tsx state
- User must manually navigate to kategori page or wait for visibility change

### Issue #1: State Isolation
Each page maintains its own categories state:
- `buku/page.tsx` → `[books, setBooks]` + local categories state
- `kategori/page.tsx` → separate local categories state
- **No shared context or global state sync**

### Issue #2: Backend Caching
The backend's category book count might be **cached** or **not recalculated** immediately after book deletion.

---

## 4. ROOT CAUSE ANALYSIS

### Why Category Deletion Still Fails After Book Deletion

**Scenario:**
1. User has Category "Fiction" with 3 books
2. User deletes 1 book from buku/page.tsx
3. Categories refetch happens in buku/page.tsx
4. Frontend shows updated book count: 2 books
5. User navigates to kategori/page.tsx
6. kategori/page.tsx fetches categories on mount (fresh state)
7. **Backend still shows the original count** OR recalculates differently

### Possible Backend Issues

**Issue A: Database Relationship Not Properly Maintained**
```
// Backend scenario
- Book deletion might not be cascading properly
- OR book's categoryId foreign key not being updated
- OR database transaction incomplete
```

**Issue B: Backend Caches Book Count**
```
// Backend stores bookCount in Category table (denormalized)
- SELECT bookCount FROM categories WHERE id = X
- Book deletion updates Book table but NOT Category.bookCount
- Backend checks: IF bookCount > 0, reject deletion
```

**Issue C: Backend Uses JOIN Query (Most Likely)**
```sql
-- Backend likely does this:
SELECT COUNT(*) as bookCount
FROM books
WHERE categoryId = ? AND deletedAt IS NULL

-- This should work... UNLESS:
1. Transaction isolation level is wrong
2. Book deletion is soft-delete (marked as deleted, not removed)
3. Book deletion isn't committed before category check
```

---

## 5. FRONTEND DATA FLOW ISSUES

### The Exact Problem

**In buku/page.tsx after book deletion:**
```typescript
// ✅ Books removed from state
setBooks((prevBooks) => prevBooks.filter(b => b.id !== confirmDeleteId));

// ⚠️ Categories refetched (only in this page's state)
const catRes = await categoriesApi.getAll();
setCategories(catRes.data || []);  // This is LOCAL state, not shared
```

**In kategori/page.tsx when user navigates there:**
```typescript
// First render - fetches fresh categories
useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
        fetchCategories(true);  // Initial fetch
    }
}, [isAuthenticated, authLoading, router, user?.role]);

// Gets response with STALE data from backend
```

---

## 6. WHAT BACKEND NEEDS TO DO

### Fix #1: Immediate Recalculation
After deleting a book, backend should:
```
1. DELETE FROM books WHERE id = ?
2. Immediately verify: SELECT COUNT(*) FROM books WHERE categoryId = (from deleted book)
3. Return updated categories with fresh counts
```

### Fix #2: Remove Denormalized Count
If backend stores `bookCount` in categories table:
```
- Either: Delete the bookCount column and always calculate from books
- Or: Trigger an UPDATE on category bookCount whenever a book is added/deleted
```

### Fix #3: Use Transactions Properly
```sql
BEGIN TRANSACTION;
  DELETE FROM books WHERE id = ?;
  -- This ensures counts are recalculated in same transaction
COMMIT;
```

### Fix #4: Ensure Cascade Delete Works
```
- Books.categoryId should CASCADE on category delete
- OR validate counts AFTER taking into account newly deleted books
```

---

## 7. FRONTEND OPTIMIZATIONS NEEDED

### Issue #1: State Sharing
**Current:**
- Each admin page has isolated category state
- No real-time sync between pages

**Solution:**
```typescript
// Option A: Use React Context for shared categories
export const CategoriesContext = createContext<{
    categories: Category[];
    refetchCategories: () => Promise<void>;
}>({...});

// Option B: Use localStorage to sync
- Store last fetch time and categories in localStorage
- All pages check localStorage before fetching
- On focus/visibility change, check if data is stale

// Option C: Use SWR or React Query
- Centralized cache with automatic sync
- Multiple queries to same endpoint share cache
```

### Issue #2: Immediate Update After Deletion
**Current buku/page.tsx:**
```typescript
setBooks(prevBooks => prevBooks.filter(b => b.id !== confirmDeleteId));
const catRes = await categoriesApi.getAll();
setCategories(catRes.data || []);
```

**Problem:** 
- Refetch is done only in buku page
- If user navigates away before fetch completes, old data persists in kategori page

**Better approach:**
```typescript
// Calculate book count changes locally
setBooks(prevBooks => prevBooks.filter(b => b.id !== confirmDeleteId));

// Optimistically update categories count
setCategories(prevCats => 
    prevCats.map(cat => ({
        ...cat,
        _count: {
            books: Math.max(0, (cat._count?.books ?? 0) - 1)
        }
    }))
);

// Then refetch to confirm
const catRes = await categoriesApi.getAll();
setCategories(catRes.data || []);
```

---

## SUMMARY TABLE

| Component | Issue | Impact | Fix |
|-----------|-------|--------|-----|
| **Backend** | Book counts cached or not recalculated after deletion | Category deletion rejected despite book deletion | Recalculate counts in transaction |
| **Backend** | Denormalized bookCount column might exist | Counts become stale after deletes | Use triggers or remove column |
| **Frontend** | State isolated per page | kategori/page shows stale data | Use Context/SWR/localStorage |
| **Frontend** | Refetch only happens in buku/page | kategori/page doesn't get notified | Trigger global refetch after delete |
| **Frontend** | Multiple book count fields (`_count.books` vs `bookCount`) | Which field is correct? | Standardize on one field |
| **Timing** | Race condition between delete and refetch | Backend check happens before new count | Ensure transactional consistency |

---

## RECOMMENDED INVESTIGATION STEPS

### On Backend:
1. Check if categories table has `bookCount` column → if yes, add trigger
2. Check book deletion query → ensure it's transactional
3. Check category deletion validation → when exactly does it count books?
4. Test manually: Delete a book via API, then check category via API

### On Frontend:
1. Add debug logging to show actual count values in categories response
2. Compare backend count with frontend calculated count
3. Implement shared state (Context/SWR) for categories
4. Test page navigation timing

---

## API CALLS FLOW DIAGRAM

```
User clicks delete book in buku/page
    ↓
DELETE /api/books/{bookId} ✅ (succeeds)
    ↓
Local state updated (book removed from table)
    ↓
GET /api/categories (refetch) ✅ (succeeds)
    ↓
Response contains category counts
    ├─ If backend cached: old count 3 ❌
    └─ If backend fresh: new count 2 ✅
    ↓
setCategories in buku/page (not shared)
    ↓
User navigates to kategori/page
    ↓
useEffect triggers → GET /api/categories (fresh fetch)
    ↓
If timing issue: Gets old data before backend updated
If backend issue: Gets stale count despite recalculation
    ↓
Try to DELETE /api/categories/{id}
    ↓
Backend checks: SELECT COUNT(*) FROM books WHERE categoryId = ?
    ├─ Returns 3 (old count) ❌
    └─ Returns 2 (new count but still > 0) ✅ for now, but wrong if count was 1
    ↓
"Cannot delete category with associated books" ❌
```

