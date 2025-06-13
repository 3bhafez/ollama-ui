import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { FiInfo } from 'react-icons/fi';
import { useNotes } from '../../hooks/useNotes';
import { useTextSelection } from '../../hooks/useTextSelection';
import HighlightedText from '../notes/HighlightedText';
import SelectionPopup from '../notes/SelectionPopup';
import AddNoteModal from '../notes/AddNoteModal';
import ViewEditNoteModal from '../notes/ViewEditNoteModal';

const ChatMessage = ({ message }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showViewNoteModal, setShowViewNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(null);
  
  const messageContentRef = useRef(null);
  const isUserMessage = message.role === 'User';
  
  // Only use notes functionality for AI responses
  const {
    notes,
    addNote,
    editNote,
    deleteNote,
    isValidRange
  } = useNotes(!isUserMessage ? message.id : null);
  
  const {
    selection,
    clearSelection,
    getSelectionPosition,
    getTextContent
  } = useTextSelection(messageContentRef);
  // Handle adding a new note
  const handleAddNote = async (content, fromIndex, toIndex) => {
    if (!isValidRange(fromIndex, toIndex)) {
      throw new Error('Invalid range: overlaps with existing note or invalid indices');
    }
    
    setNotesLoading(true);
    try {
      await addNote(content, fromIndex, toIndex);
      clearSelection();
    } finally {
      setNotesLoading(false);
    }
  };
  
  // Handle editing a note
  const handleEditNote = async (noteId, content, fromIndex, toIndex) => {
    setNotesLoading(true);
    try {
      await editNote(noteId, content, fromIndex, toIndex);
    } finally {
      setNotesLoading(false);
    }
  };
  
  // Handle deleting a note
  const handleDeleteNote = async (noteId) => {
    setNotesLoading(true);
    try {
      await deleteNote(noteId);
    } finally {
      setNotesLoading(false);
    }
  };
  
  // Handle note click
  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setShowViewNoteModal(true);
  };
  
  // Handle selection popup add note click
  const handleSelectionAddNote = () => {
    if (selection) {
      // Selection data processed
      setCurrentSelection(selection);
      // Use setTimeout to ensure the click event completes before hiding the popup
      setTimeout(() => {
        setShowAddNoteModal(true);
      }, 0);
    }
  };
  
  // Get selected text for modals
  const getSelectedTextForNote = (note) => {
    const textContent = getTextContent();
    return textContent.slice(note.fromIndex, note.toIndex);
  };
  
  // Custom markdown components for AI responses with notes
  const markdownComponents = {
    p: ({ children, ...props }) => {
      if (isUserMessage) {
        return <p {...props}>{children}</p>;
      }
      
      // For AI responses, render with highlighted text
      const textContent = typeof children === 'string' ? children : 
        (Array.isArray(children) ? children.join('') : String(children));
      
      return (
        <p {...props}>
          <HighlightedText
            text={textContent}
            notes={notes}
            onNoteClick={handleNoteClick}
          />
        </p>
      );
    },
    // Handle other text elements similarly
    span: ({ children, ...props }) => {
      if (isUserMessage) {
        return <span {...props}>{children}</span>;
      }
      
      const textContent = typeof children === 'string' ? children : 
        (Array.isArray(children) ? children.join('') : String(children));
      
      return (
        <span {...props}>
          <HighlightedText
            text={textContent}
            notes={notes}
            onNoteClick={handleNoteClick}
          />
        </span>
      );
    }
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDuration = (nanoseconds) => {
    if (!nanoseconds) return '0ms';
    
    // Convert nanoseconds to milliseconds
    const ms = nanoseconds / 1000000;
    
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  };
  
  return (
    <div className="py-4 mb-2">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
          {/* Message content */}
          <div className={`max-w-full ${isUserMessage ? 'order-1' : 'order-0'}`}>
            {/* Message body */}
            <div 
              className={`px-4 py-3 ${isUserMessage 
                ? 'bg-gray-200 text-gray-900 rounded-2xl rounded-br-md' 
                : 'bg-white text-gray-900 rounded-2xl rounded-bl-md w-full'}`}
            >
              <div 
              className="prose prose-sm max-w-none relative"
              ref={messageContentRef}
            >
              {isUserMessage ? (
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  remarkPlugins={[remarkGfm]}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <>
                  <div ref={messageContentRef}>
                    <HighlightedText
                      text={message.content}
                      notes={notes}
                      onNoteClick={handleNoteClick}
                    />
                  </div>
                  
                  {/* Selection Popup */}
                  <SelectionPopup
                    isVisible={!!selection && !showAddNoteModal && !showViewNoteModal}
                    position={getSelectionPosition()}
                    onAddNote={handleSelectionAddNote}
                    disabled={notesLoading}
                  />
                </>
              )}
            </div>
            </div>
            
            {/* Message metadata */}
            <div className={`flex items-center mt-1 text-xs text-gray-500 ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
              <span>{formatTime(message.createdAt)}</span>
              
              {!isUserMessage && message.metadata && (
                <button 
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowInfo(!showInfo)}
                  aria-label="Show response information"
                >
                  <FiInfo className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {/* Response info */}
            {!isUserMessage && showInfo && message.metadata && (
              <div className="mt-2 p-2 bg-gray-100 rounded-md text-xs text-gray-600 space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>Total Duration: {formatDuration(message.metadata.totalDuration)}</div>
                  <div>Load Duration: {formatDuration(message.metadata.loadDuration)}</div>
                  <div>Prompt Eval Count: {message.metadata.promptEvalCount}</div>
                  <div>Prompt Eval Duration: {formatDuration(message.metadata.promptEvalDuration)}</div>
                  <div>Eval Count: {message.metadata.evalCount}</div>
                  <div>Eval Duration: {formatDuration(message.metadata.evalDuration)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notes Modals - Only for AI responses */}
      {!isUserMessage && (
        <>
          <AddNoteModal
            isOpen={showAddNoteModal}
            onClose={() => {
              setShowAddNoteModal(false);
              clearSelection();
              setCurrentSelection(null);
            }}
            onSave={handleAddNote}
            selectedText={currentSelection?.selectedText || ''}
            fromIndex={currentSelection?.fromIndex || 0}
            toIndex={currentSelection?.toIndex || 0}
            loading={notesLoading}
          />
          
          <ViewEditNoteModal
            isOpen={showViewNoteModal}
            onClose={() => {
              setShowViewNoteModal(false);
              setSelectedNote(null);
            }}
            note={selectedNote}
            onSave={handleEditNote}
            onDelete={handleDeleteNote}
            selectedText={selectedNote ? getSelectedTextForNote(selectedNote) : ''}
            loading={notesLoading}
          />
        </>
      )}
    </div>
  );
};

export default ChatMessage;
