import { FiCpu, FiHardDrive, FiTag } from 'react-icons/fi'

const ModelCard = ({ model }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
          <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            {model.version}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2">
          {model.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FiHardDrive className="h-4 w-4" />
            <span>{model.size}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <FiTag className="h-4 w-4" />
            <div className="flex gap-1">
              {model.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-50 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelCard
