import axios from 'axios'

const API_URL = 'http://ollamanet.runasp.net/api'

const getModels = async (pageNumber = 1, pageSize = 11) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${API_URL}/Models/Models`,
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('API Error:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch models')
  }
}

export { getModels }