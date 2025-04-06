import axios from 'axios'
import { getToken } from './authService'

const API_URL = 'http://ollamanet.runasp.net/api'

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
      method: 'post',
      url: `${API_URL}/Models/Models`,
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize
      },
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch models');
  }
}

export { getModels };