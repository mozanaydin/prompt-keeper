import { useParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import PromptCard from '../components/PromptCard'
import { FolderOpen } from 'lucide-react'

export default function PromptListPage() {
  const { folderId } = useParams()
  const { prompts, folders } = useApp()

  const folder = folderId ? folders.find(f => f.id === folderId) : null
  const filtered = folderId
    ? prompts.filter(p => p.folderId === folderId)
    : prompts

  const title = folder ? folder.name : 'All Prompts'

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        {folder && <span className="w-3 h-3 rounded-full" style={{ background: folder.color }} />}
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <span className="text-sm text-gray-500">{filtered.length} prompt{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600">
          <FolderOpen size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No prompts yet. Hit "+ New Prompt" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const f = folders.find(f => f.id === p.folderId)
            return <PromptCard key={p.id} prompt={p} folderColor={f?.color} />
          })}
        </div>
      )}
    </div>
  )
}
