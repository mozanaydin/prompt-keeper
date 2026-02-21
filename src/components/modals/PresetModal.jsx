import { useState } from 'react'
import { X } from 'lucide-react'

export default function PresetModal({ onSave, onClose }) {
  const [name, setName] = useState('')
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-72 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Save as Preset</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={16}/></button>
        </div>
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-blue-500"
          placeholder="Preset name (e.g. Work tone)"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()) }}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white">Cancel</button>
          <button
            onClick={() => { if (name.trim()) onSave(name.trim()) }}
            disabled={!name.trim()}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
