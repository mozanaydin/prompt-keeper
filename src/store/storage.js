const API = '/api'

// --- Folders ---
export const getFolders = async () => {
  const res = await fetch(`${API}/folders`)
  return res.json()
}

export const saveFolder = async (data) => {
  const res = await fetch(`${API}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export const updateFolder = async (data) => {
  const res = await fetch(`${API}/folders/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export const deleteFolder = async (id) => {
  await fetch(`${API}/folders/${id}`, { method: 'DELETE' })
}

// --- Prompts ---
export const getPrompts = async () => {
  const res = await fetch(`${API}/prompts`)
  return res.json()
}

export const savePrompt = async (data) => {
  const res = await fetch(`${API}/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export const updatePrompt = async (data) => {
  const res = await fetch(`${API}/prompts/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export const deletePrompt = async (id) => {
  await fetch(`${API}/prompts/${id}`, { method: 'DELETE' })
}

// --- Presets ---
export const getPresets = async (promptId) => {
  const res = await fetch(`${API}/presets?promptId=${promptId}`)
  return res.json()
}

export const savePreset = async (data) => {
  const res = await fetch(`${API}/presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export const deletePreset = async (id) => {
  await fetch(`${API}/presets/${id}`, { method: 'DELETE' })
}
