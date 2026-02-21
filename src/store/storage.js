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
