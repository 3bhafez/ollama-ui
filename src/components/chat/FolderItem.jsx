import React, { useState, useRef, useEffect } from 'react';
import { FiFolder, FiMoreHorizontal, FiEdit2, FiTrash2, FiFolderPlus, FiMessageSquare, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const FolderItem = ({ 
  folder, 
  level = 0, 
  onEditFolder, 
  onDeleteFolder, 
  onDeleteConversation,
  onCreateSubfolder, 
  onCreateConversation,
  onSelectConversation,
  activeConversationId 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showConversationMenus, setShowConversationMenus] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const menuRef = useRef(null);
  const conversationMenuRefs = useRef({});
  const editInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      
      // Check conversation menus
      Object.keys(conversationMenuRefs.current).forEach(conversationId => {
        const menuRef = conversationMenuRefs.current[conversationId];
        if (menuRef && !menuRef.contains(event.target)) {
          setShowConversationMenus(prev => ({
            ...prev,
            [conversationId]: false
          }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editName.trim() && editName.trim() !== folder.name) {
      try {
        await onEditFolder(folder.id, editName.trim());
      } catch (error) {
        console.error('Failed to edit folder:', error);
        setEditName(folder.name);
      }
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditName(folder.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleEditCancel();
    }
  };
  
  const toggleConversationMenu = (conversationId) => {
    setShowConversationMenus(prev => ({
      ...prev,
      [conversationId]: !prev[conversationId]
    }));
  };
  
  const closeConversationMenu = (conversationId) => {
    setShowConversationMenus(prev => ({
      ...prev,
      [conversationId]: false
    }));
  };

  const paddingLeft = level * 16 + 8;
  const isRoot = folder.name === 'Root';

  if (isRoot) {
    return (
      <div className="folder-item">
        {/* Chats Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chats</h3>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-200 rounded transition-all"
                aria-label="Chat options"
              >
                <FiMoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                  <button
                    onClick={() => {
                      onCreateConversation(folder.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FiMessageSquare className="w-3 h-3" />
                    New chat
                  </button>
                  <button
                    onClick={() => {
                      onCreateSubfolder(folder.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FiFolderPlus className="w-3 h-3" />
                    Add folder
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Root Conversations */}
          <div className="space-y-1">
            {folder.conversations?.map((conversation) => (
              <div
                key={conversation.conversation_Id}
                className={`group flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                  activeConversationId === conversation.conversation_Id
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                style={{ paddingLeft: '8px' }}
              >
                <button
                  onClick={() => onSelectConversation(conversation.conversation_Id)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  <FiMessageSquare className={`w-3 h-3 flex-shrink-0 ${
                    activeConversationId === conversation.conversation_Id ? 'text-indigo-600' : 'text-gray-500'
                  }`} />
                  <span className="truncate">{conversation.title}</span>
                </button>
                
                {/* Conversation Kebab Menu */}
                <div className="relative" ref={el => conversationMenuRefs.current[conversation.conversation_Id] = el}>
                  <button
                    onClick={() => toggleConversationMenu(conversation.conversation_Id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                    aria-label="Conversation options"
                  >
                    <FiMoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>

                  {showConversationMenus[conversation.conversation_Id] && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                      <button
                        onClick={() => {
                          onDeleteConversation(conversation.conversation_Id);
                          closeConversationMenu(conversation.conversation_Id);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Folders Section */}
        {folder.subFolders && folder.subFolders.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 mb-2">Folders</h3>
            <div className="space-y-1">
              {folder.subFolders.map((subfolder) => (
                <FolderItem
                  key={subfolder.id}
                  folder={subfolder}
                  level={0}
                  onEditFolder={onEditFolder}
                  onDeleteFolder={onDeleteFolder}
                  onDeleteConversation={onDeleteConversation}
                  onCreateSubfolder={onCreateSubfolder}
                  onCreateConversation={onCreateConversation}
                  onSelectConversation={onSelectConversation}
                  activeConversationId={activeConversationId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="folder-item">
      {/* Folder Header */}
      <div 
        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
          >
            {isExpanded ? (
              <FiChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <FiChevronRight className="w-3 h-3 text-gray-500" />
            )}
          </button>

          {/* Folder Icon */}
          <FiFolder className="w-4 h-4 text-gray-500 flex-shrink-0" />

          {/* Folder Name */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="flex-1">
              <input
                ref={editInputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleEditSubmit}
                onKeyDown={handleKeyDown}
                className="w-full px-1 py-0.5 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </form>
          ) : (
            <span className="text-sm font-medium text-gray-700 truncate">
              {folder.name}
            </span>
          )}
        </div>

        {/* Kebab Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
            aria-label="Folder options"
          >
            <FiMoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
              <button
                onClick={() => {
                  onCreateConversation(folder.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <FiMessageSquare className="w-3 h-3" />
                New chat
              </button>
              <button
                onClick={() => {
                  onCreateSubfolder(folder.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <FiFolderPlus className="w-3 h-3" />
                Add subfolder
              </button>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <FiEdit2 className="w-3 h-3" />
                Rename
              </button>
              <button
                onClick={() => {
                  onDeleteFolder(folder.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <FiTrash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Folder Contents */}
      {isExpanded && (
        <div className="folder-contents">
          {/* Conversations */}
          {folder.conversations?.map((conversation) => (
            <div
              key={conversation.conversation_Id}
              className={`group flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                activeConversationId === conversation.conversation_Id
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              style={{ paddingLeft: `${paddingLeft + 24}px` }}
            >
              <button
                onClick={() => onSelectConversation(conversation.conversation_Id)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                <FiMessageSquare className={`w-3 h-3 flex-shrink-0 ${
                  activeConversationId === conversation.conversation_Id ? 'text-indigo-600' : 'text-gray-500'
                }`} />
                <span className="truncate">{conversation.title}</span>
              </button>
              
              {/* Conversation Kebab Menu */}
              <div className="relative" ref={el => conversationMenuRefs.current[conversation.conversation_Id] = el}>
                <button
                  onClick={() => toggleConversationMenu(conversation.conversation_Id)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                  aria-label="Conversation options"
                >
                  <FiMoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>

                {showConversationMenus[conversation.conversation_Id] && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                    <button
                      onClick={() => {
                        onDeleteConversation(conversation.conversation_Id);
                        closeConversationMenu(conversation.conversation_Id);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Subfolders */}
          {folder.subFolders?.map((subfolder) => (
            <FolderItem
              key={subfolder.id}
              folder={subfolder}
              level={level + 1}
              onEditFolder={onEditFolder}
              onDeleteFolder={onDeleteFolder}
              onDeleteConversation={onDeleteConversation}
              onCreateSubfolder={onCreateSubfolder}
              onCreateConversation={onCreateConversation}
              onSelectConversation={onSelectConversation}
              activeConversationId={activeConversationId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderItem;