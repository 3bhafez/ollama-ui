import { useState, useEffect, useCallback } from 'react';
import {
  addNote,
  getResponseNotes,
  editNote,
  deleteNote,
  validateNoteRange
} from '../services/notesService';

/**
 * Custom hook for managing notes functionality
 * @param {string} responseId - The response ID to manage notes for
 * @returns {Object} - Notes state and operations
 */
export const useNotes = (responseId) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notes for the response
  const fetchNotes = useCallback(async () => {
    if (!responseId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedNotes = await getResponseNotes(responseId);
      setNotes(fetchedNotes.filter(note => !note.isDeleted));
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  }, [responseId]);

  // Load notes when responseId changes
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Add a new note with optimistic updates
  const handleAddNote = useCallback(async (content, fromIndex, toIndex) => {
    if (!responseId) {
      throw new Error('Response ID is required');
    }

    // Validate the range
    if (!validateNoteRange(notes, fromIndex, toIndex)) {
      throw new Error('Invalid range: overlaps with existing note or invalid indices');
    }

    // Optimistic update
    const tempNote = {
      id: `temp-${Date.now()}`,
      response_Id: responseId,
      content,
      fromIndex,
      toIndex,
      createdAt: new Date().toISOString(),
      isDeleted: false,
      isOptimistic: true
    };

    setNotes(prev => [...prev, tempNote]);

    try {
      const newNote = await addNote(responseId, content, fromIndex, toIndex);
      
      // Replace optimistic note with real note
      setNotes(prev => 
        prev.map(note => 
          note.id === tempNote.id ? { ...newNote, isOptimistic: false } : note
        )
      );
      
      return newNote;
    } catch (err) {
      // Remove optimistic note on error
      setNotes(prev => prev.filter(note => note.id !== tempNote.id));
      throw err;
    }
  }, [responseId, notes]);

  // Edit an existing note with optimistic updates
  const handleEditNote = useCallback(async (noteId, content, fromIndex, toIndex) => {
    if (!responseId) {
      throw new Error('Response ID is required');
    }

    // Validate the range (excluding the current note)
    if (!validateNoteRange(notes, fromIndex, toIndex, noteId)) {
      throw new Error('Invalid range: overlaps with existing note or invalid indices');
    }

    // Store original note for rollback
    const originalNote = notes.find(note => note.id === noteId);
    if (!originalNote) {
      throw new Error('Note not found');
    }

    // Optimistic update
    const updatedNote = {
      ...originalNote,
      content,
      fromIndex,
      toIndex,
      isOptimistic: true
    };

    setNotes(prev => 
      prev.map(note => 
        note.id === noteId ? updatedNote : note
      )
    );

    try {
      const editedNote = await editNote(responseId, noteId, content, fromIndex, toIndex);
      
      // Replace optimistic note with real note
      setNotes(prev => 
        prev.map(note => 
          note.id === noteId ? { ...editedNote, isOptimistic: false } : note
        )
      );
      
      return editedNote;
    } catch (err) {
      // Rollback on error
      setNotes(prev => 
        prev.map(note => 
          note.id === noteId ? originalNote : note
        )
      );
      throw err;
    }
  }, [responseId, notes]);

  // Delete a note with optimistic updates
  const handleDeleteNote = useCallback(async (noteId) => {
    if (!responseId) {
      throw new Error('Response ID is required');
    }

    // Store original note for rollback
    const originalNote = notes.find(note => note.id === noteId);
    if (!originalNote) {
      throw new Error('Note not found');
    }

    // Optimistic update - remove note
    setNotes(prev => prev.filter(note => note.id !== noteId));

    try {
      await deleteNote(responseId, noteId);
    } catch (err) {
      // Rollback on error
      setNotes(prev => [...prev, originalNote]);
      throw err;
    }
  }, [responseId, notes]);

  // Check if a range is valid for a new note
  const isValidRange = useCallback((fromIndex, toIndex, excludeNoteId = null) => {
    return validateNoteRange(notes, fromIndex, toIndex, excludeNoteId);
  }, [notes]);

  // Get notes that intersect with a given range
  const getNotesInRange = useCallback((fromIndex, toIndex) => {
    return notes.filter(note => {
      return (
        (fromIndex >= note.fromIndex && fromIndex < note.toIndex) ||
        (toIndex > note.fromIndex && toIndex <= note.toIndex) ||
        (fromIndex <= note.fromIndex && toIndex >= note.toIndex)
      );
    });
  }, [notes]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    addNote: handleAddNote,
    editNote: handleEditNote,
    deleteNote: handleDeleteNote,
    isValidRange,
    getNotesInRange
  };
};