import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, AlertCircle, TrendingUp, Package } from 'lucide-react';
import { AnalysisResult, ProductRecommendation } from '../types';
import { trackAffiliateClick } from '../api/client';
import toast from 'react-hot-toast';

export default function ResultsPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load result from session storage (in production, fetch from API)
    const storedResult = sessionStorage.getItem('analysisResult');
    if (storedResult) {
      const parsed = JSON.parse(storedResult);
      setResult(parsed);
    } else {
      toast.error('No analysis found');
      navigate('/');
    }
    setLoading(false);
  }, [analysisId, navigate]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const handleProductClick = (productId: string) => {
    const userId = localStorage.getItem('userId');
    const affiliateUrl = trackAffiliateClick(productId, analysisId, userId || undefined);
    window.open(affiliateUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>New Analysis</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overall Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Results</h1>
          <p className="text-gray-600 mb-4">
            {new Date(result.analysis.timestamp).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          
          {result.analysis.skin_tone && (
            <div className="mb-4">
              <span className="text-sm text-gray-600">Skin Tone: </span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {result.analysis.skin_tone}
              </span>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900">{result.analysis.overall_assessment}</p>
          </div>
        </div>

        {/* Issues and Recommendations */}
        {result.issues.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Great News!
            </h3>
            <p className="text-gray-600">
              No significant cosmetic concerns were detected. Keep up your skincare routine!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {result.issues.map((issueData, index) => (
              <div key={issueData.issue.issue_id} className="bg-white rounded-lg shadow-lg p-6">
                {/* Issue Header */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {index + 1}. {issueData.issue.issue_name}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(issueData.issue.severity)}`}>
                      {issueData.issue.severity}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{issueData.issue.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div>
                      <span className="text-gray-600">Confidence: </span>
                      <span className={`font-semibold ${getConfidenceColor(issueData.issue.confidence)}`}>
                        {Math.round(issueData.issue.confidence * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Affected areas: </span>
                      <span className="font-medium text-gray-900">
                        {issueData.issue.affected_areas.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                    Recommended Products
                  </h3>

                  {issueData.recommendations.length === 0 ? (
                    <p className="text-gray-600 italic">
                      No specific product recommendations available for this concern.
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {issueData.recommendations.map((rec) => (
                        <ProductCard
                          key={rec.product.product_id}
                          recommendation={rec}
                          onBuyClick={() => handleProductClick(rec.product.product_id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important Disclaimer:</p>
              <p>
                This analysis is for cosmetic purposes only and does not constitute medical advice. 
                Product recommendations are based on general suitability and may contain affiliate links. 
                Always patch test new products and consult a dermatologist for medical concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductCardProps {
  recommendation: ProductRecommendation;
  onBuyClick: () => void;
}

function ProductCard({ recommendation, onBuyClick }: ProductCardProps) {
  const { product, evidence, llm_generated_summary } = recommendation;
  const [expanded, setExpanded] = useState(false);

  const getStrengthBadge = (strength: string) => {
    const colors = {
      strong: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      preliminary: 'bg-blue-100 text-blue-800'
    };
    return colors[strength as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      {/* Product Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
          <p className="text-sm text-gray-600">{product.brand}</p>
          {product.price && (
            <p className="text-lg font-bold text-primary-600 mt-1">
              ${product.price.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Key Actives */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 mb-1">Key Ingredients:</p>
        <div className="flex flex-wrap gap-1">
          {product.key_actives.map((active, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
            >
              {active}
            </span>
          ))}
        </div>
      </div>

      {/* LLM Summary */}
      {llm_generated_summary && (
        <p className="text-sm text-gray-700 mb-3 italic">
          "{llm_generated_summary}"
        </p>
      )}

      {/* Evidence Summary */}
      {evidence.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {expanded ? '− Hide' : '+ Show'} Scientific Evidence ({evidence.length})
          </button>

          {expanded && (
            <div className="mt-2 space-y-2">
              {evidence.map((ev) => (
                <div key={ev.evidence_id} className="bg-gray-50 rounded p-2 text-xs">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-gray-900">{ev.active_ingredient}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStrengthBadge(ev.strength_label)}`}>
                      {ev.strength_label}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-1">{ev.short_summary}</p>
                  <p className="text-gray-600">
                    {ev.paper_title} ({ev.year})
                  </p>
                  {ev.pubmed_url && (
                    <a
                      href={ev.pubmed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline inline-flex items-center"
                    >
                      View study <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Buy Button */}
      <button
        onClick={onBuyClick}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition"
      >
        <span>Buy Now</span>
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
}

