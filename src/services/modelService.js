import axios from 'axios'
import { getToken } from './authService'

const API_URL = 'http://ollamanetgateway.runasp.net'

const getModels = async (pageNumber = 1, pageSize = 11) => {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios({
      method: 'get',
      url: `${API_URL}/Explore/models`,
      params: {
        page: pageNumber,
        pageSize: pageSize
      },
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch models');
  }
}

const getModelInfo = async (modelName) => {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios({
      method: 'get',
      url: `${API_URL}/Explore/models/${modelName}`,
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch model info');
  }
}

export { getModels, getModelInfo };