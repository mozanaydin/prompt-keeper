import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')

app.use(cors())
app.use(express.json())

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

// Helper: read/write JSON files
function readJSON(filename) {
  const filepath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filepath)) return []
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'))
}

function writeJSON(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2))
}

function newId() {
  return randomUUID()
}

// --- Folders ---
app.get('/api/folders', (req, res) => {
  res.json(readJSON('folders.json'))
})

app.post('/api/folders', (req, res) => {
  const folders = readJSON('folders.json')
  const folder = { ...req.body, id: newId(), createdAt: new Date().toISOString() }
  folders.push(folder)
  writeJSON('folders.json', folders)
  res.json(folder)
})

app.put('/api/folders/:id', (req, res) => {
  let folders = readJSON('folders.json')
  folders = folders.map(f => f.id === req.params.id ? { ...f, ...req.body } : f)
  writeJSON('folders.json', folders)
  res.json(folders.find(f => f.id === req.params.id))
})

app.delete('/api/folders/:id', (req, res) => {
  let folders = readJSON('folders.json')
  folders = folders.filter(f => f.id !== req.params.id)
  writeJSON('folders.json', folders)
  res.json({ ok: true })
})

// --- Prompts ---
app.get('/api/prompts', (req, res) => {
  res.json(readJSON('prompts.json'))
})

app.post('/api/prompts', (req, res) => {
  const prompts = readJSON('prompts.json')
  const now = new Date().toISOString()
  const prompt = { ...req.body, id: newId(), createdAt: now, updatedAt: now }
  prompts.push(prompt)
  writeJSON('prompts.json', prompts)
  res.json(prompt)
})

app.put('/api/prompts/:id', (req, res) => {
  let prompts = readJSON('prompts.json')
  prompts = prompts.map(p => p.id === req.params.id ? { ...p, ...req.body, updatedAt: new Date().toISOString() } : p)
  writeJSON('prompts.json', prompts)
  res.json(prompts.find(p => p.id === req.params.id))
})

app.delete('/api/prompts/:id', (req, res) => {
  let prompts = readJSON('prompts.json')
  prompts = prompts.filter(p => p.id !== req.params.id)
  writeJSON('prompts.json', prompts)
  // Also clean up presets
  let presets = readJSON('presets.json')
  presets = presets.filter(p => p.promptId !== req.params.id)
  writeJSON('presets.json', presets)
  res.json({ ok: true })
})

// --- Presets ---
app.get('/api/presets', (req, res) => {
  const promptId = req.query.promptId
  const presets = readJSON('presets.json')
  res.json(promptId ? presets.filter(p => p.promptId === promptId) : presets)
})

app.post('/api/presets', (req, res) => {
  const presets = readJSON('presets.json')
  const preset = { ...req.body, id: newId(), createdAt: new Date().toISOString() }
  presets.push(preset)
  writeJSON('presets.json', presets)
  res.json(preset)
})

app.delete('/api/presets/:id', (req, res) => {
  let presets = readJSON('presets.json')
  presets = presets.filter(p => p.id !== req.params.id)
  writeJSON('presets.json', presets)
  res.json({ ok: true })
})

// --- Data directory info ---
app.get('/api/info', (req, res) => {
  res.json({ dataDir: DATA_DIR })
})

app.listen(PORT, () => {
  console.log(`Prompt Keeper API running on http://localhost:${PORT}`)
  console.log(`Data directory: ${DATA_DIR}`)
})
