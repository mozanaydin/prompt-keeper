import { useState, useEffect } from 'react'
import { Copy, Check, Bookmark, Trash2 } from 'lucide-react'
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
  }, [promptId]) // eslint-disable-line

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
              <button onClick={() => loadPreset(preset)} className="text-xs text-gray-300 hover:text-white">{preset.name}</button>
              <button onClick={() => handleDeletePreset(preset.id)} className="text-gray-600 hover:text-red-400 p-0.5"><Trash2 size={11}/></button>
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
          copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
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
