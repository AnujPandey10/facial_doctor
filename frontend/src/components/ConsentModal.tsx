import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentModal({ onAccept, onDecline }: ConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Consent & Privacy Notice
              </h2>
            </div>
            <button
              onClick={onDecline}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Important: This is NOT a medical diagnostic tool
              </p>
            </div>

            <div className="space-y-3 text-gray-700">
              <h3 className="font-semibold text-lg">By proceeding, you understand and agree that:</h3>
              
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong>Image Upload:</strong> Your facial image will be uploaded to our cloud servers 
                  for processing by a third-party AI service.
                </li>
                <li>
                  <strong>Cosmetic Analysis Only:</strong> This service provides cosmetic skin analysis 
                  and product recommendations only. It does NOT diagnose medical conditions.
                </li>
                <li>
                  <strong>Not Medical Advice:</strong> Results are for informational purposes only and 
                  should not replace professional medical advice from a dermatologist.
                </li>
                <li>
                  <strong>Data Processing:</strong> Your images are processed by OpenAI's GPT-4 Vision 
                  API (or similar provider) and are subject to their privacy policy.
                </li>
                <li>
                  <strong>Storage:</strong> We may temporarily store your images for quality assurance 
                  and service improvement. You can request deletion at any time.
                </li>
                <li>
                  <strong>Affiliate Links:</strong> Product recommendations may contain affiliate links. 
                  We may earn a commission if you make a purchase.
                </li>
                <li>
                  <strong>Age Requirement:</strong> You must be 18 years or older to use this service.
                </li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Medical Concerns?</strong> If you have any medical skin concerns, rashes, 
                  suspicious moles, or persistent skin issues, please consult a licensed dermatologist 
                  or healthcare provider.
                </p>
              </div>
            </div>
          </div>

          {/* Checkbox */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                I have read and understood the above information. I consent to uploading my image 
                for cosmetic skin analysis and understand this is not medical advice. I am 18 years 
                or older.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={!agreed}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
                agreed
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

