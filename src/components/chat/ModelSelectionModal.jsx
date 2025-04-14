import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { getModels } from '../../services/modelService';

const ModelSelectionModal = ({ isOpen, onClose, onSelectModel }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [systemMessage, setSystemMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await getModels(1, 20);
      setModels(data.items || []);
      
      // Set the first model as default selected
      if (data.items?.length > 0 && !selectedModel) {
        setSelectedModel(data.items[0].name);
      }
    } catch (err) {
      setError('Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSelectModel(selectedModel, systemMessage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Start a new conversation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Select Model
              </label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="systemMessage" className="block text-sm font-medium text-gray-700 mb-1">
                System Message (Optional)
              </label>
              <textarea
                id="systemMessage"
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
                placeholder="Enter a system message to guide the AI's behavior"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Conversation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModelSelectionModal;
