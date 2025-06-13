import React, { useState } from 'react';
import { FiPlus, FiMessageSquare, FiChevronLeft, FiChevronRight, FiFolderPlus } from 'react-icons/fi';
import { useConversation } from '../../context/ConversationContext';
import FolderItem from './FolderItem';
import FolderModal from './FolderModal';

const ConversationSidebar = ({ onNewChat }) => {
  const {
    folderData,
    activeConversation,
    setConversationActive,
    createNewFolder,
    editFolderName,
    deleteFolderById,
    deleteConversationById,
    isSidebarOpen,
    sidebarTransition,
    toggleSidebar
  } = useConversation();
  
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null);

  const handleCreateFolder = () => {
    setCurrentFolderId(null); // Root folder
    setIsFolderModalOpen(true);
  };
  
  const handleCreateSubfolder = (parentFolderId) => {
    setCurrentFolderId(parentFolderId);
    setIsFolderModalOpen(true);
  };
  
  const handleFolderModalSubmit = async (folderName) => {
    await createNewFolder(folderName, currentFolderId);
  };
  
  const handleEditFolder = async (folderId, newName) => {
    await editFolderName(folderId, newName);
  };
  
  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
      await deleteFolderById(folderId);
    }
  };
  
  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      await deleteConversationById(conversationId);
    }
  };
  
  const handleCreateConversation = (folderId) => {
    onNewChat(folderId);
  };

  if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-20 bg-white rounded-lg p-2 z-30 hover:bg-gray-50 transition-colors shadow-md border border-gray-200"
        aria-label="Open sidebar"
        tabIndex="0"
        onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
      >
        <FiChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  return (
    <div className={`fixed top-0 left-0 z-40 w-[267px] bg-white overflow-hidden flex flex-col transition-all duration-300 transform sidebar-mobile border-r border-gray-200 ${sidebarTransition}`} style={{height: '100vh', paddingTop: '80px'}}>
      {/* Header*/}
      <div className="p-2 bg-white">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => onNewChat()}
            className="flex items-center gap-2 flex-1 py-2 px-3 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
            aria-label="Start new chat"
            tabIndex="0"
            onKeyDown={(e) => e.key === 'Enter' && onNewChat()}
          >
            <FiPlus className="w-4 h-4" />
            <span className="text-sm font-medium">New chat</span>
          </button>
          <button
            onClick={toggleSidebar}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors ml-2"
            aria-label="Close sidebar"
            tabIndex="0"
            onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
        </div>
        
        <button
          onClick={handleCreateFolder}
          className="flex items-center gap-2 w-full py-2 px-3 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
          aria-label="Create new folder"
          tabIndex="0"
          onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
        >
          <FiFolderPlus className="w-4 h-4" />
          <span className="text-sm font-medium">New folder</span>
        </button>
      </div>

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto bg-white px-2 py-2">
        {folderData ? (
          <FolderItem
            folder={folderData}
            level={0}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            onDeleteConversation={handleDeleteConversation}
            onCreateSubfolder={handleCreateSubfolder}
            onCreateConversation={handleCreateConversation}
            onSelectConversation={setConversationActive}
            activeConversationId={activeConversation?.id}
          />
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            Loading folders...
          </div>
        )}
      </div>
      
      {/* Folder Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreateFolder={handleFolderModalSubmit}
      />
    </div>
  );
};

export default ConversationSidebar;
