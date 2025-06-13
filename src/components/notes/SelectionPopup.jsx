import { FiPlus } from 'react-icons/fi';

const SelectionPopup = ({ 
  isVisible, 
  position, 
  onAddNote, 
  disabled = false 
}) => {
  if (!isVisible || !position) return null;

  return (
    <div 
      className="absolute z-40 transform -translate-x-1/2 mt-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      {/* Arrow pointing up */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"></div>
      </div>
      
      {/* Popup content */}
      <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            if (!disabled) {
              onAddNote();
            }
          }}
          disabled={disabled}
          className="flex items-center gap-2 text-sm font-medium hover:text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus className="w-4 h-4" />
          Add Note
        </button>
      </div>
    </div>
  );
};

export default SelectionPopup;