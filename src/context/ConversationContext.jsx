import { createContext, useState, useEffect, useContext } from 'react';
import { 
  openConversation, 
  sendChatMessage, 
  getConversations, 
  getConversationMessages 
} from '../services/conversationService';
import { useAuth } from './AuthContext';

const ConversationContext = createContext(null);

export const ConversationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
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

  // Fetch conversations when authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations();
      setConversations(data.items || []);
      
      // If there are conversations and no active one, set the first one as active
      if (data.items?.length > 0 && !activeConversation) {
        setActiveConversation(data.items[0]);
        await fetchConversationMessages(data.items[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch conversations');
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
      setActiveMessages(messages || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch conversation messages');
    } finally {
      setLoading(false);
    }
  };

  // Create a new conversation
  const createConversation = async (modelName, systemMessage = "") => {
    try {
      setLoading(true);
      setError(null);
      const newConversation = await openConversation(modelName, systemMessage);
      
      // Add the new conversation to the list
      const updatedConversation = {
        id: newConversation.conversationId,
        aI_Id: newConversation.modelname,
        systemMessage: systemMessage,
        createdAt: new Date().toISOString(),
        conversationPromptResponses: []
      };
      
      setConversations([updatedConversation, ...conversations]);
      setActiveConversation(updatedConversation);
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
        id: response.resposneId,
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
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setActiveConversation(conversation);
      await fetchConversationMessages(conversationId);
      
      // Auto close sidebar on mobile after selecting a conversation
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const value = {
    conversations,
    activeConversation,
    activeMessages,
    loading,
    error,
    isSidebarOpen,
    sidebarTransition,
    fetchConversations,
    fetchConversationMessages,
    createConversation,
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
