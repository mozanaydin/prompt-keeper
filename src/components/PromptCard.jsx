import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { extractVariables } from '../utils/variables'

export default function PromptCard({ prompt, folderColor }) {
  const navigate = useNavigate()
  const vars = extractVariables(prompt.body)

  return (
    <div
      onClick={() => navigate(`/prompts/${prompt.id}`)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-gray-600 transition-all hover:shadow-lg group"
    >
      <div className="flex items-start gap-2 mb-2">
        {folderColor && (
          <span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: folderColor }} />
        )}
        <h3 className="font-medium text-white text-sm leading-snug truncate flex-1">{prompt.title || 'Untitled'}</h3>
        {prompt.sourceUrl && (
          <a
            href={prompt.sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-gray-600 hover:text-blue-400 shrink-0"
          >
            <ExternalLink size={13}/>
          </a>
        )}
      </div>
      <p className="text-gray-500 text-xs line-clamp-2 mb-3 font-mono leading-relaxed">
        {prompt.body || 'No content yet…'}
      </p>
      {vars.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {vars.slice(0, 4).map(v => (
            <span key={v} className="text-xs bg-amber-950/50 text-amber-400 border border-amber-900/50 px-1.5 py-0.5 rounded font-mono">
              [{v}]
            </span>
          ))}
          {vars.length > 4 && <span className="text-xs text-gray-600">+{vars.length - 4} more</span>}
        </div>
      )}
      {prompt.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {prompt.tags.map(t => (
            <span key={t} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}
