import { useState } from 'react';
import { FiSend, FiSettings } from 'react-icons/fi';

const ChatInput = ({ onSendMessage, loading, models, activeModel, onChangeModel, systemMessage, onChangeSystemMessage }) => {
  const [message, setMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(1);
  const [localSystemMessage, setLocalSystemMessage] = useState(systemMessage || '');
  const [localModel, setLocalModel] = useState(activeModel || '');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    
    onSendMessage(message, localModel, localSystemMessage, temperature.toString());
    setMessage('');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleApplySettings = () => {
    onChangeModel(localModel);
    onChangeSystemMessage(localSystemMessage);
    setShowSettings(false);
  };
  
  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                id="model"
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
                System Message
              </label>
              <textarea
                id="systemMessage"
                value={localSystemMessage}
                onChange={(e) => setLocalSystemMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-h-[80px]"
                placeholder="Enter a system message to guide the AI's behavior"
              />
            </div>
            
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                Temperature: {temperature}
              </label>
              <input
                id="temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>More precise</span>
                <span>More creative</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleApplySettings}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Apply Settings
              </button>
            </div>
          </div>
        )}
        
        {/* Message Input */}
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows={3}
            disabled={loading}
          />
          
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
              aria-label="Chat settings"
            >
              <FiSettings className="w-5 h-5" />
            </button>
            
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className={`p-2 rounded-full ${
                !message.trim() || loading
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } transition-colors`}
              aria-label="Send message"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSend className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
