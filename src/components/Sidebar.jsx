import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FolderOpen, Plus, Search, Tag, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../store/AppContext'
import FolderModal from './modals/FolderModal'

export default function Sidebar() {
  const { folders, prompts, addFolder, editFolder, removeFolder, addPrompt } = useApp()
  const [search, setSearch] = useState('')
  const [folderModal, setFolderModal] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const navigate = useNavigate()

  const allTags = [...new Set(prompts.flatMap(p => p.tags || []))]

  const handleCreatePrompt = () => {
    const prompt = addPrompt({ title: 'Untitled Prompt', body: '', tags: [], folderId: null, sourceUrl: null })
    navigate(`/prompts/${prompt.id}`)
  }

  const navClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`

  return (
    <>
      <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
        <div className="p-4 border-b border-gray-800">
          <h1 className="font-bold text-white tracking-tight">Prompt Keeper</h1>
        </div>

        <div className="px-3 py-2">
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-gray-500" />
            <input
              className="bg-transparent text-sm outline-none w-full placeholder-gray-500"
              placeholder="Search prompts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-0.5">
          <NavLink to="/prompts" className={navClass} end>
            <FolderOpen size={15} />
            All Prompts
            <span className="ml-auto text-xs text-gray-600">{prompts.length}</span>
          </NavLink>

          {folders.length > 0 && (
            <div className="mt-3 mb-1 px-2 text-xs text-gray-600 font-medium uppercase tracking-widest">Folders</div>
          )}
          {folders.map(folder => (
            <div key={folder.id} className="relative group">
              <NavLink to={`/folder/${folder.id}`} className={navClass}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: folder.color }} />
                <span className="truncate">{folder.name}</span>
                <span className="ml-auto text-xs text-gray-600">
                  {prompts.filter(p => p.folderId === folder.id).length}
                </span>
              </NavLink>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === folder.id ? null : folder.id) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white p-0.5"
              >
                <MoreHorizontal size={14} />
              </button>
              {menuOpen === folder.id && (
                <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 py-1 w-36">
                  <button
                    onClick={() => { setFolderModal(folder); setMenuOpen(null) }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm w-full hover:bg-gray-700 text-gray-300"
                  >
                    <Pencil size={13}/> Rename
                  </button>
                  <button
                    onClick={() => { removeFolder(folder.id); setMenuOpen(null) }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm w-full hover:bg-gray-700 text-red-400"
                  >
                    <Trash2 size={13}/> Delete
                  </button>
                </div>
              )}
            </div>
          ))}

          {allTags.length > 0 && (
            <>
              <div className="mt-3 mb-1 px-2 text-xs text-gray-600 font-medium uppercase tracking-widest flex items-center gap-1">
                <Tag size={11}/> Tags
              </div>
              <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                {allTags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full border border-gray-700 text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </nav>

        <div className="p-3 border-t border-gray-800 flex flex-col gap-2">
          <button
            onClick={() => setFolderModal('new')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={14}/> New Folder
          </button>
          <button
            onClick={handleCreatePrompt}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            <Plus size={15}/> New Prompt
          </button>
        </div>
      </aside>

      {folderModal && (
        <FolderModal
          initial={folderModal === 'new' ? null : folderModal}
          onClose={() => setFolderModal(null)}
          onSave={(name, color) => {
            if (folderModal === 'new') {
              addFolder({ name, color })
            } else {
              editFolder({ ...folderModal, name, color })
            }
            setFolderModal(null)
          }}
        />
      )}
    </>
  )
}
