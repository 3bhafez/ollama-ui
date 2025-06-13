import { useState, useEffect } from 'react';
import { FiX, FiEdit3, FiSave, FiTrash2, FiLoader, FiEye, FiCheck } from 'react-icons/fi';

const ViewEditNoteModal = ({ 
  isOpen, 
  onClose, 
  note, 
  onSave, 
  onDelete,
  selectedText,
  loading = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (note) {
      setNoteContent(note.content || '');
    }
  }, [note]);

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
      setDeleteConfirm(false);
      setError('');
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!noteContent.trim()) {
      setError('Note content cannot be empty');
      return;
    }

    try {
      setError('');
      await onSave(note.id, noteContent.trim(), note.fromIndex, note.toIndex);
      setIsEditing(false);
      setDeleteConfirm(false); // Cancel delete confirmation when saving
    } catch (err) {
      setError(err.message || 'Failed to save note');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      setError('');
      await onDelete(note.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete note');
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setDeleteConfirm(false);
    setError('');
    setNoteContent(note?.content || '');
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (isEditing) {
        setIsEditing(false);
        setNoteContent(note?.content || '');
        setError('');
      } else {
        handleClose();
      }
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && isEditing) {
      handleSave();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <FiEdit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Edit Note</h3>
              </>
            ) : (
              <>
                <FiEye className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">View Note</h3>
              </>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Selected Text Preview */}
          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-indigo-500">
            <p className="text-sm text-gray-600 mb-1">Selected text:</p>
            <p className="text-sm font-medium text-gray-900 italic">
              "{selectedText}"
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Characters {note.fromIndex} - {note.toIndex}
            </p>
          </div>

          {/* Note Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Note Content
              </label>
              <p className="text-xs text-gray-500">
                Created: {formatDate(note.createdAt)}
              </p>
            </div>
            
            {isEditing ? (
              <>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter your note here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                  rows={4}
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Press Ctrl+Enter to save quickly
                </p>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3 min-h-[100px]">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {noteContent}
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Delete Confirmation */}
          {deleteConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium mb-2">
                Are you sure you want to delete this note?
              </p>
              <p className="text-xs text-red-600">
                This action cannot be undone.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {/* Delete Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                deleteConfirm
                  ? 'text-white bg-red-600 hover:bg-red-700'
                  : 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200'
              }`}
            >
              {loading ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : deleteConfirm ? (
                <FiCheck className="w-4 h-4" />
              ) : (
                <FiTrash2 className="w-4 h-4" />
              )}
              {deleteConfirm ? 'Confirm Delete' : 'Delete'}
            </button>
            
            {deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(false)}
                className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={loading}
                title="Cancel Delete"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNoteContent(note.content);
                    setError('');
                    setDeleteConfirm(false); // Cancel delete confirmation when canceling edit
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !noteContent.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setDeleteConfirm(false); // Cancel delete confirmation when entering edit mode
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  <FiEdit3 className="w-4 h-4" />
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEditNoteModal;