import { useMemo } from 'react';

/**
 * Component that renders text with highlighted notes
 * @param {string} text - The original text content
 * @param {Array} notes - Array of notes with fromIndex, toIndex, and id
 * @param {Function} onNoteClick - Callback when a highlighted note is clicked
 * @param {string} className - Additional CSS classes
 */
const HighlightedText = ({ text, notes = [], onNoteClick, className = '' }) => {
  // Process text and create segments with highlights
  const textSegments = useMemo(() => {
    if (!text || notes.length === 0) {
      return [{ text, type: 'normal' }];
    }

    // Sort notes by fromIndex to process them in order
    const sortedNotes = [...notes]
      .filter(note => !note.isDeleted)
      .sort((a, b) => a.fromIndex - b.fromIndex);

    const segments = [];
    let currentIndex = 0;

    sortedNotes.forEach((note) => {
      const { fromIndex, toIndex, id } = note;

      // Add text before the note (if any)
      if (currentIndex < fromIndex) {
        segments.push({
          text: text.slice(currentIndex, fromIndex),
          type: 'normal'
        });
      }

      // Add the highlighted note text
      if (fromIndex < toIndex && toIndex <= text.length) {
        segments.push({
          text: text.slice(fromIndex, toIndex),
          type: 'highlight',
          noteId: id,
          note
        });
        currentIndex = toIndex;
      }
    });

    // Add remaining text after the last note
    if (currentIndex < text.length) {
      segments.push({
        text: text.slice(currentIndex),
        type: 'normal'
      });
    }

    return segments;
  }, [text, notes]);

  const handleNoteClick = (note, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (onNoteClick) {
      onNoteClick(note);
    }
  };

  return (
    <span className={className}>
      {textSegments.map((segment, index) => {
        if (segment.type === 'highlight') {
          return (
            <span
              key={`${segment.noteId}-${index}`}
              className="bg-yellow-200 hover:bg-yellow-300 cursor-pointer transition-colors duration-200 rounded-sm px-0.5 relative group"
              onClick={(e) => handleNoteClick(segment.note, e)}
              title={`Note: ${segment.note.content}`}
            >
              {segment.text}
              {/* Tooltip indicator */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
            </span>
          );
        }
        
        return (
          <span key={`normal-${index}`}>
            {segment.text}
          </span>
        );
      })}
    </span>
  );
};

export default HighlightedText;