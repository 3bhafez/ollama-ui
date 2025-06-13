import { useState } from 'react';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

const AddNoteModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedText, 
  fromIndex, 
  toIndex,
  loading = false 
}) => {
  const [noteContent, setNoteContent] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!noteContent.trim()) {
      setError('Note content cannot be empty');
      return;
    }

    try {
      setError('');
      await onSave(noteContent.trim(), fromIndex, toIndex);
      setNoteContent('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save note');
    }
  };

  const handleClose = () => {
    setNoteContent('');
    setError('');
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add Note</h3>
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
              Characters {fromIndex} - {toIndex}
            </p>
          </div>

          {/* Note Input */}
          <div>
            <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-2">
              Note Content
            </label>
            <textarea
              id="note-content"
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
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                Save Note
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNoteModal;