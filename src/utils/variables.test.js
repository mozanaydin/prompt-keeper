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
