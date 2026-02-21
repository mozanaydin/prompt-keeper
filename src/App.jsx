import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import PromptListPage from './pages/PromptListPage'
import PromptDetailPage from './pages/PromptDetailPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/prompts" replace />} />
        <Route path="/prompts" element={<PromptListPage />} />
        <Route path="/prompts/:id" element={<PromptDetailPage />} />
        <Route path="/folder/:folderId" element={<PromptListPage />} />
      </Routes>
    </Layout>
  )
}
