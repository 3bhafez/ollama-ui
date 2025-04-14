import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://ollamanet.runasp.net/api/Conversation';

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
 * Open a new conversation with the selected model
 * @param {string} modelName - The name of the model to use
 * @param {string} systemMessage - system message
 * @returns {Promise<Object>} - The conversation data
 */
const openConversation = async (modelName, systemMessage = "") => {
  try {
    const response = await axios({
      method: 'post',
      url: `${API_URL}/OpenConversation`,
      data: {
        modelName,
        systemMessage
      },
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to open conversation');
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
      url: `${API_URL}/Chat`,
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
 * Get all conversations for the current user
 * @returns {Promise<Object>} - The conversations data
 */
const getConversations = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${API_URL}/GetConversations`,
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch conversations');
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
      url: `${API_URL}/ConversationMessages/${conversationId}`,
      headers: getHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch conversation messages');
  }
};

export {
  openConversation,
  sendChatMessage,
  getConversations,
  getConversationMessages
};
