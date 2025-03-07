import { useState, useEffect } from 'react'
import { getModels } from '../services/modelService'
import ModelCard from '../components/models/ModelCard'

const Models = () => {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getModels()
        setModels(data.items)
      } catch (err) {
        setError('Failed to fetch models')
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-6">Available Models</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <ModelCard key={model.name} model={model} />
        ))}
      </div>
    </div>
  )
}

export default Models