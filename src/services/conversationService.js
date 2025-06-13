import axios from 'axios';
import { getToken } from './authService';

const CONVERSATION_API_URL = 'http://ollamanetgateway.runasp.net/Conversations';
const CHAT_API_URL = 'http://ollamanetgateway.runasp.net/Chats';
const FOLDER_API_URL = 'http://ollamanetgateway.runasp.net/Folder';

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
 * Create a new conversation with the selected model
 * @param {string} modelName - The name of the model to use
 * @param {string} title - The conversation title
 * @param {string} systemMessage - system message
 * @param {string} folderId - The folder ID where the conversation will be created
 * @returns {Promise<Object>} - The conversation data
 */
const createConversation = async (modelName, title, systemMessage = "", folderId) => {
  try {
    const response = await axios({
      method: 'post',
      url: CONVERSATION_API_URL,
      data: {
        modelName,
        title,
        systemMessage,
        folderId
      },
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to create conversation');
  }
};

/**
 * Send a message to the AI in a conversation
 * @param {string} conversationId - The ID of the conversation
 * @param {string} model - The model name
 * @param {string} content - The message content
 * @param {string} systemMessage - system message
 * @param {Object} options - parameters (temperature)
 * @returns {Promise<Object>} - The AI response
 */
const sendChatMessage = async (conversationId, model, content, systemMessage = "", options = { temperature: "1" }) => {
  try {
    const response = await axios({
      method: 'post',
      url: CHAT_API_URL,
      data: {
        conversationId,
        model,
        systemMessage,
        content,
        options
      },
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to send message');
  }
};

/**
 * Get user folders with conversations
 * @returns {Promise<Object>} - The folders and conversations data
 */
const getUserFolders = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: FOLDER_API_URL,
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user folders');
  }
};

/**
 * Get messages for a specific conversation
 * @param {string} conversationId - The ID of the conversation
 * @returns {Promise<Array>} - The conversation messages
 */
const getConversationMessages = async (conversationId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${CONVERSATION_API_URL}/${conversationId}/messages`,
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch conversation messages');
  }
};

/**
 * Create a new folder
 * @param {string} name - The folder name
 * @param {string} rootFolderId - The parent folder ID
 * @returns {Promise<Object>} - The created folder data
 */
const createFolder = async (name, rootFolderId) => {
  try {
    const response = await axios({
      method: 'post',
      url: FOLDER_API_URL,
      data: {
        name,
        rootFolderId
      },
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to create folder');
  }
};

/**
 * Edit a folder name
 * @param {string} folderId - The folder ID
 * @param {string} newName - The new folder name
 * @returns {Promise<Object>} - The response data
 */
const editFolder = async (folderId, newName) => {
  try {
    const response = await axios({
      method: 'put',
      url: FOLDER_API_URL,
      data: {
        folderId,
        newName
      },
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to edit folder');
  }
};

/**
 * Delete a folder
 * @param {string} folderId - The folder ID
 * @returns {Promise<Object>} - The response data
 */
const deleteFolder = async (folderId) => {
  try {
    const response = await axios({
      method: 'delete',
      url: `${FOLDER_API_URL}/${folderId}/soft`,
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete folder');
  }
};

/**
 * Delete a conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object>} - The response data
 */
const deleteConversation = async (conversationId) => {
  try {
    const response = await axios({
      method: 'delete',
      url: `${CONVERSATION_API_URL}/${conversationId}`,
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete conversation');
  }
};

export {
  createConversation,
  sendChatMessage,
  getUserFolders,
  getConversationMessages,
  createFolder,
  editFolder,
  deleteFolder,
  deleteConversation
};
