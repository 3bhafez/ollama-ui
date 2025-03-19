import { FiTag } from 'react-icons/fi'

const ModelCard = ({ model }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-2 hover:border-indigo-300 w-full h-[285px] flex flex-col">
      {/* Image Section with padding */}
      <div className="p-4 bg-white h-[160px] flex items-center justify-center">
        <div className="relative h-full w-full rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-100">
          <img
            src={model.imageUrl}
            alt={`${model.name} logo`}
            className="w-[85%] h-[85%] object-contain"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 py-3 flex flex-col bg-white flex-grow">
        {/* Model Name */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1 mb-2">
          {model.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-xs line-clamp-2 mb-3">
          {model.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {model.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModelCard
