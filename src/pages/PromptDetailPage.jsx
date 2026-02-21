import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Trash2, Tag, X, Copy, Check, Save } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { extractVariables } from '../utils/variables'
import VariablesPanel from '../components/VariablesPanel'

export default function PromptDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { prompts, folders, editPrompt, removePrompt } = useApp()
  const prompt = prompts.find(p => p.id === id)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [folderId, setFolderId] = useState(null)
  const [copied, setCopied] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title)
      setBody(prompt.body)
      setSourceUrl(prompt.sourceUrl || '')
      setTags(prompt.tags || [])
      setFolderId(prompt.folderId)
      setHasChanges(false)
    }
  }, [id]) // eslint-disable-line

  if (!prompt) return <div className="p-8 text-gray-500">Prompt not found.</div>

  const markChanged = () => setHasChanges(true)

  const handleSave = async () => {
    setSaving(true)
    await editPrompt({ ...prompt, title, body, sourceUrl, tags, folderId })
    setHasChanges(false)
    setSaving(false)
  }

  const handleDelete = async () => {
    if (confirm('Delete this prompt?')) {
      await removePrompt(id)
      navigate('/prompts')
    }
  }

  const addTag = (tag) => {
    const cleaned = tag.trim().toLowerCase()
    if (cleaned && !tags.includes(cleaned)) {
      setTags(prev => [...prev, cleaned])
      markChanged()
    }
    setTagInput('')
  }

  const removeTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag))
    markChanged()
  }

  const vars = extractVariables(body)

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm">
          <ArrowLeft size={15}/> Back
        </button>
        <div className="flex items-center gap-2">
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            <Save size={14}/>
            {saving ? 'Saving…' : hasChanges ? 'Save' : 'Saved'}
          </button>
          <button onClick={handleDelete} className="text-gray-600 hover:text-red-400 transition-colors p-1.5">
            <Trash2 size={16}/>
          </button>
        </div>
      </div>

      {/* Unsaved indicator */}
      {hasChanges && (
        <div className="text-xs text-amber-500 mb-3">You have unsaved changes</div>
      )}

      {/* Title */}
      <input
        className="text-2xl font-bold bg-transparent outline-none w-full text-white mb-3 placeholder-gray-700"
        placeholder="Prompt title"
        value={title}
        onChange={e => { setTitle(e.target.value); markChanged() }}
      />

      {/* Source URL + Folder row */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 flex-1 min-w-0">
          <ExternalLink size={13} className="text-gray-600 shrink-0"/>
          <input
            className="bg-transparent text-xs text-gray-400 outline-none w-full placeholder-gray-700"
            placeholder="Source URL (optional)"
            value={sourceUrl}
            onChange={e => { setSourceUrl(e.target.value); markChanged() }}
          />
        </div>
        <select
          className="bg-gray-900 border border-gray-800 text-xs text-gray-400 rounded-lg px-2 py-1.5 outline-none"
          value={folderId || ''}
          onChange={e => { setFolderId(e.target.value || null); markChanged() }}
        >
          <option value="">No folder</option>
          {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        <Tag size={13} className="text-gray-600"/>
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
            {t}
            <button onClick={() => removeTag(t)} className="text-gray-600 hover:text-white"><X size={10}/></button>
          </span>
        ))}
        <input
          className="text-xs bg-transparent outline-none text-gray-400 placeholder-gray-700 w-24"
          placeholder="+ add tag"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
          }}
          onBlur={() => { if (tagInput.trim()) addTag(tagInput) }}
        />
      </div>

      <div className="border-t border-gray-800 mb-5"/>

      {/* Prompt body */}
      <label className="text-xs text-gray-600 uppercase tracking-widest mb-2 block">Prompt</label>
      <textarea
        className="w-full min-h-[180px] bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm font-mono text-gray-200 outline-none focus:border-gray-600 resize-y leading-relaxed"
        placeholder="Write your prompt here… use [variable_name] for dynamic parts."
        value={body}
        onChange={e => { setBody(e.target.value); markChanged() }}
      />

      {/* Variables panel or simple copy */}
      {vars.length > 0 ? (
        <VariablesPanel key={id} promptId={id} variables={vars} body={body} />
      ) : body ? (
        <button
          onClick={handleCopyRaw}
          className={`mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {copied ? <><Check size={15}/> Copied!</> : <><Copy size={15}/> Copy Prompt</>}
        </button>
      ) : null}
    </div>
  )
}
