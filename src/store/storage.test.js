import { describe, it, expect } from 'vitest'
import {
  getFolders, saveFolder, updateFolder, deleteFolder,
  getPrompts, savePrompt, updatePrompt, deletePrompt,
  getPresets, savePreset, deletePreset,
} from './storage'

describe('storage API module', () => {
  it('exports all CRUD functions', () => {
    expect(typeof getFolders).toBe('function')
    expect(typeof saveFolder).toBe('function')
    expect(typeof updateFolder).toBe('function')
    expect(typeof deleteFolder).toBe('function')
    expect(typeof getPrompts).toBe('function')
    expect(typeof savePrompt).toBe('function')
    expect(typeof updatePrompt).toBe('function')
    expect(typeof deletePrompt).toBe('function')
    expect(typeof getPresets).toBe('function')
    expect(typeof savePreset).toBe('function')
    expect(typeof deletePreset).toBe('function')
  })
})
