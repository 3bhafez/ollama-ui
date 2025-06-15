import React, { useState, useEffect, useCallback, useRef } from 'react'
import { getModels } from '../services/modelService'
import ModelCard from '../components/models/ModelCard'
import ModelSlider from '../components/models/ModelSlider'
import SearchBar from '../components/ui/SearchBar'
import FilterButton from '../components/ui/FilterButton'
import { FiCode, FiImage } from 'react-icons/fi'

const Models = () => {
  const [models, setModels] = useState([])
  const [featuredModels, setFeaturedModels] = useState([])
  const [filteredModels, setFilteredModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 11
  const observerRef = useRef()

  const fetchModels = async (page, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      const data = await getModels(page, pageSize)
      
      if (isLoadMore) {
        // Append new models to existing ones
        setModels(prevModels => [...prevModels, ...data.items])
      } else {
        // Replace models (initial load)
        setModels(data.items)
        setFeaturedModels(data.items.slice(0, 5))
      }
      
      // Check if there are more pages
      setHasMore(page < data.totalPages)
      setCurrentPage(page)
      
    } catch (err) {
      setError('Failed to fetch models')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load more models when reaching the bottom
  const loadMoreModels = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchModels(currentPage + 1, true)
    }
  }, [loadingMore, hasMore, currentPage])

  // Intersection Observer for infinite scroll
  const lastModelElementRef = useCallback(node => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreModels()
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    })
    if (node) observerRef.current.observe(node)
  }, [loading, hasMore, loadingMore, loadMoreModels])

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

  // Reset pagination when search or filter changes
  const resetAndSearch = () => {
    setModels([])
    setCurrentPage(1)
    setHasMore(true)
    fetchModels(1)
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
            filteredModels.map((model, index) => {
              // Add ref to the last element for infinite scroll
              const isLastElement = index === filteredModels.length - 1
              return (
                <div 
                  key={`${model.name}-${index}`} 
                  className="flex justify-center"
                  ref={isLastElement ? lastModelElementRef : null}
                >
                  <ModelCard model={model} />
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No models found matching your criteria.
            </div>
          )}
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* End of Results Indicator */}
         {!hasMore && models.length > 0 && (
           <div className="text-center py-8 text-gray-500">
             <div className="flex items-center justify-center">
               <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
               <span className="px-4 text-sm">You've reached the end</span>
               <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
             </div>
           </div>
         )}


      </section>
    </div>
  )
}

export default Models