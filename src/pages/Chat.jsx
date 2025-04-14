import { useState, useEffect, useRef } from 'react';
import { useConversation } from '../context/ConversationContext';
import { getModels } from '../services/modelService';
import ConversationSidebar from '../components/chat/ConversationSidebar';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import ModelSelectionModal from '../components/chat/ModelSelectionModal';
import { FiMessageSquare } from 'react-icons/fi';

const Chat = () => {
  const {
    activeConversation,
    activeMessages,
    loading,
    error,
    isSidebarOpen,
    toggleSidebar,
    createConversation,
    sendMessage
  } = useConversation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [systemMessage, setSystemMessage] = useState('');
  const [activeModel, setActiveModel] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  // Set active model and system message when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      setActiveModel(activeConversation.aI_Id);
      setSystemMessage(activeConversation.systemMessage || '');
    }
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const fetchModels = async () => {
    try {
      const data = await getModels(1, 20);
      setModels(data.items || []);
    } catch (err) {
      console.error('Failed to fetch models:', err);
    }
  };

  const handleNewChat = () => {
    setIsModalOpen(true);
  };

  const handleSelectModel = async (modelName, systemMsg) => {
    try {
      await createConversation(modelName, systemMsg);
      setSystemMessage(systemMsg);
      setActiveModel(modelName);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleSendMessage = async (content, model, systemMsg, temperature) => {
    try {
      await sendMessage(content, model, systemMsg, temperature);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full -mt-5 mb-0 relative h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <ConversationSidebar onNewChat={handleNewChat} />
      
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden" 
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Chat Area */}
      <div className={`w-full h-full flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:pl-[267px]' : ''}`}>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {activeConversation ? (
            activeMessages.length > 0 ? (
              <div className="pb-4 p-4">
                {activeMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                    <FiMessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Start a new conversation</h3>
                  <p className="text-gray-500 max-w-md">
                    Send a message to start chatting with the AI assistant
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                  <FiMessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No conversation selected</h3>
                <p className="text-gray-500 max-w-md">
                  Select a conversation from the sidebar or start a new one
                </p>
                <button
                  onClick={handleNewChat}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  aria-label="Create new conversation"
                  tabIndex="0"
                  onKeyDown={(e) => e.key === 'Enter' && handleNewChat()}
                >
                  New Conversation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        {activeConversation && (
          <ChatInput
            onSendMessage={handleSendMessage}
            loading={loading}
            models={models}
            activeModel={activeModel}
            onChangeModel={setActiveModel}
            systemMessage={systemMessage}
            onChangeSystemMessage={setSystemMessage}
          />
        )}
      </div>

      {/* Model Selection Modal */}
      <ModelSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectModel={handleSelectModel}
      />
    </div>
  );
};

export default Chat;