# Prompt Keeper Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local-first React PWA for managing, organizing, and reusing AI prompts with variable substitution, presets, folders, and tags.

**Architecture:** Single-page React app with React Router for navigation. All data stored in localStorage as JSON. Variable detection via regex on prompt body. State managed with React context + useReducer for the data layer, local component state for transient UI (variable values, preset modal).

**Tech Stack:** React 18, Vite, TailwindCSS v3, React Router v6, Lucide React, Vitest + React Testing Library

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`
- Create: `src/main.jsx`, `src/App.jsx`, `src/index.css`

**Step 1: Scaffold Vite + React project**

```bash
cd /sessions/amazing-dreamy-faraday/mnt/prompt-keeper
npm create vite@latest . -- --template react
npm install
```

**Step 2: Install dependencies**

```bash
npm install react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

**Step 3: Configure Tailwind — update `tailwind.config.js`**

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**Step 4: Configure Vitest — update `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
```

**Step 5: Create test setup — `src/test/setup.js`**

```js
import '@testing-library/jest-dom'
```

**Step 6: Replace `src/index.css` with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 7: Replace `src/App.jsx` with a hello-world stub**

```jsx
export default function App() {
  return <div className="min-h-screen bg-gray-950 text-white p-4">Prompt Keeper</div>
}
```

**Step 8: Run dev server to confirm it works**

```bash
npm run dev
```
Expected: browser shows "Prompt Keeper" on dark background.

**Step 9: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold React + Vite + Tailwind + Vitest"
```

---

## Task 2: Data Layer — Storage Utilities

**Files:**
- Create: `src/store/storage.js`
- Create: `src/store/storage.test.js`

The store manages three collections in localStorage: `folders`, `prompts`, `presets`. Each is a JSON array. Provide CRUD helpers for each.

**Step 1: Write failing tests — `src/store/storage.test.js`**

```js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getFolders, saveFolder, updateFolder, deleteFolder,
  getPrompts, savePrompt, updatePrompt, deletePrompt,
  getPresets, savePreset, deletePreset,
} from './storage'

beforeEach(() => localStorage.clear())

describe('folders', () => {
  it('returns empty array when no folders saved', () => {
    expect(getFolders()).toEqual([])
  })
  it('saves and retrieves a folder', () => {
    const f = saveFolder({ name: 'Test', color: '#3b82f6' })
    expect(f.id).toBeDefined()
    expect(getFolders()).toHaveLength(1)
    expect(getFolders()[0].name).toBe('Test')
  })
  it('updates a folder', () => {
    const f = saveFolder({ name: 'Old', color: '#fff' })
    updateFolder({ ...f, name: 'New' })
    expect(getFolders()[0].name).toBe('New')
  })
  it('deletes a folder', () => {
    const f = saveFolder({ name: 'Del', color: '#fff' })
    deleteFolder(f.id)
    expect(getFolders()).toHaveLength(0)
  })
})

describe('prompts', () => {
  it('returns empty array when no prompts saved', () => {
    expect(getPrompts()).toEqual([])
  })
  it('saves and retrieves a prompt', () => {
    const p = savePrompt({ title: 'My Prompt', body: 'Hello [name]', tags: [], folderId: null, sourceUrl: null })
    expect(p.id).toBeDefined()
    expect(getPrompts()[0].title).toBe('My Prompt')
  })
  it('updates a prompt', () => {
    const p = savePrompt({ title: 'Old', body: '', tags: [], folderId: null, sourceUrl: null })
    updatePrompt({ ...p, title: 'New' })
    expect(getPrompts()[0].title).toBe('New')
  })
  it('deletes a prompt', () => {
    const p = savePrompt({ title: 'Del', body: '', tags: [], folderId: null, sourceUrl: null })
    deletePrompt(p.id)
    expect(getPrompts()).toHaveLength(0)
  })
})

describe('presets', () => {
  it('saves and retrieves presets for a prompt', () => {
    const preset = savePreset({ promptId: 'p1', name: 'Work', values: { tone: 'formal' } })
    expect(preset.id).toBeDefined()
    expect(getPresets('p1')).toHaveLength(1)
    expect(getPresets('p2')).toHaveLength(0)
  })
  it('deletes a preset', () => {
    const preset = savePreset({ promptId: 'p1', name: 'Work', values: {} })
    deletePreset(preset.id)
    expect(getPresets('p1')).toHaveLength(0)
  })
})
```

**Step 2: Run tests — confirm they fail**

```bash
npm run test
```
Expected: multiple "not a function" errors.

**Step 3: Implement `src/store/storage.js`**

```js
import { v4 as uuid } from 'crypto'

// crypto.randomUUID is available in modern browsers; use a tiny fallback:
const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const load = (key) => JSON.parse(localStorage.getItem(key) || '[]')
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data))

// --- Folders ---
export const getFolders = () => load('folders')

export const saveFolder = (data) => {
  const folders = getFolders()
  const folder = { ...data, id: newId(), createdAt: new Date().toISOString() }
  save('folders', [...folders, folder])
  return folder
}

export const updateFolder = (updated) => {
  save('folders', getFolders().map(f => f.id === updated.id ? updated : f))
}

export const deleteFolder = (id) => {
  save('folders', getFolders().filter(f => f.id !== id))
}

// --- Prompts ---
export const getPrompts = () => load('prompts')

export const savePrompt = (data) => {
  const prompts = getPrompts()
  const now = new Date().toISOString()
  const prompt = { ...data, id: newId(), createdAt: now, updatedAt: now }
  save('prompts', [...prompts, prompt])
  return prompt
}

export const updatePrompt = (updated) => {
  save('prompts', getPrompts().map(p =>
    p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p
  ))
}

export const deletePrompt = (id) => {
  save('prompts', getPrompts().filter(p => p.id !== id))
  // Also clean up presets for this prompt
  save('presets', load('presets').filter(pr => pr.promptId !== id))
}

// --- Presets ---
export const getPresets = (promptId) =>
  load('presets').filter(p => p.promptId === promptId)

export const savePreset = (data) => {
  const presets = load('presets')
  const preset = { ...data, id: newId(), createdAt: new Date().toISOString() }
  save('presets', [...presets, preset])
  return preset
}

export const deletePreset = (id) => {
  save('presets', load('presets').filter(p => p.id !== id))
}
```

**Step 4: Run tests — confirm they pass**

```bash
npm run test
```
Expected: all storage tests PASS.

**Step 5: Commit**

```bash
git add src/store/
git commit -m "feat: add localStorage CRUD storage layer"
```

---

## Task 3: Variable Detection Utility

**Files:**
- Create: `src/utils/variables.js`
- Create: `src/utils/variables.test.js`

**Step 1: Write failing tests — `src/utils/variables.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { extractVariables, resolvePrompt } from './variables'

describe('extractVariables', () => {
  it('returns empty array for prompt with no vars', () => {
    expect(extractVariables('Hello world')).toEqual([])
  })
  it('extracts single variable', () => {
    expect(extractVariables('Write a [tone] email')).toEqual(['tone'])
  })
  it('extracts multiple unique variables', () => {
    expect(extractVariables('Dear [name], I am [tone] about [topic]'))
      .toEqual(['name', 'tone', 'topic'])
  })
  it('deduplicates repeated variable names', () => {
    expect(extractVariables('[name] met [name] today')).toEqual(['name'])
  })
  it('handles underscored variable names', () => {
    expect(extractVariables('Use [first_name] here')).toEqual(['first_name'])
  })
})

describe('resolvePrompt', () => {
  it('replaces filled variables', () => {
    expect(resolvePrompt('Hello [name]', { name: 'Ozan' })).toBe('Hello Ozan')
  })
  it('leaves unfilled variables as-is', () => {
    expect(resolvePrompt('Hello [name]', {})).toBe('Hello [name]')
  })
  it('replaces only variables that have values', () => {
    expect(resolvePrompt('Hi [name], your tone is [tone]', { name: 'Ozan' }))
      .toBe('Hi Ozan, your tone is [tone]')
  })
})
```

**Step 2: Run tests — confirm they fail**

```bash
npm run test
```

**Step 3: Implement `src/utils/variables.js`**

```js
const VAR_REGEX = /\[([a-zA-Z0-9_\s]+)\]/g

export function extractVariables(body) {
  const matches = [...body.matchAll(VAR_REGEX)]
  const names = matches.map(m => m[1].trim())
  return [...new Set(names)]
}

export function resolvePrompt(body, values) {
  return body.replace(VAR_REGEX, (match, name) => {
    const key = name.trim()
    return values[key] !== undefined && values[key] !== '' ? values[key] : match
  })
}
```

**Step 4: Run tests — all pass**

```bash
npm run test
```
Expected: all variable tests PASS.

**Step 5: Commit**

```bash
git add src/utils/
git commit -m "feat: add variable extraction and resolution utilities"
```

---

## Task 4: App State Context

**Files:**
- Create: `src/store/AppContext.jsx`

This context wraps the whole app and provides folders/prompts/presets + CRUD actions so any component can read/write without prop-drilling.

**Step 1: Create `src/store/AppContext.jsx`**

```jsx
import { createContext, useContext, useReducer, useEffect } from 'react'
import {
  getFolders, saveFolder, updateFolder, deleteFolder,
  getPrompts, savePrompt, updatePrompt, deletePrompt,
  getPresets, savePreset, deletePreset,
} from './storage'

const AppContext = createContext(null)

function init() {
  return {
    folders: getFolders(),
    prompts: getPrompts(),
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_FOLDER': return { ...state, folders: [...state.folders, action.payload] }
    case 'UPDATE_FOLDER': return { ...state, folders: state.folders.map(f => f.id === action.payload.id ? action.payload : f) }
    case 'DELETE_FOLDER': return { ...state, folders: state.folders.filter(f => f.id !== action.payload) }
    case 'ADD_PROMPT': return { ...state, prompts: [...state.prompts, action.payload] }
    case 'UPDATE_PROMPT': return { ...state, prompts: state.prompts.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_PROMPT': return { ...state, prompts: state.prompts.filter(p => p.id !== action.payload) }
    default: return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, init)

  const addFolder = (data) => {
    const folder = saveFolder(data)
    dispatch({ type: 'ADD_FOLDER', payload: folder })
    return folder
  }
  const editFolder = (data) => {
    updateFolder(data)
    dispatch({ type: 'UPDATE_FOLDER', payload: data })
  }
  const removeFolder = (id) => {
    deleteFolder(id)
    dispatch({ type: 'DELETE_FOLDER', payload: id })
  }

  const addPrompt = (data) => {
    const prompt = savePrompt(data)
    dispatch({ type: 'ADD_PROMPT', payload: prompt })
    return prompt
  }
  const editPrompt = (data) => {
    updatePrompt(data)
    dispatch({ type: 'UPDATE_PROMPT', payload: { ...data, updatedAt: new Date().toISOString() } })
  }
  const removePrompt = (id) => {
    deletePrompt(id)
    dispatch({ type: 'DELETE_PROMPT', payload: id })
  }

  // Presets are not in global state — fetched per-prompt in the detail page
  const addPreset = savePreset
  const removePreset = deletePreset
  const fetchPresets = getPresets

  return (
    <AppContext.Provider value={{
      folders: state.folders,
      prompts: state.prompts,
      addFolder, editFolder, removeFolder,
      addPrompt, editPrompt, removePrompt,
      addPreset, removePreset, fetchPresets,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
```

**Step 2: Wrap App with provider — update `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

**Step 3: Run dev server — confirm no errors**

```bash
npm run dev
```

**Step 4: Commit**

```bash
git add src/store/AppContext.jsx src/main.jsx
git commit -m "feat: add AppContext with folders/prompts state"
```

---

## Task 5: App Shell — Layout + Routing

**Files:**
- Create: `src/components/Layout.jsx`
- Create: `src/components/Sidebar.jsx`
- Create: `src/pages/PromptListPage.jsx`
- Create: `src/pages/PromptDetailPage.jsx`
- Modify: `src/App.jsx`

**Step 1: Create `src/components/Layout.jsx`**

```jsx
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
```

**Step 2: Create stub `src/components/Sidebar.jsx`**

```jsx
export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col p-4 gap-2">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Prompt Keeper</span>
    </aside>
  )
}
```

**Step 3: Create stub pages**

`src/pages/PromptListPage.jsx`:
```jsx
export default function PromptListPage() {
  return <div className="p-8 text-gray-400">Select a folder or view all prompts.</div>
}
```

`src/pages/PromptDetailPage.jsx`:
```jsx
export default function PromptDetailPage() {
  return <div className="p-8 text-gray-400">Prompt detail coming soon.</div>
}
```

**Step 4: Set up routing — replace `src/App.jsx`**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import PromptListPage from './pages/PromptListPage'
import PromptDetailPage from './pages/PromptDetailPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/prompts" replace />} />
        <Route path="/prompts" element={<PromptListPage />} />
        <Route path="/prompts/:id" element={<PromptDetailPage />} />
        <Route path="/folder/:folderId" element={<PromptListPage />} />
      </Routes>
    </Layout>
  )
}
```

**Step 5: Run dev server — confirm layout appears**

```bash
npm run dev
```
Expected: dark sidebar on left, main content area on right.

**Step 6: Commit**

```bash
git add src/components/ src/pages/ src/App.jsx
git commit -m "feat: add app shell with layout and routing"
```

---

## Task 6: Sidebar — Full Implementation

**Files:**
- Modify: `src/components/Sidebar.jsx`
- Create: `src/components/modals/FolderModal.jsx`

The sidebar shows: app title, search input, "All Prompts" link, folder list, tag filter chips, and a "+ New Prompt" button at the bottom.

**Step 1: Create `src/components/modals/FolderModal.jsx`**

A small modal for creating/renaming a folder. Takes `onSave(name, color)` and `onClose` props.

```jsx
import { useState } from 'react'
import { X } from 'lucide-react'

const COLORS = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#ef4444','#14b8a6']

export default function FolderModal({ initial = null, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [color, setColor] = useState(initial?.color || COLORS[0])

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{initial ? 'Rename Folder' : 'New Folder'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={16}/></button>
        </div>
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-blue-500"
          placeholder="Folder name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2 mb-5">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full border-2 transition-all"
              style={{ background: c, borderColor: color === c ? 'white' : 'transparent' }}
            />
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
          <button
            onClick={() => { if (name.trim()) onSave(name.trim(), color) }}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-40"
            disabled={!name.trim()}
          >
            {initial ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Implement full `src/components/Sidebar.jsx`**

```jsx
import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { FolderOpen, Plus, Search, Tag, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../store/AppContext'
import FolderModal from './modals/FolderModal'

export default function Sidebar() {
  const { folders, prompts, addFolder, editFolder, removeFolder, addPrompt } = useApp()
  const [search, setSearch] = useState('')
  const [folderModal, setFolderModal] = useState(null) // null | 'new' | folderObj
  const [menuOpen, setMenuOpen] = useState(null) // folder id with context menu open
  const [activeTag, setActiveTag] = useState(null)
  const navigate = useNavigate()

  // Collect all tags across prompts
  const allTags = [...new Set(prompts.flatMap(p => p.tags || []))]

  const handleCreatePrompt = () => {
    const prompt = addPrompt({ title: 'Untitled Prompt', body: '', tags: [], folderId: null, sourceUrl: null })
    navigate(`/prompts/${prompt.id}`)
  }

  const navClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`

  return (
    <>
      <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <h1 className="font-bold text-white tracking-tight">Prompt Keeper</h1>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-gray-500" />
            <input
              className="bg-transparent text-sm outline-none w-full placeholder-gray-500"
              placeholder="Search prompts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-0.5">
          <NavLink to="/prompts" className={navClass} end>
            <FolderOpen size={15} />
            All Prompts
            <span className="ml-auto text-xs text-gray-600">{prompts.length}</span>
          </NavLink>

          {/* Folders */}
          {folders.length > 0 && (
            <div className="mt-3 mb-1 px-2 text-xs text-gray-600 font-medium uppercase tracking-widest">Folders</div>
          )}
          {folders.map(folder => (
            <div key={folder.id} className="relative group">
              <NavLink
                to={`/folder/${folder.id}`}
                className={navClass}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: folder.color }} />
                <span className="truncate">{folder.name}</span>
                <span className="ml-auto text-xs text-gray-600">
                  {prompts.filter(p => p.folderId === folder.id).length}
                </span>
              </NavLink>
              {/* Context menu trigger */}
              <button
                onClick={() => setMenuOpen(menuOpen === folder.id ? null : folder.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white p-0.5"
              >
                <MoreHorizontal size={14} />
              </button>
              {menuOpen === folder.id && (
                <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 py-1 w-36">
                  <button
                    onClick={() => { setFolderModal(folder); setMenuOpen(null) }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm w-full hover:bg-gray-700 text-gray-300"
                  >
                    <Pencil size={13}/> Rename
                  </button>
                  <button
                    onClick={() => { removeFolder(folder.id); setMenuOpen(null) }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm w-full hover:bg-gray-700 text-red-400"
                  >
                    <Trash2 size={13}/> Delete
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Tags */}
          {allTags.length > 0 && (
            <>
              <div className="mt-3 mb-1 px-2 text-xs text-gray-600 font-medium uppercase tracking-widest flex items-center gap-1">
                <Tag size={11}/> Tags
              </div>
              <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                {allTags.map(tag => (
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
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-gray-800 flex flex-col gap-2">
          <button
            onClick={() => setFolderModal('new')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={14}/> New Folder
          </button>
          <button
            onClick={handleCreatePrompt}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            <Plus size={15}/> New Prompt
          </button>
        </div>
      </aside>

      {/* Folder modal */}
      {folderModal && (
        <FolderModal
          initial={folderModal === 'new' ? null : folderModal}
          onClose={() => setFolderModal(null)}
          onSave={(name, color) => {
            if (folderModal === 'new') {
              addFolder({ name, color })
            } else {
              editFolder({ ...folderModal, name, color })
            }
            setFolderModal(null)
          }}
        />
      )}
    </>
  )
}
```

**Step 3: Run dev server — check sidebar renders**

```bash
npm run dev
```
Expected: sidebar with search, "All Prompts", "+ New Prompt" button, "+ New Folder" link.

**Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: implement full sidebar with folders and tags"
```

---

## Task 7: Prompt List Page

**Files:**
- Modify: `src/pages/PromptListPage.jsx`
- Create: `src/components/PromptCard.jsx`

**Step 1: Create `src/components/PromptCard.jsx`**

```jsx
import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { extractVariables } from '../utils/variables'

export default function PromptCard({ prompt, folderColor }) {
  const navigate = useNavigate()
  const vars = extractVariables(prompt.body)

  return (
    <div
      onClick={() => navigate(`/prompts/${prompt.id}`)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-gray-600 transition-all hover:shadow-lg group"
    >
      <div className="flex items-start gap-2 mb-2">
        {folderColor && (
          <span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: folderColor }} />
        )}
        <h3 className="font-medium text-white text-sm leading-snug truncate flex-1">{prompt.title || 'Untitled'}</h3>
        {prompt.sourceUrl && (
          <a
            href={prompt.sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-gray-600 hover:text-blue-400 shrink-0"
          >
            <ExternalLink size={13}/>
          </a>
        )}
      </div>

      {/* Body preview */}
      <p className="text-gray-500 text-xs line-clamp-2 mb-3 font-mono leading-relaxed">
        {prompt.body || 'No content yet…'}
      </p>

      {/* Variables */}
      {vars.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {vars.slice(0, 4).map(v => (
            <span key={v} className="text-xs bg-amber-950/50 text-amber-400 border border-amber-900/50 px-1.5 py-0.5 rounded font-mono">
              [{v}]
            </span>
          ))}
          {vars.length > 4 && <span className="text-xs text-gray-600">+{vars.length - 4} more</span>}
        </div>
      )}

      {/* Tags */}
      {prompt.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {prompt.tags.map(t => (
            <span key={t} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Implement `src/pages/PromptListPage.jsx`**

```jsx
import { useParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import PromptCard from '../components/PromptCard'
import { FolderOpen } from 'lucide-react'

export default function PromptListPage() {
  const { folderId } = useParams()
  const { prompts, folders } = useApp()

  const folder = folderId ? folders.find(f => f.id === folderId) : null
  const filtered = folderId
    ? prompts.filter(p => p.folderId === folderId)
    : prompts

  const title = folder ? folder.name : 'All Prompts'

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        {folder && <span className="w-3 h-3 rounded-full" style={{ background: folder.color }} />}
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <span className="text-sm text-gray-500">{filtered.length} prompt{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600">
          <FolderOpen size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No prompts yet. Hit "+ New Prompt" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const f = folders.find(f => f.id === p.folderId)
            return <PromptCard key={p.id} prompt={p} folderColor={f?.color} />
          })}
        </div>
      )}
    </div>
  )
}
```

**Step 3: Run dev — test creating a prompt via "+ New Prompt" and see card in list**

```bash
npm run dev
```

**Step 4: Commit**

```bash
git add src/pages/PromptListPage.jsx src/components/PromptCard.jsx
git commit -m "feat: add prompt list page with cards"
```

---

## Task 8: Prompt Detail Page — Core Editing

**Files:**
- Modify: `src/pages/PromptDetailPage.jsx`

**Step 1: Implement core editing (title, body, folder, sourceUrl, tags) in `src/pages/PromptDetailPage.jsx`**

```jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Trash2, Tag, X } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { extractVariables, resolvePrompt } from '../utils/variables'
import VariablesPanel from '../components/VariablesPanel'

export default function PromptDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { prompts, folders, editPrompt, removePrompt } = useApp()
  const prompt = prompts.find(p => p.id === id)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [folderId, setFolderId] = useState(null)
  const saveTimeout = useRef(null)

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title)
      setBody(prompt.body)
      setSourceUrl(prompt.sourceUrl || '')
      setTags(prompt.tags || [])
      setFolderId(prompt.folderId)
    }
  }, [id])

  // Auto-save with debounce
  const triggerSave = (updates) => {
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      editPrompt({ ...prompt, ...updates })
    }, 600)
  }

  if (!prompt) return <div className="p-8 text-gray-500">Prompt not found.</div>

  const handleDelete = () => {
    if (confirm('Delete this prompt?')) {
      removePrompt(id)
      navigate('/prompts')
    }
  }

  const addTag = (tag) => {
    const cleaned = tag.trim().toLowerCase()
    if (cleaned && !tags.includes(cleaned)) {
      const next = [...tags, cleaned]
      setTags(next)
      triggerSave({ ...getCurrentState(), tags: next })
    }
    setTagInput('')
  }

  const removeTag = (tag) => {
    const next = tags.filter(t => t !== tag)
    setTags(next)
    triggerSave({ ...getCurrentState(), tags: next })
  }

  const getCurrentState = () => ({ title, body, sourceUrl, tags, folderId })

  const vars = extractVariables(body)

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm">
          <ArrowLeft size={15}/> Back
        </button>
        <button onClick={handleDelete} className="text-gray-600 hover:text-red-400 transition-colors">
          <Trash2 size={16}/>
        </button>
      </div>

      {/* Title */}
      <input
        className="text-2xl font-bold bg-transparent outline-none w-full text-white mb-3 placeholder-gray-700"
        placeholder="Prompt title"
        value={title}
        onChange={e => { setTitle(e.target.value); triggerSave({ ...getCurrentState(), title: e.target.value }) }}
      />

      {/* Source URL + Folder row */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 flex-1 min-w-0">
          <ExternalLink size={13} className="text-gray-600 shrink-0"/>
          <input
            className="bg-transparent text-xs text-gray-400 outline-none w-full placeholder-gray-700"
            placeholder="Source URL (optional)"
            value={sourceUrl}
            onChange={e => { setSourceUrl(e.target.value); triggerSave({ ...getCurrentState(), sourceUrl: e.target.value }) }}
          />
        </div>
        <select
          className="bg-gray-900 border border-gray-800 text-xs text-gray-400 rounded-lg px-2 py-1.5 outline-none"
          value={folderId || ''}
          onChange={e => { const v = e.target.value || null; setFolderId(v); triggerSave({ ...getCurrentState(), folderId: v }) }}
        >
          <option value="">No folder</option>
          {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        <Tag size={13} className="text-gray-600"/>
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
            {t}
            <button onClick={() => removeTag(t)} className="text-gray-600 hover:text-white"><X size={10}/></button>
          </span>
        ))}
        <input
          className="text-xs bg-transparent outline-none text-gray-400 placeholder-gray-700 w-24"
          placeholder="+ add tag"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
          }}
          onBlur={() => { if (tagInput.trim()) addTag(tagInput) }}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 mb-5"/>

      {/* Prompt body */}
      <label className="text-xs text-gray-600 uppercase tracking-widest mb-2 block">Prompt</label>
      <textarea
        className="w-full min-h-[180px] bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm font-mono text-gray-200 outline-none focus:border-gray-600 resize-y leading-relaxed"
        placeholder="Write your prompt here… use [variable_name] for dynamic parts."
        value={body}
        onChange={e => { setBody(e.target.value); triggerSave({ ...getCurrentState(), body: e.target.value }) }}
      />

      {/* Variables panel (rendered only when vars exist) */}
      {vars.length > 0 && (
        <VariablesPanel
          key={id}
          promptId={id}
          variables={vars}
          body={body}
        />
      )}
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add src/pages/PromptDetailPage.jsx
git commit -m "feat: add prompt detail page with auto-save editing"
```

---

## Task 9: Variables Panel + Live Preview + Copy + Presets

**Files:**
- Create: `src/components/VariablesPanel.jsx`
- Create: `src/components/modals/PresetModal.jsx`

**Step 1: Create `src/components/modals/PresetModal.jsx`**

```jsx
import { useState } from 'react'
import { X } from 'lucide-react'

export default function PresetModal({ onSave, onClose }) {
  const [name, setName] = useState('')
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-72 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Save as Preset</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={16}/></button>
        </div>
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-blue-500"
          placeholder="Preset name (e.g. Work tone)"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()) }}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white">Cancel</button>
          <button
            onClick={() => { if (name.trim()) onSave(name.trim()) }}
            disabled={!name.trim()}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Create `src/components/VariablesPanel.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { Copy, Check, Bookmark, Trash2, ChevronDown } from 'lucide-react'
import { resolvePrompt } from '../utils/variables'
import { useApp } from '../store/AppContext'
import PresetModal from './modals/PresetModal'

export default function VariablesPanel({ promptId, variables, body }) {
  const { addPreset, removePreset, fetchPresets } = useApp()
  const [values, setValues] = useState({})
  const [descriptions, setDescriptions] = useState({})
  const [presets, setPresets] = useState([])
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setPresets(fetchPresets(promptId))
  }, [promptId])

  const resolved = resolvePrompt(body, values)

  const handleCopy = () => {
    navigator.clipboard.writeText(resolved)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const loadPreset = (preset) => {
    setValues(preset.values)
  }

  const handleSavePreset = (name) => {
    const preset = addPreset({ promptId, name, values })
    setPresets(prev => [...prev, preset])
    setShowPresetModal(false)
  }

  const handleDeletePreset = (presetId) => {
    removePreset(presetId)
    setPresets(prev => prev.filter(p => p.id !== presetId))
  }

  // Highlight unfilled vars in preview
  const renderPreview = () => {
    const parts = []
    let lastIndex = 0
    const regex = /\[([a-zA-Z0-9_\s]+)\]/g
    let match
    while ((match = regex.exec(body)) !== null) {
      if (match.index > lastIndex) parts.push({ text: body.slice(lastIndex, match.index), type: 'text' })
      const key = match[1].trim()
      const filled = values[key] && values[key] !== ''
      parts.push({ text: filled ? values[key] : match[0], type: filled ? 'filled' : 'unfilled' })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < body.length) parts.push({ text: body.slice(lastIndex), type: 'text' })
    return parts
  }

  return (
    <div className="mt-6">
      <div className="border-t border-gray-800 pt-5 mb-5"/>

      {/* Variables */}
      <label className="text-xs text-gray-600 uppercase tracking-widest mb-3 block">Variables</label>
      <div className="flex flex-col gap-3 mb-6">
        {variables.map(varName => (
          <div key={varName} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-amber-400 font-medium">[{varName}]</span>
            </div>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 mb-1.5"
              placeholder={`Value for ${varName}`}
              value={values[varName] || ''}
              onChange={e => setValues(prev => ({ ...prev, [varName]: e.target.value }))}
            />
            <input
              className="w-full bg-transparent text-xs text-gray-600 outline-none placeholder-gray-700"
              placeholder="Description (optional)"
              value={descriptions[varName] || ''}
              onChange={e => setDescriptions(prev => ({ ...prev, [varName]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      {/* Presets */}
      {(presets.length > 0 || Object.values(values).some(v => v)) && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs text-gray-600">Presets:</span>
          {presets.map(preset => (
            <div key={preset.id} className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-full pl-3 pr-1 py-0.5">
              <button
                onClick={() => loadPreset(preset)}
                className="text-xs text-gray-300 hover:text-white"
              >
                {preset.name}
              </button>
              <button
                onClick={() => handleDeletePreset(preset.id)}
                className="text-gray-600 hover:text-red-400 p-0.5"
              >
                <Trash2 size={11}/>
              </button>
            </div>
          ))}
          {Object.values(values).some(v => v) && (
            <button
              onClick={() => setShowPresetModal(true)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-white border border-dashed border-gray-700 hover:border-gray-500 rounded-full px-2.5 py-0.5 transition-colors"
            >
              <Bookmark size={11}/> Save preset
            </button>
          )}
        </div>
      )}

      {/* Live preview */}
      <label className="text-xs text-gray-600 uppercase tracking-widest mb-2 block">Preview</label>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm font-mono leading-relaxed mb-4 whitespace-pre-wrap break-words">
        {renderPreview().map((part, i) => (
          part.type === 'unfilled'
            ? <span key={i} className="bg-amber-950/60 text-amber-400 rounded px-0.5">{part.text}</span>
            : part.type === 'filled'
            ? <span key={i} className="text-emerald-400">{part.text}</span>
            : <span key={i} className="text-gray-300">{part.text}</span>
        ))}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          copied
            ? 'bg-emerald-600 text-white'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        {copied ? <><Check size={15}/> Copied!</> : <><Copy size={15}/> Copy Prompt</>}
      </button>

      {showPresetModal && (
        <PresetModal onSave={handleSavePreset} onClose={() => setShowPresetModal(false)} />
      )}
    </div>
  )
}
```

**Step 3: For prompts without variables, add a simple Copy button at bottom of PromptDetailPage**

Add after the textarea in `PromptDetailPage.jsx`, inside a `{vars.length === 0 && ...}` conditional:

```jsx
{vars.length === 0 && body && (
  <CopyButton text={body} />
)}
```

Create `src/components/CopyButton.jsx`:

```jsx
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      className={`mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
        copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
      }`}
    >
      {copied ? <><Check size={15}/> Copied!</> : <><Copy size={15}/> Copy Prompt</>}
    </button>
  )
}
```

**Step 4: Import CopyButton in PromptDetailPage and add the conditional after textarea**

**Step 5: Run dev — test full flow: create prompt with [vars], fill vars, see live preview, copy, save preset, load preset**

```bash
npm run dev
```

**Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: add variables panel with live preview, copy, and presets"
```

---

## Task 10: Search Functionality

**Files:**
- Create: `src/store/SearchContext.jsx`
- Modify: `src/components/Sidebar.jsx` (wire up search)
- Modify: `src/pages/PromptListPage.jsx` (filter by search term)

**Step 1: Create `src/store/SearchContext.jsx`**

```jsx
import { createContext, useContext, useState } from 'react'
const SearchContext = createContext(null)
export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState('')
  return <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>
}
export const useSearch = () => useContext(SearchContext)
```

**Step 2: Wrap app with SearchProvider in `src/main.jsx`**

Add `<SearchProvider>` wrapping `<App />`.

**Step 3: Wire search input in Sidebar to `setQuery`**

Replace `setSearch` with `setQuery` from `useSearch()`.

**Step 4: Filter prompts in PromptListPage**

```js
const { query } = useSearch()
const searched = filtered.filter(p =>
  !query ||
  p.title.toLowerCase().includes(query.toLowerCase()) ||
  p.body.toLowerCase().includes(query.toLowerCase()) ||
  p.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
)
```

Use `searched` in the grid render.

**Step 5: Run dev — test search**

**Step 6: Commit**

```bash
git add src/store/SearchContext.jsx src/components/Sidebar.jsx src/pages/PromptListPage.jsx
git commit -m "feat: add global search across prompts"
```

---

## Task 11: Final Polish

**Files:**
- Modify: `index.html` (app title, favicon)
- Modify: `src/index.css` (custom scrollbar, font)

**Step 1: Update `index.html` title**

```html
<title>Prompt Keeper</title>
```

**Step 2: Add custom scrollbar styles to `src/index.css`**

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #4b5563; }
* { scrollbar-width: thin; scrollbar-color: #374151 transparent; }
```

**Step 3: Add Inter font via `index.html`**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

And in `index.css`:

```css
body { font-family: 'Inter', system-ui, sans-serif; }
```

**Step 4: Verify all tests still pass**

```bash
npm run test
```

**Step 5: Run dev — final visual check**

```bash
npm run dev
```

**Step 6: Final commit**

```bash
git add .
git commit -m "feat: final polish — fonts, scrollbar, title"
```

---

## Definition of Done

- [ ] Prompts can be created, edited (title, body, source URL, folder, tags), and deleted
- [ ] Folders can be created, renamed, deleted with color picker
- [ ] Variables `[name]` auto-detected; value inputs appear in Variables Panel
- [ ] Live preview shows filled vars in green, unfilled in amber
- [ ] Copy button copies resolved prompt; values persist until navigation
- [ ] Presets can be saved with a name, loaded, and deleted
- [ ] Search bar filters across title, body, and tags
- [ ] Tag filter chips in sidebar work
- [ ] All localStorage CRUD tests pass
- [ ] All variable utility tests pass
