import React from 'react'

const FilterButton = ({ label, isActive, onClick, icon: Icon }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
        isActive
          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  )
}

export default FilterButton
