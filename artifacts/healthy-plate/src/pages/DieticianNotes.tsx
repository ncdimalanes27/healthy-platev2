import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { User, HealthProfile, DailyLog, DieticianNote } from '../types/index';
import { Send, Trash2, Edit2, X, AlertTriangle, TrendingUp, MessageSquare, Star, Check } from 'lucide-react';

const categories: { value: DieticianNote['category']; label: string; color: string; bg: string; icon: any }[] = [
  { value: 'recommendation', label: 'Recommendation', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Star },
  { value: 'warning', label: 'Warning', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: AlertTriangle },
  { value: 'progress', label: 'Progress', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: TrendingUp },
  { value: 'general', label: 'General', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', icon: MessageSquare },
];

export default function DieticianNotes() {
  const { currentUser, getAllPatients, getNotesForPatient, addNote, deleteNote, updateNote } = useStore();
  const [patients, setPatients] = useState<{ user: User; profile: HealthProfile | null; lastLog: DailyLog | null }[]>([]);
  const [notes, setNotes] = useState<DieticianNote[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const allPatients = await getAllPatients();
      setPatients(allPatients);
      if (allPatients.length > 0 && !selectedPatient) {
        setSelectedPatient(allPatients[0].user.id);
      }
    };
    loadData();
  }, [getAllPatients]);

  const [selectedPatient, setSelectedPatient] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<DieticianNote['category']>('recommendation');
  const [sent, setSent] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<DieticianNote['category']>('general');

  useEffect(() => {
    const loadNotes = async () => {
      if (selectedPatient) {
        const patientNotes = await getNotesForPatient(selectedPatient);
        setNotes(patientNotes);
      }
    };
    loadNotes();
  }, [selectedPatient, getNotesForPatient]);
  const patient = patients.find((p) => p.user.id === selectedPatient);

  const handleSend = async () => {
    if (!content.trim() || !currentUser) return;
    const success = await addNote({
      dieticianId: currentUser.id,
      dieticianName: currentUser.name,
      patientId: selectedPatient,
      content: content.trim(),
      category,
    });
    if (success) {
      setContent('');
      setSent(true);
      // Reload notes
      const patientNotes = await getNotesForPatient(selectedPatient);
      setNotes(patientNotes);
      setTimeout(() => setSent(false), 2000);
    }
  };

  const handleEdit = (note: DieticianNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditCategory(note.category);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !editingId) return;
    const success = await updateNote(editingId, { content: editContent.trim(), category: editCategory });
    if (success) {
      setEditingId(null);
      setEditContent('');
      // Reload notes
      const patientNotes = await getNotesForPatient(selectedPatient);
      setNotes(patientNotes);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = async (noteId: string) => {
    const success = await deleteNote(noteId);
    if (success) {
      // Reload notes
      const patientNotes = await getNotesForPatient(selectedPatient);
      setNotes(patientNotes);
    }
  };

  const getCategoryStyle = (cat: DieticianNote['category']) =>
    categories.find((c) => c.value === cat) || categories[3];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Notes & Recommendations
        </h1>
        <p className="text-gray-400 text-sm mt-1">Send clinical notes and dietary recommendations to your patients.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient selector */}
        <div className="md:col-span-1 space-y-2">
          <p className="text-sm font-semibold text-gray-600 mb-3">Select Patient</p>
          {patients.map(({ user, profile }) => (
            <button
              key={user.id}
              onClick={() => setSelectedPatient(user.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selectedPatient === user.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-100 bg-white hover:border-green-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {profile?.healthConditions.length ? profile.healthConditions[0] : 'No conditions'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Notes panel */}
        <div className="md:col-span-2 space-y-4">
          {/* Compose */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              New note for <span className="text-green-600">{patient?.user.name}</span>
            </p>

            {/* Category selector */}
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map(({ value, label, color, bg, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    category === value ? `${bg} ${color} border-current` : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your recommendation or note here..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
            />

            <button
              onClick={handleSend}
              disabled={!content.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                sent
                  ? 'bg-green-100 text-green-700'
                  : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-40'
              }`}
            >
              <Send className="w-4 h-4" />
              {sent ? 'Note Sent!' : 'Send Note'}
            </button>
          </div>

          {/* Existing notes */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-3">
              Previous Notes ({notes.length})
            </p>
            {notes.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                <p className="text-3xl mb-2">📝</p>
                <p className="text-gray-400 text-sm">No notes yet for this patient.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => {
                  const style = getCategoryStyle(note.category);
                  const Icon = style.icon;
                  const isEditing = editingId === note.id;
                  
                  return (
                    <div key={note.id} className={`border rounded-2xl p-4 ${style.bg}`}>
                      {isEditing ? (
                        /* Edit Mode */
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {categories.map(({ value, label, color, bg, icon: CatIcon }) => (
                              <button
                                key={value}
                                onClick={() => setEditCategory(value)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                                  editCategory === value ? `${bg} ${color} border-current` : 'bg-white border-gray-200 text-gray-500'
                                }`}
                              >
                                <CatIcon className="w-3 h-3" />
                                {label}
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={!editContent.trim()}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-40"
                            >
                              <Check className="w-3 h-3" />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-3.5 h-3.5 ${style.color}`} />
                              <span className={`text-xs font-semibold uppercase tracking-wide ${style.color}`}>
                                {style.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                {new Date(note.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <button
                                onClick={() => handleEdit(note)}
                                className="text-gray-300 hover:text-blue-500 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(note.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                          <p className="text-xs text-gray-400 mt-2">— {note.dieticianName}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
