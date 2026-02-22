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
    globalThis.fetch = mockFetch([{ id: '1', name: 'Work' }])
    const result = await getFolders()
    expect(fetch).toHaveBeenCalledWith('/api/folders')
    expect(result).toEqual([{ id: '1', name: 'Work' }])
  })

  it('saveFolder calls POST /api/folders with body', async () => {
    const folder = { id: '1', name: 'Test', color: '#3b82f6' }
    globalThis.fetch = mockFetch(folder)
    const result = await saveFolder({ name: 'Test', color: '#3b82f6' })
    expect(fetch).toHaveBeenCalledWith('/api/folders', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
    expect(result).toEqual(folder)
  })

  it('updateFolder calls PUT /api/folders/:id', async () => {
    const folder = { id: '1', name: 'Updated', color: '#fff' }
    globalThis.fetch = mockFetch(folder)
    const result = await updateFolder(folder)
    expect(fetch).toHaveBeenCalledWith('/api/folders/1', expect.objectContaining({
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    }))
    expect(result).toEqual(folder)
  })

  it('deleteFolder calls DELETE /api/folders/:id', async () => {
    globalThis.fetch = mockFetch({ ok: true })
    await deleteFolder('1')
    expect(fetch).toHaveBeenCalledWith('/api/folders/1', { method: 'DELETE' })
  })
})

describe('prompts', () => {
  it('getPrompts calls GET /api/prompts', async () => {
    globalThis.fetch = mockFetch([])
    const result = await getPrompts()
    expect(fetch).toHaveBeenCalledWith('/api/prompts')
    expect(result).toEqual([])
  })

  it('savePrompt calls POST /api/prompts with body', async () => {
    const prompt = { id: '1', title: 'Test', body: 'Hello [name]' }
    globalThis.fetch = mockFetch(prompt)
    const result = await savePrompt({ title: 'Test', body: 'Hello [name]', tags: [], folderId: null, sourceUrl: null })
    expect(fetch).toHaveBeenCalledWith('/api/prompts', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
    expect(result).toEqual(prompt)
  })

  it('updatePrompt calls PUT /api/prompts/:id', async () => {
    const prompt = { id: '1', title: 'Updated' }
    globalThis.fetch = mockFetch(prompt)
    const result = await updatePrompt(prompt)
    expect(fetch).toHaveBeenCalledWith('/api/prompts/1', expect.objectContaining({
      method: 'PUT',
    }))
    expect(result).toEqual(prompt)
  })

  it('deletePrompt calls DELETE /api/prompts/:id', async () => {
    globalThis.fetch = mockFetch({ ok: true })
    await deletePrompt('1')
    expect(fetch).toHaveBeenCalledWith('/api/prompts/1', { method: 'DELETE' })
  })
})

describe('presets', () => {
  it('getPresets calls GET /api/presets with promptId query', async () => {
    globalThis.fetch = mockFetch([{ id: 'pr1', promptId: 'p1', name: 'Work' }])
    const result = await getPresets('p1')
    expect(fetch).toHaveBeenCalledWith('/api/presets?promptId=p1')
    expect(result).toEqual([{ id: 'pr1', promptId: 'p1', name: 'Work' }])
  })

  it('savePreset calls POST /api/presets with body', async () => {
    const preset = { id: 'pr1', promptId: 'p1', name: 'Work', values: { tone: 'formal' } }
    globalThis.fetch = mockFetch(preset)
    const result = await savePreset({ promptId: 'p1', name: 'Work', values: { tone: 'formal' } })
    expect(fetch).toHaveBeenCalledWith('/api/presets', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
    expect(result).toEqual(preset)
  })

  it('deletePreset calls DELETE /api/presets/:id', async () => {
    globalThis.fetch = mockFetch({ ok: true })
    await deletePreset('pr1')
    expect(fetch).toHaveBeenCalledWith('/api/presets/pr1', { method: 'DELETE' })
  })
})
