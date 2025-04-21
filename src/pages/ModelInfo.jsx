import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getModelInfo } from '../services/modelService';
import { FiExternalLink, FiClock, FiCpu, FiHash, FiLayers, FiMessageSquare, FiCopy, FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';

const ModelInfo = () => {
  const { modelName } = useParams();
  const navigate = useNavigate();
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('license');
  const [copyStatus, setCopyStatus] = useState({
    license: false,
    modelfile: false,
    template: false
  });

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        setLoading(true);
        const data = await getModelInfo(modelName);
        setModelInfo(data);
      } catch (err) {
        setError('Failed to fetch model information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchModelInfo();
  }, [modelName]);

  useEffect(() => {
    // Reset copy status after 2 seconds
    const timers = Object.keys(copyStatus).map(key => {
      if (copyStatus[key]) {
        return setTimeout(() => {
          setCopyStatus(prev => ({ ...prev, [key]: false }));
        }, 2000);
      }
      return null;
    }).filter(Boolean);

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [copyStatus]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCopy = (content, type) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopyStatus({ ...copyStatus, [type]: true });
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !modelInfo) {
    return (
      <div className="py-16 text-center">
        <div className="text-red-600 mb-4">{error || 'Error loading model information'}</div>
        <button 
          onClick={() => navigate('/models')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Models
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-2 max-w-5xl">
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-gray-900">{modelInfo.name}</h1>
            {modelInfo.tags && modelInfo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {modelInfo.tags.map((tag) => (
                  <span 
                    key={tag.id} 
                    className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-md"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link 
              to={`/chat?model=${modelInfo.name}`}
              className="w-28 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
            >
              Chat <FiMessageSquare className="w-4 h-4" />
            </Link>
            
            <a 
              href={modelInfo.referenceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-28 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
            >
              Info <FiExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-2">
          <div className="flex items-center">
            <FiClock className="mr-1" />
            <span>Released: {formatDate(modelInfo.releasedAt)}</span>
          </div>
          <span className="text-gray-400">|</span>
          <div className="flex items-center">
            <FiCpu className="mr-1" />
            <span>{modelInfo.parameterSize}</span>
          </div>
          <span className="text-gray-400">|</span>
          <div className="flex items-center">
            <FiHash className="mr-1" />
            <span>{modelInfo.parameterCount.toLocaleString()} parameters</span>
          </div>
          <span className="text-gray-400">|</span>
          <div className="flex items-center">
            <FiLayers className="mr-1" />
            <span>{modelInfo.quantizationLevel}</span>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <p className="text-gray-700 leading-relaxed">
          {modelInfo.description}
        </p>
      </div>

      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('license')}
              className={`py-4 px-1 border-b-2 font-medium text-base ${
                activeTab === 'license'
                  ? 'border-indigo-500 text-indigo-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              License
            </button>
            <button
              onClick={() => handleTabChange('modelfile')}
              className={`py-4 px-1 border-b-2 font-medium text-base ${
                activeTab === 'modelfile'
                  ? 'border-indigo-500 text-indigo-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Modelfile
            </button>
            <button
              onClick={() => handleTabChange('template')}
              className={`py-4 px-1 border-b-2 font-medium text-base ${
                activeTab === 'template'
                  ? 'border-indigo-500 text-indigo-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Template
            </button>
          </nav>
        </div>

        <div className="mt-6 overflow-hidden">
          {activeTab === 'license' && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-auto max-h-[600px]">
              <div className="p-1 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <div className="flex space-x-1.5 px-3 py-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <button 
                  onClick={() => handleCopy(modelInfo.license, 'license')}
                  className="mr-2 p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 rounded transition-colors"
                  aria-label="Copy license text"
                >
                  {copyStatus.license ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 p-6 overflow-auto">{modelInfo.license}</pre>
            </div>
          )}
          
          {activeTab === 'modelfile' && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-auto max-h-[600px]">
              <div className="p-1 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <div className="flex space-x-1.5 px-3 py-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <button 
                  onClick={() => handleCopy(modelInfo.modelFile, 'modelfile')}
                  className="mr-2 p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 rounded transition-colors"
                  aria-label="Copy modelfile text"
                >
                  {copyStatus.modelfile ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 p-6 overflow-auto">{modelInfo.modelFile}</pre>
            </div>
          )}
          
          {activeTab === 'template' && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-auto max-h-[600px]">
              <div className="p-1 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <div className="flex space-x-1.5 px-3 py-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <button 
                  onClick={() => handleCopy(modelInfo.template, 'template')}
                  className="mr-2 p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 rounded transition-colors"
                  aria-label="Copy template text"
                >
                  {copyStatus.template ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 p-6 overflow-auto">{modelInfo.template}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelInfo; 