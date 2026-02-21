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
