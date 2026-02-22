# Prompt Keeper — Bugfix Implementation Workflow

_Date: 2026-02-23_
_Strategy: Systematic | Depth: Normal_

---

## Context

Three issues were identified comparing the implementation plan against the actual codebase:

| # | Issue | Severity | Files Affected |
|---|---|---|---|
| 1 | Tag filtering not implemented in sidebar | Feature gap | `Sidebar.jsx`, `PromptListPage.jsx`, `SearchContext.jsx` |
| 2 | Presets async bug — `setPresets` receives a Promise | Bug | `VariablesPanel.jsx` |
| 3 | Storage tests weakened after localStorage→API migration | Test gap | `storage.test.js` |

---

## Phase 1: Fix Presets Async Bug

**Priority:** Critical — breaks existing functionality
**Estimated scope:** 1 file, ~5 lines changed

### Problem

`VariablesPanel.jsx:16` calls `setPresets(fetchPresets(promptId))`. Since `fetchPresets` (which is `getPresets` from `storage.js`) now returns a **Promise** (it uses `fetch()`), the state is set to a Promise object instead of the resolved array. Presets never display.

### Fix

**File:** `src/components/VariablesPanel.jsx`

**Change:** Convert the `useEffect` to handle the Promise:

```jsx
// BEFORE (line 15-17)
useEffect(() => {
  setPresets(fetchPresets(promptId))
}, [promptId])

// AFTER
useEffect(() => {
  fetchPresets(promptId).then(setPresets)
}, [promptId])
```

**Also fix `handleSavePreset`** (line 31-35) — `addPreset` is also async now:

```jsx
// BEFORE
const handleSavePreset = (name) => {
  const preset = addPreset({ promptId, name, values })
  setPresets(prev => [...prev, preset])
  setShowPresetModal(false)
}

// AFTER
const handleSavePreset = async (name) => {
  const preset = await addPreset({ promptId, name, values })
  setPresets(prev => [...prev, preset])
  setShowPresetModal(false)
}
```

**And fix `handleDeletePreset`** (line 37-40) — `removePreset` is also async:

```jsx
// BEFORE
const handleDeletePreset = (presetId) => {
  removePreset(presetId)
  setPresets(prev => prev.filter(p => p.id !== presetId))
}

// AFTER
const handleDeletePreset = async (presetId) => {
  await removePreset(presetId)
  setPresets(prev => prev.filter(p => p.id !== presetId))
}
```

### Validation

- Start dev server (`npm run dev`)
- Create a prompt with `[variable]` placeholders
- Fill in variable values
- Click "Save preset" → name it → confirm it appears as a chip
- Reload the page → confirm the preset persists and loads correctly
- Delete a preset → confirm it disappears

---

## Phase 2: Implement Tag Filtering

**Priority:** Medium — planned feature not delivered
**Estimated scope:** 3 files, ~30 lines changed

### Problem

The design plan specified clickable tag chips in the sidebar that filter the prompt list. The current implementation renders tags as static `<span>` elements with no interactivity.

### Approach

Use the existing `SearchContext` to add an `activeTag` state (avoids creating a new context). The sidebar sets the active tag; the prompt list page filters by it.

### Step 2.1: Extend SearchContext with activeTag

**File:** `src/store/SearchContext.jsx`

Add `activeTag` / `setActiveTag` state alongside the existing `query`/`setQuery`:

```jsx
const [activeTag, setActiveTag] = useState(null)
// expose in value: { query, setQuery, activeTag, setActiveTag }
```

### Step 2.2: Make tag chips clickable in Sidebar

**File:** `src/components/Sidebar.jsx`

- Import `useSearch` (already imported)
- Destructure `activeTag, setActiveTag` from `useSearch()`
- Change the tag `<span>` to a `<button>` with onClick toggle:

```jsx
<button
  key={tag}
  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
  className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
    activeTag === tag
      ? 'bg-blue-600 border-blue-500 text-white'
      : 'border-gray-700 text-gray-400 hover:border-gray-500'
  }`}
>
  {tag}
</button>
```

### Step 2.3: Filter by activeTag in PromptListPage

**File:** `src/pages/PromptListPage.jsx`

- Destructure `activeTag` from `useSearch()`
- Add a filtering step after the existing `searched` filter:

```jsx
const searched = filtered.filter(p =>
  !query || ...existing logic...
)

const tagged = activeTag
  ? searched.filter(p => p.tags?.includes(activeTag))
  : searched
```

- Replace `searched` with `tagged` in the render output

### Validation

- Create several prompts with different tags (e.g., "coding", "email", "marketing")
- Click a tag chip in the sidebar → only prompts with that tag appear
- Click the same tag again → filter clears, all prompts shown
- Combine with search → both filters apply together
- Navigate to a folder view → tag filter still works within the folder

---

## Phase 3: Strengthen Storage Tests

**Priority:** Low — code quality / coverage
**Estimated scope:** 1 file, ~40 lines changed

### Problem

After migrating from localStorage to API-based storage, the original comprehensive CRUD tests were replaced with a single "exports exist" check. The API functions themselves are thin `fetch()` wrappers, so unit-testing them requires mocking `fetch`.

### Approach

Add unit tests with `globalThis.fetch` mocked via `vi.fn()`. Test that each function:
- Calls the correct endpoint with the correct method
- Sends the right body for POST/PUT
- Returns the parsed JSON response

### Implementation

**File:** `src/store/storage.test.js`

```js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getFolders, saveFolder, updateFolder, deleteFolder,
  getPrompts, savePrompt, updatePrompt, deletePrompt,
  getPresets, savePreset, deletePreset,
} from './storage'

function mockFetch(data) {
  return vi.fn(() => Promise.resolve({ json: () => Promise.resolve(data) }))
}

beforeEach(() => { vi.restoreAllMocks() })

describe('folders', () => {
  it('getFolders calls GET /api/folders', async () => {
    globalThis.fetch = mockFetch([])
    const result = await getFolders()
    expect(fetch).toHaveBeenCalledWith('/api/folders')
    expect(result).toEqual([])
  })

  it('saveFolder calls POST /api/folders with body', async () => {
    const folder = { id: '1', name: 'Test', color: '#fff' }
    globalThis.fetch = mockFetch(folder)
    const result = await saveFolder({ name: 'Test', color: '#fff' })
    expect(fetch).toHaveBeenCalledWith('/api/folders', expect.objectContaining({
      method: 'POST',
    }))
    expect(result).toEqual(folder)
  })

  it('updateFolder calls PUT /api/folders/:id', async () => {
    const folder = { id: '1', name: 'Updated', color: '#fff' }
    globalThis.fetch = mockFetch(folder)
    await updateFolder(folder)
    expect(fetch).toHaveBeenCalledWith('/api/folders/1', expect.objectContaining({
      method: 'PUT',
    }))
  })

  it('deleteFolder calls DELETE /api/folders/:id', async () => {
    globalThis.fetch = mockFetch({ ok: true })
    await deleteFolder('1')
    expect(fetch).toHaveBeenCalledWith('/api/folders/1', { method: 'DELETE' })
  })
})

// Similar patterns for prompts and presets...
```

### Validation

- Run `npm run test` → all tests pass
- Verify no regressions in variable tests

---

## Execution Order & Dependencies

```
Phase 1 (Presets async bug)
  └── No dependencies, can start immediately
  └── Highest priority — existing feature is broken

Phase 2 (Tag filtering)
  └── No dependency on Phase 1
  └── Can run in parallel with Phase 1

Phase 3 (Storage tests)
  └── No dependency on Phase 1 or 2
  └── Can run in parallel, lowest priority
```

All three phases are **independent** and can be implemented in parallel or sequentially.

**Recommended order:** Phase 1 → Phase 2 → Phase 3 (by severity)

---

## Files Changed Summary

| File | Phase | Change Type |
|---|---|---|
| `src/components/VariablesPanel.jsx` | 1 | Bug fix — await async calls |
| `src/store/SearchContext.jsx` | 2 | Add `activeTag` state |
| `src/components/Sidebar.jsx` | 2 | Make tag chips clickable |
| `src/pages/PromptListPage.jsx` | 2 | Filter by active tag |
| `src/store/storage.test.js` | 3 | Rewrite with fetch mocks |

**Total: 5 files modified, 0 files created**
