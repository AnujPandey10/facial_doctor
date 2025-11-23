import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Shield, Sparkles, TrendingUp } from 'lucide-react';
import ConsentModal from '../components/ConsentModal';

export default function HomePage() {
  const navigate = useNavigate();
  const [showConsent, setShowConsent] = useState(false);

  const handleGetStarted = () => {
    setShowConsent(true);
  };

  const handleConsentAccepted = () => {
    setShowConsent(false);
    navigate('/camera');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">SkinCare AI</h1>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              History
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Camera className="w-20 h-20 text-primary-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Skin Analysis
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Get personalized skincare recommendations based on advanced AI analysis of your skin.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <Camera className="w-12 h-12 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Quick Analysis</h3>
              <p className="text-gray-600 text-sm">
                Take a selfie and get instant AI-powered skin analysis
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <TrendingUp className="w-12 h-12 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Evidence-Based</h3>
              <p className="text-gray-600 text-sm">
                Recommendations backed by scientific research and studies
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <Shield className="w-12 h-12 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
              <p className="text-gray-600 text-sm">
                Your data is processed securely and never shared
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGetStarted}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transform transition hover:scale-105"
          >
            Start Analysis
          </button>

          {/* Disclaimer */}
          <p className="mt-8 text-sm text-gray-500 max-w-2xl mx-auto">
            This is a cosmetic analysis tool and does not provide medical diagnoses. 
            For medical skin concerns, please consult a dermatologist.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 SkinCare AI. All rights reserved.
            </p>
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>

      {/* Consent Modal */}
      {showConsent && (
        <ConsentModal
          onAccept={handleConsentAccepted}
          onDecline={() => setShowConsent(false)}
        />
      )}
    </div>
  );
}

