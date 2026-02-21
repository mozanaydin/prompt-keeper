import { createContext, useContext, useReducer } from 'react'
import {
  getFolders, saveFolder, updateFolder, deleteFolder,
  getPrompts, savePrompt, updatePrompt, deletePrompt,
  getPresets, savePreset, deletePreset,
} from './storage'

const AppContext = createContext(null)

function init() {
  return {
    folders: getFolders(),
    prompts: getPrompts(),
  }
}

function reducer(state, action) {
  switch (action.type) {
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
  const [state, dispatch] = useReducer(reducer, null, init)

  const addFolder = (data) => {
    const folder = saveFolder(data)
    dispatch({ type: 'ADD_FOLDER', payload: folder })
    return folder
  }
  const editFolder = (data) => {
    updateFolder(data)
    dispatch({ type: 'UPDATE_FOLDER', payload: data })
  }
  const removeFolder = (id) => {
    deleteFolder(id)
    dispatch({ type: 'DELETE_FOLDER', payload: id })
  }
  const addPrompt = (data) => {
    const prompt = savePrompt(data)
    dispatch({ type: 'ADD_PROMPT', payload: prompt })
    return prompt
  }
  const editPrompt = (data) => {
    updatePrompt(data)
    dispatch({ type: 'UPDATE_PROMPT', payload: { ...data, updatedAt: new Date().toISOString() } })
  }
  const removePrompt = (id) => {
    deletePrompt(id)
    dispatch({ type: 'DELETE_PROMPT', payload: id })
  }

  const addPreset = savePreset
  const removePreset = deletePreset
  const fetchPresets = getPresets

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
