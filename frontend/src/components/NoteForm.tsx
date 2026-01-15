import { useState } from 'react'
import { Note } from '../services/noteService'
import './NoteForm.css'

interface NoteFormProps {
  onSubmit: (data: Partial<Note>) => Promise<void>
  initialData?: Note | null
}

export default function NoteForm({ onSubmit, initialData }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [type, setType] = useState<'text' | 'draw'>(initialData?.type || 'text')
  const [tags, setTags] = useState(initialData?.tags.join(', ') || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('Title and content are required')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        title,
        content,
        type,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'text' | 'draw')}
            disabled={loading}
          >
            <option value="text">Text</option>
            <option value="draw">Drawing</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="content">Content *</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter note content"
          disabled={loading}
          rows={6}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., important, urgent"
          disabled={loading}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </form>
  )
}
