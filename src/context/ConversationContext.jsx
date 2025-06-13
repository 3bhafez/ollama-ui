import { createContext, useState, useEffect, useContext } from 'react';
import { 
  createConversation, 
  sendChatMessage, 
  getUserFolders, 
  getConversationMessages,
  createFolder,
  editFolder,
  deleteFolder,
  deleteConversation
} from '../services/conversationService';
import { useAuth } from './AuthContext';
import { getUser } from '../services/authService';

const ConversationContext = createContext(null);

export const ConversationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [folderData, setFolderData] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarTransition, setSidebarTransition] = useState('');
  
  // sidebar state
  const getInitialSidebarState = () => {
    // On mobile, start with sidebar closed
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return false;
    }
    
    // check localStorage
    const savedState = localStorage.getItem('sidebar_open');
    if (savedState !== null) {
      return savedState === 'true';
    }
    
    // Default to open on desktop
    return true;
  };
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(getInitialSidebarState);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar_open', isSidebarOpen);
    
    // Add or remove the 'sidebar-open' class to body on mobile
    if (typeof document !== 'undefined') {
      if (isSidebarOpen) {
        document.body.classList.add('sidebar-open');
        setSidebarTransition('sidebar-enter-active');
      } else {
        document.body.classList.remove('sidebar-open');
        setSidebarTransition('sidebar-exit-active');
      }
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('sidebar-open');
      }
    };
  }, [isSidebarOpen]);
  
  // Handle window resize to auto close sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Fetch folders when authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      fetchFolders();
    }
  }, [isAuthenticated]);

  // Fetch folders and conversations
  const fetchFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserFolders();
      setFolderData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchConversationMessages = async (conversationId) => {
    try {
      setLoading(true);
      setError(null);
      const messages = await getConversationMessages(conversationId);
      
      // Process messages to ensure consistent structure
      const processedMessages = messages.map(message => {
        // For Assistant messages, ensure they have a responseId field
        if (message.role === 'Assistant') {
          return {
            ...message,
            responseId: message.id // Store the original id as responseId for consistency
          };
        }
        return message;
      });
      
      setActiveMessages(processedMessages || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch conversation messages');
    } finally {
      setLoading(false);
    }
  };

  // Create a new conversation
  const createNewConversation = async (modelName, title, systemMessage = "", folderId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use root folder ID if no folder specified
      const user = getUser();
      const targetFolderId = folderId || user?.rootFolderId;
      
      if (!targetFolderId) {
        throw new Error('No folder ID available');
      }
      
      const newConversation = await createConversation(modelName, title, systemMessage, targetFolderId);
      
      // Refresh folder data to include the new conversation
      await fetchFolders();
      
      // Set the new conversation as active
      const activeConv = {
        id: newConversation.conversationId,
        title: newConversation.title,
        aI_Id: newConversation.modelname,
        systemMessage: systemMessage,
        createdAt: new Date().toISOString()
      };
      
      setActiveConversation(activeConv);
      setActiveMessages([]);
      
      // Auto close sidebar on mobile after selecting a conversation
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
      
      return newConversation;
    } catch (err) {
      setError(err.message || 'Failed to create conversation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send a message in the active conversation
  const sendMessage = async (content, model, systemMessage = "", temperature = "1") => {
    if (!activeConversation) {
      setError('No active conversation');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add user message to the UI
      const userMessage = {
        id: `temp-${Date.now()}`,
        role: 'User',
        content: content,
        createdAt: new Date().toISOString()
      };
      
      setActiveMessages([...activeMessages, userMessage]);
      
      // Send the message to the API
      const response = await sendChatMessage(
        activeConversation.id,
        model || activeConversation.aI_Id,
        content,
        systemMessage,
        { temperature }
      );
      
      // Add AI response to the messages
      const aiMessage = {
        id: response.resposneId, // Using the responseId from the API as the message id
        responseId: response.resposneId, // Store the original responseId separately for clarity
        role: 'Assistant',
        content: response.content,
        createdAt: new Date().toISOString(),
        metadata: {
          totalDuration: response.totalDuration,
          loadDuration: response.loadDuration,
          promptEvalCount: response.promptEvalCount,
          promptEvalDuration: response.promptEvalDuration,
          evalCount: response.evalCount,
          evalDuration: response.evalDuration
        }
      };
      
      // Replace the temporary user message
      setActiveMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== userMessage.id);
        return [
          ...filtered, 
          {
            ...userMessage,
            id: `user-${Date.now()}`
          },
          aiMessage
        ];
      });
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set an existing conversation as active
  const setConversationActive = async (conversationId) => {
    // Find conversation in folder data
    const findConversationInFolders = (folders) => {
      if (!folders) return null;
      
      // Check conversations in current folder
      const conversation = folders.conversations?.find(c => c.conversation_Id === conversationId);
      if (conversation) {
        return {
          id: conversation.conversation_Id,
          title: conversation.title,
          aI_Id: conversation.aiModel_Id,
          createdAt: conversation.createdAt
        };
      }
      
      // Check subfolders recursively
      if (folders.subFolders) {
        for (const subfolder of folders.subFolders) {
          const found = findConversationInFolders(subfolder);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    const conversation = findConversationInFolders(folderData);
    if (conversation) {
      setActiveConversation(conversation);
      await fetchConversationMessages(conversationId);
      
      // Auto close sidebar on mobile after selecting a conversation
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  };
  
  // Create a new folder
  const createNewFolder = async (name, parentFolderId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use root folder ID if no parent specified
      const user = getUser();
      const targetParentId = parentFolderId || user?.rootFolderId;
      
      if (!targetParentId) {
        throw new Error('No parent folder ID available');
      }
      
      await createFolder(name, targetParentId);
      
      // Refresh folder data
      await fetchFolders();
    } catch (err) {
      setError(err.message || 'Failed to create folder');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Edit folder name
  const editFolderName = async (folderId, newName) => {
    try {
      setLoading(true);
      setError(null);
      
      await editFolder(folderId, newName);
      
      // Refresh folder data
      await fetchFolders();
    } catch (err) {
      setError(err.message || 'Failed to edit folder');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Delete folder
  const deleteFolderById = async (folderId) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteFolder(folderId);
      
      // Refresh folder data
      await fetchFolders();
      
      // If active conversation was in deleted folder, clear it
      if (activeConversation) {
        const conversationExists = findConversationInFolders(folderData, activeConversation.id);
        if (!conversationExists) {
          setActiveConversation(null);
          setActiveMessages([]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to delete folder');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Delete conversation with optimistic UI updates
  const deleteConversationById = async (conversationId) => {
    // Store original state for potential rollback
    const originalFolderData = folderData;
    const originalActiveConversation = activeConversation;
    const originalActiveMessages = activeMessages;
    
    // Optimistically update UI immediately
    const removeConversationFromFolder = (folder) => {
      if (!folder) return folder;
      
      const updatedFolder = { ...folder };
      
      // Remove conversation from current folder
      if (updatedFolder.conversations) {
        updatedFolder.conversations = updatedFolder.conversations.filter(
          conv => conv.conversation_Id !== conversationId
        );
      }
      
      // Recursively update subfolders
      if (updatedFolder.subFolders) {
        updatedFolder.subFolders = updatedFolder.subFolders.map(removeConversationFromFolder);
      }
      
      return updatedFolder;
    };
    
    // Update folder data optimistically
    if (folderData) {
      setFolderData(removeConversationFromFolder(folderData));
    }
    
    // Clear active conversation if it's the one being deleted
    if (activeConversation && activeConversation.id === conversationId) {
      setActiveConversation(null);
      setActiveMessages([]);
    }
    
    try {
      setError(null);
      
      // Make API call in background
      await deleteConversation(conversationId);
      
      // Optionally refresh to ensure consistency (can be removed if not needed)
      // await fetchFolders();
      
    } catch (err) {
      // Rollback optimistic updates on error
      setFolderData(originalFolderData);
      setActiveConversation(originalActiveConversation);
      setActiveMessages(originalActiveMessages);
      
      setError(err.message || 'Failed to delete conversation');
      throw err;
    }
  };
  
  // Helper function to find conversation in folders
  const findConversationInFolders = (folders, conversationId) => {
    if (!folders) return null;
    
    // Check conversations in current folder
    const conversation = folders.conversations?.find(c => c.conversation_Id === conversationId);
    if (conversation) return conversation;
    
    // Check subfolders recursively
    if (folders.subFolders) {
      for (const subfolder of folders.subFolders) {
        const found = findConversationInFolders(subfolder, conversationId);
        if (found) return found;
      }
    }
    
    return null;
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const value = {
    folderData,
    activeConversation,
    activeMessages,
    loading,
    error,
    isSidebarOpen,
    sidebarTransition,
    fetchFolders,
    fetchConversationMessages,
    createNewConversation,
    createNewFolder,
    editFolderName,
    deleteFolderById,
    deleteConversationById,
    sendMessage,
    setConversationActive,
    toggleSidebar
  };

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
};

// Custom hook to use the conversation context
export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};
