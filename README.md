# Prompt Keeper

A local-first prompt management app for organizing, reusing, and customizing AI prompts. Built with React and a lightweight Express backend.

## Features

- **Prompt Management** — Create, edit, and delete prompts with title, body, tags, source URL, and folder assignment
- **Folders** — Organize prompts into color-coded folders
- **Variable Detection** — Automatically detects `[variable_name]` placeholders in prompt text
- **Live Preview** — Fill in variables and see the resolved prompt in real-time (unfilled vars highlighted in amber, filled in green)
- **Copy to Clipboard** — One-click copy of the fully resolved prompt
- **Presets** — Save named sets of variable values per prompt, load them instantly
- **Search** — Filter prompts by title, body, or tags
- **Tag Filtering** — Click tag chips in the sidebar to filter by tag

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Express (JSON file storage) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Testing | Vitest |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/mozanaydin/prompt-keeper.git
cd prompt-keeper
npm install
```

### Run (dev)

```bash
npm run dev
```

This starts both the Express API server (port 3001) and the Vite dev server (port 5173) concurrently.

### Build

```bash
npm run build
```

### Test

```bash
npm run test
```

## Project Structure

```
src/
  components/
    Layout.jsx          # Two-column layout shell
    Sidebar.jsx         # Navigation, folders, tags, search
    PromptCard.jsx      # Card component for prompt grid
    VariablesPanel.jsx  # Variable inputs, live preview, presets, copy
    modals/
      FolderModal.jsx   # Create/rename folder modal
      PresetModal.jsx   # Save preset modal
  pages/
    PromptListPage.jsx  # Prompt grid view (all or by folder)
    PromptDetailPage.jsx # Single prompt editor
  store/
    AppContext.jsx       # Global state (folders, prompts)
    SearchContext.jsx    # Search query and tag filter state
    storage.js           # API client (fetch wrappers)
  utils/
    variables.js         # Variable extraction and prompt resolution
server.js               # Express API with JSON file persistence
data/                    # Local JSON data files (gitignored)
```

## License

MIT
