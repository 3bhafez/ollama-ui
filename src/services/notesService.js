import axios from 'axios';
import { getToken } from './authService';

const NOTES_API_URL = 'http://ollamanetgateway.runasp.net/notes';

// headers with auth token
const getHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Add a new note to a response
 * @param {string} responseId - The response ID
 * @param {string} content - The note content
 * @param {number} fromIndex - Start index of the selected text
 * @param {number} toIndex - End index of the selected text
 * @returns {Promise<Object>} - The created note data
 */
export const addNote = async (responseId, content, fromIndex, toIndex) => {
  try {
    const response = await axios({
      method: 'post',
      url: NOTES_API_URL,
      data: {
        responseId,
        content,
        fromIndex,
        toIndex
      },
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to add note');
  }
};

/**
 * Get all notes for a specific response
 * @param {string} responseId - The response ID
 * @returns {Promise<Array>} - Array of notes
 */
export const getResponseNotes = async (responseId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${NOTES_API_URL}/response/${responseId}`,
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch notes');
  }
};

/**
 * Get a specific note
 * @param {string} responseId - The response ID
 * @param {string} noteId - The note ID
 * @returns {Promise<Object>} - The note data
 */
export const getNote = async (responseId, noteId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${NOTES_API_URL}/${responseId}/${noteId}`,
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch note');
  }
};

/**
 * Edit an existing note
 * @param {string} responseId - The response ID
 * @param {string} noteId - The note ID
 * @param {string} content - The updated note content
 * @param {number} fromIndex - Updated start index
 * @param {number} toIndex - Updated end index
 * @returns {Promise<Object>} - The updated note data
 */
export const editNote = async (responseId, noteId, content, fromIndex, toIndex) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${NOTES_API_URL}/${responseId}/${noteId}`,
      data: {
        content,
        fromIndex,
        toIndex
      },
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to edit note');
  }
};

/**
 * Soft delete a note
 * @param {string} responseId - The response ID
 * @param {string} noteId - The note ID
 * @returns {Promise<void>}
 */
export const deleteNote = async (responseId, noteId) => {
  try {
    await axios({
      method: 'delete',
      url: `${NOTES_API_URL}/soft-delete/${responseId}/${noteId}`,
      headers: getHeaders()
    });
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete note');
  }
};

/**
 * Validate if a new note range overlaps with existing notes
 * @param {Array} existingNotes - Array of existing notes
 * @param {number} fromIndex - Start index of new note
 * @param {number} toIndex - End index of new note
 * @param {string} excludeNoteId - Note ID to exclude from validation (for editing)
 * @returns {boolean} - True if valid (no overlap), false if invalid
 */
export const validateNoteRange = (existingNotes, fromIndex, toIndex, excludeNoteId = null) => {
  // Check if the range is valid
  if (fromIndex >= toIndex || fromIndex < 0) {
    return false;
  }

  // Check for overlaps with existing notes
  for (const note of existingNotes) {
    if (excludeNoteId && note.id === excludeNoteId) {
      continue; // Skip the note being edited
    }
    
    if (note.isDeleted) {
      continue; // Skip deleted notes
    }

    // Check if ranges overlap
    if (
      (fromIndex >= note.fromIndex && fromIndex < note.toIndex) ||
      (toIndex > note.fromIndex && toIndex <= note.toIndex) ||
      (fromIndex <= note.fromIndex && toIndex >= note.toIndex)
    ) {
      return false; // Overlap detected
    }
  }

  return true; // No overlap, valid range
};