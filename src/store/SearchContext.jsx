import { createContext, useContext, useState } from 'react'

const SearchContext = createContext(null)

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  return <SearchContext.Provider value={{ query, setQuery, activeTag, setActiveTag }}>{children}</SearchContext.Provider>
}

export const useSearch = () => useContext(SearchContext)
