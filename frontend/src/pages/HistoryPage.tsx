import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react';
import { getAnalysisHistory } from '../api/client';
import toast from 'react-hot-toast';

interface AnalysisHistoryItem {
  analysis_id: string;
  skin_tone?: string;
  overall_assessment: string;
  issues_count: number;
  created_at: string;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('No user ID found');
        navigate('/');
        return;
      }

      const data = await getAnalysisHistory(userId);
      setHistory(data.analyses || []);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your analysis history? This cannot be undone.')) {
      localStorage.removeItem('userId');
      setHistory([]);
      toast.success('History cleared');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No History Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Your skin analysis history will appear here
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Start First Analysis
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.analysis_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/results/${item.analysis_id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {item.skin_tone && (
                      <p className="text-sm text-gray-600 capitalize">
                        Skin Tone: {item.skin_tone}
                      </p>
                    )}
                  </div>
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                    {item.issues_count} {item.issues_count === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
                <p className="text-gray-700 line-clamp-2">{item.overall_assessment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

