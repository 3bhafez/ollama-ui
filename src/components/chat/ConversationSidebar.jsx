import React from 'react';
import { FiPlus, FiMessageSquare, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useConversation } from '../../context/ConversationContext';

const ConversationSidebar = ({ onNewChat }) => {
  const {
    conversations,
    activeConversation,
    setConversationActive,
    isSidebarOpen,
    sidebarTransition,
    toggleSidebar
  } = useConversation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // If it's today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }

    // If it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // return the date
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-24 bg-white rounded-lg p-2 z-30 hover:bg-gray-50 transition-colors"
        aria-label="Open sidebar"
        tabIndex="0"
        onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
      >
        <FiChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-[267px] bg-white overflow-hidden flex flex-col transition-all duration-300 transform sidebar-mobile ${sidebarTransition}`} style={{top: '80px', height: 'calc(100vh - 80px)'}}>
      {/* Header*/}
      <div className="p-2 flex items-center justify-between bg-white">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full py-2 px-3 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
          aria-label="Start new chat"
          tabIndex="0"
          onKeyDown={(e) => e.key === 'Enter' && onNewChat()}
        >
          <FiPlus className="w-4 h-4" />
          <span className="text-sm font-medium">New chat</span>
        </button>
        <button
          onClick={toggleSidebar}
          className="p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Close sidebar"
          tabIndex="0"
          onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto bg-white px-2 py-2">
        {conversations.length > 0 ? (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setConversationActive(conversation.id)}
                className={`w-full text-left p-3 rounded-lg text-[15px] transition-colors flex items-start gap-2 ${
                  activeConversation?.id === conversation.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                aria-label={`Chat with ${conversation.aI_Id}`}
                tabIndex="0"
                onKeyDown={(e) => e.key === 'Enter' && setConversationActive(conversation.id)}
              >
                <FiMessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${activeConversation?.id === conversation.id ? 'text-indigo-600' : 'text-gray-500'}`} />
                <div className="flex-1 min-w-0 truncate font-[450]">
                  {conversation.aI_Id}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            No conversations found
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
