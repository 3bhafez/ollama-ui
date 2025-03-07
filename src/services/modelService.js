import axios from 'axios'

const API_URL = 'http://localhost:7006/api'

const getModels = async (pageNumber = 1, pageSize = 5) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${API_URL}/Models/Models`,
      data: {
        PageNumber: pageNumber,
        PageSize: pageSize
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    console.log('API Response:', response.data)
    return response.data
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response,
      request: error.request
    })
    throw new Error(error.response?.data?.message || 'Failed to fetch models')
  }
}

export { getModels }