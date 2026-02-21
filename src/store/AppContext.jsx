import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import {
  getFolders, saveFolder, updateFolder, deleteFolder,
  getPrompts, savePrompt, updatePrompt, deletePrompt,
  getPresets, savePreset, deletePreset,
} from './storage'

const AppContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DATA': return { ...state, folders: action.payload.folders, prompts: action.payload.prompts }
    case 'ADD_FOLDER': return { ...state, folders: [...state.folders, action.payload] }
    case 'UPDATE_FOLDER': return { ...state, folders: state.folders.map(f => f.id === action.payload.id ? action.payload : f) }
    case 'DELETE_FOLDER': return { ...state, folders: state.folders.filter(f => f.id !== action.payload) }
    case 'ADD_PROMPT': return { ...state, prompts: [...state.prompts, action.payload] }
    case 'UPDATE_PROMPT': return { ...state, prompts: state.prompts.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_PROMPT': return { ...state, prompts: state.prompts.filter(p => p.id !== action.payload) }
    default: return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { folders: [], prompts: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getFolders(), getPrompts()]).then(([folders, prompts]) => {
      dispatch({ type: 'SET_DATA', payload: { folders, prompts } })
      setLoading(false)
    })
  }, [])

  const addFolder = async (data) => {
    const folder = await saveFolder(data)
    dispatch({ type: 'ADD_FOLDER', payload: folder })
    return folder
  }
  const editFolder = async (data) => {
    const updated = await updateFolder(data)
    dispatch({ type: 'UPDATE_FOLDER', payload: updated })
  }
  const removeFolder = async (id) => {
    await deleteFolder(id)
    dispatch({ type: 'DELETE_FOLDER', payload: id })
  }
  const addPrompt = async (data) => {
    const prompt = await savePrompt(data)
    dispatch({ type: 'ADD_PROMPT', payload: prompt })
    return prompt
  }
  const editPrompt = async (data) => {
    const updated = await updatePrompt(data)
    dispatch({ type: 'UPDATE_PROMPT', payload: updated })
  }
  const removePrompt = async (id) => {
    await deletePrompt(id)
    dispatch({ type: 'DELETE_PROMPT', payload: id })
  }

  const addPreset = savePreset
  const removePreset = deletePreset
  const fetchPresets = getPresets

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-500">
        Loading…
      </div>
    )
  }

  return (
    <AppContext.Provider value={{
      folders: state.folders,
      prompts: state.prompts,
      addFolder, editFolder, removeFolder,
      addPrompt, editPrompt, removePrompt,
      addPreset, removePreset, fetchPresets,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
