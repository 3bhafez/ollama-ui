import { useState, useEffect } from 'react'
import { getModels } from '../services/modelService'
import ModelCard from '../components/models/ModelCard'
import ModelSlider from '../components/models/ModelSlider'
import SearchBar from '../components/ui/SearchBar'
import FilterButton from '../components/ui/FilterButton'
import { FiChevronLeft, FiChevronRight, FiCode, FiImage } from 'react-icons/fi'

const Models = () => {
  const [models, setModels] = useState([])
  const [featuredModels, setFeaturedModels] = useState([])
  const [filteredModels, setFilteredModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 11,
    totalPages: 1,
    totalRecords: 0
  })

  const fetchModels = async (page) => {
    try {
      setLoading(true)
      const data = await getModels(page, pagination.pageSize)
      setModels(data.items)
      setFilteredModels(data.items)

      // Set featured models only on initial load
      if (page === 1) {
        setFeaturedModels(data.items.slice(0, 5))
      }

      setPagination({
        currentPage: data.currentPage,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        totalRecords: data.totalRecords
      })
    } catch (err) {
      setError('Failed to fetch models')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels(1)
  }, [])

  // Handle search and filtering
  useEffect(() => {
    if (!models.length) return

    let result = [...models]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply tag filter
    if (activeFilter) {
      result = result.filter(model =>
        model.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase())
      )
    }

    setFilteredModels(result)
  }, [searchTerm, activeFilter, models])

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFilterClick = (filter) => {
    setActiveFilter(activeFilter === filter ? null : filter)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchModels(newPage)
    }
  }

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
    <div className="py-8 mx-auto px-7">
      {/* Explore Models Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Explore Models</h2>
        <ModelSlider models={featuredModels} />
      </section>

      {/* All Models Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">All Models</h2>

        {/* Divider */}
        <div className="flex items-center justify-center my-8">
          <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 mx-2"></div>
          <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="w-full md:w-2/3">
            <SearchBar onSearch={handleSearch} placeholder="Search your models" />
          </div>
          <div className="flex gap-3">
            <FilterButton
              label="Language"
              icon={FiCode}
              isActive={activeFilter === 'Langauge'}
              onClick={() => handleFilterClick('Langauge')}
            />
            <FilterButton
              label="Multimodel"
              icon={FiImage}
              isActive={activeFilter === 'Multimodel'}
              onClick={() => handleFilterClick('Multimodel')}
            />
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {filteredModels.length > 0 ? (
            filteredModels.map((model) => (
              <div key={model.name} className="flex justify-center">
                <ModelCard model={model} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No models found matching your criteria.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredModels.length}</span> of{' '}
                <span className="font-medium">{pagination.totalRecords}</span> results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center p-2 rounded-md text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="relative inline-flex items-center p-2 rounded-md text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Models