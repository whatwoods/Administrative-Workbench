import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { noteService, Note } from '../../services/noteService'
import NoteForm from '../../components/NoteForm'
import './styles.css'

export default function NotePage() {
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [showVersions, setShowVersions] = useState<string | null>(null)

    useEffect(() => {
        fetchNotes()
    }, [])

    const fetchNotes = async () => {
        setLoading(true)
        try {
            const response = await noteService.getAll()
            setNotes((response.data as any).data)
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch notes')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return

        try {
            await noteService.delete(id)
            setNotes(notes.filter(n => n._id !== id))
            toast.success('Note deleted')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete note')
        }
    }

    return (
        <div className="note-page">
            <header className="note-header">
                <h1>Smart Notes</h1>
                <button
                    className="add-note-btn"
                    onClick={() => {
                        setEditingNote(null)
                        setShowForm(!showForm)
                    }}
                >
                    <Plus size={20} /> New Note
                </button>
            </header>

            {showForm && (
                <NoteForm
                    onSubmit={async (data) => {
                        try {
                            if (editingNote) {
                                const response = await noteService.update(editingNote._id, data)
                                setNotes(notes.map(n => n._id === editingNote._id ? (response.data as any).data : n))
                                toast.success('Note updated')
                            } else {
                                const response = await noteService.create(data as any)
                                setNotes([...notes, (response.data as any).data])
                                toast.success('Note created')
                            }
                            setShowForm(false)
                            setEditingNote(null)
                        } catch (error: any) {
                            toast.error(error.response?.data?.message || 'Failed to save note')
                        }
                    }}
                    initialData={editingNote}
                />
            )}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : notes.length === 0 ? (
                <div className="empty-state">
                    <p>No notes yet. Create one to get started!</p>
                </div>
            ) : (
                <div className="notes-grid">
                    {notes.map(note => (
                        <div key={note._id} className="note-card">
                            <div className="note-header-card">
                                <h3 className="note-title">{note.title}</h3>
                                <div className="note-actions">
                                    <button
                                        className="action-btn"
                                        title="View history"
                                        onClick={() =>
                                            setShowVersions(showVersions === note._id ? null : note._id)
                                        }
                                    >
                                        <History size={16} />
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={() => {
                                            setEditingNote(note)
                                            setShowForm(true)
                                        }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDelete(note._id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {showVersions === note._id && (
                                <div className="note-versions">
                                    <p className="versions-label">Version History ({note.versions.length})</p>
                                    <ul className="versions-list">
                                        {note.versions.slice().reverse().map((v, idx) => (
                                            <li key={idx}>
                                                <span className="version-date">
                                                    {new Date(v.timestamp).toLocaleString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <p className="note-content">{note.content.substring(0, 150)}...</p>

                            <div className="note-meta">
                                <span className={`badge type-${note.type}`}>{note.type}</span>
                                {note.tags.map(tag => (
                                    <span key={tag} className="badge tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <p className="note-date">
                                Updated: {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
