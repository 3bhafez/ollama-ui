import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { FiInfo } from 'react-icons/fi';

const ChatMessage = ({ message }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDuration = (nanoseconds) => {
    if (!nanoseconds) return '0ms';
    
    // Convert nanoseconds to milliseconds
    const ms = nanoseconds / 1000000;
    
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  };
  
  const isUserMessage = message.role === 'User';
  
  return (
    <div className={`py-4 ${isUserMessage ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUserMessage 
              ? 'bg-indigo-100 text-indigo-600' 
              : 'bg-purple-100 text-purple-600'
          }`}>
            {isUserMessage ? 'U' : 'AI'}
          </div>
          
          {/* Message content */}
          <div className="flex-1 space-y-1">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-gray-900">
                {isUserMessage ? 'You' : 'AI Assistant'}
              </span>
              <div className="flex items-center gap-2">
                {!isUserMessage && message.metadata && (
                  <button 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowInfo(!showInfo)}
                    aria-label="Show response information"
                  >
                    <FiInfo className="w-4 h-4" />
                  </button>
                )}
                <span className="text-xs text-gray-500">
                  {formatTime(message.createdAt)}
                </span>
              </div>
            </div>
            
            {/* Message body */}
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                remarkPlugins={[remarkGfm]}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            
            {/* Response info */}
            {!isUserMessage && showInfo && message.metadata && (
              <div className="mt-2 p-2 bg-gray-100 rounded-md text-xs text-gray-600 space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>Total Duration: {formatDuration(message.metadata.totalDuration)}</div>
                  <div>Load Duration: {formatDuration(message.metadata.loadDuration)}</div>
                  <div>Prompt Eval Count: {message.metadata.promptEvalCount}</div>
                  <div>Prompt Eval Duration: {formatDuration(message.metadata.promptEvalDuration)}</div>
                  <div>Eval Count: {message.metadata.evalCount}</div>
                  <div>Eval Duration: {formatDuration(message.metadata.evalDuration)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
