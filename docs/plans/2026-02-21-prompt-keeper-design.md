# Prompt Keeper — Design Document
_Date: 2026-02-21_

## Overview

A local-first prompt management app for macOS/web. Replaces Apple Notes for storing, organizing, and reusing AI prompts. Built as a React PWA so it can be deployed as a web app, wrapped for macOS (Tauri), or ported to iOS (React Native) later.

---

## Goals

- Save and organize prompts with folders and tags
- Detect `[variable_name]` placeholders automatically; fill them in inline
- Live preview of the resolved prompt as variables are filled
- Copy fully resolved prompt to clipboard
- Save named presets of variable fill-ins per prompt
- Store source URL per prompt
- All data stored locally (localStorage), architecture ready for backend sync

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | TailwindCSS |
| Storage | localStorage (JSON) |
| Routing | React Router v6 |
| Icons | Lucide React |

---

## Data Model

### Folder
```json
{
  "id": "uuid",
  "name": "string",
  "color": "hex string",
  "createdAt": "ISO date"
}
```

### Prompt
```json
{
  "id": "uuid",
  "folderId": "uuid | null",
  "title": "string",
  "body": "string (contains [variable] placeholders)",
  "tags": ["string"],
  "sourceUrl": "string | null",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### Preset
```json
{
  "id": "uuid",
  "promptId": "uuid",
  "name": "string",
  "values": { "variableName": "value" }
}
```

**Variable detection:** regex `/\[([a-zA-Z0-9_\s]+)\]/g` on prompt body. Unique variable names extracted automatically. No manual declaration needed.

---

## UI Design

### Layout
Two-column layout on desktop:
- **Left sidebar (240px):** Search bar, "All Prompts", folder list with colored dots, tag filter chips, "+ New Prompt" button
- **Main area:** Prompt list (card grid) or Prompt Detail depending on route

### Prompt List (card grid)
Each card shows: title, folder color indicator, tag chips, preview of first line of body. Click to open detail.

### Prompt Detail Page
- Inline-editable title
- Source URL field with external link icon
- Editable prompt body (monospace textarea)
- **Variables Panel** — auto-detected variables, each row:
  - Variable name (read-only, detected from body)
  - Optional description field (editable)
  - Value input (live-updates preview)
- **Live Preview** — read-only resolved prompt, unfilled vars highlighted in amber
- **Copy button** — copies resolved prompt; values persist until navigation away
- **Presets** — "Save as preset" opens modal to name current values; saved presets shown as chips to load

### Modals
- Create/rename folder
- Create prompt
- Save preset (with name input)

---

## Behavior Notes

- Variable values reset when navigating away from a prompt (not on copy)
- Presets are per-prompt; loading a preset fills all variable inputs
- Tags are free-form strings managed globally; shown as filter chips in sidebar
- Source URL shown as a small link icon next to the title, opens in new tab

---

## Future Extensibility

- Swap localStorage for IndexedDB (larger data)
- Add a backend (Supabase/Postgres) for cloud sync with minimal code changes
- Wrap with Tauri for native macOS distribution
- Port business logic to React Native for iOS App Store
