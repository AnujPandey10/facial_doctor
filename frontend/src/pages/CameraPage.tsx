import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Camera, Upload, ArrowLeft, Lightbulb, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeImage } from '../api/client';

export default function CameraPage() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGuidance, setShowGuidance] = useState(true);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage) {
      toast.error('Please capture or upload an image first');
      return;
    }

    setIsAnalyzing(true);
    const loadingToast = toast.loading('Analyzing your skin...');

    try {
      // Convert base64 to File
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

      // Generate a simple user ID (in production, use proper auth)
      const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
      localStorage.setItem('userId', userId);

      // Call API
      const result = await analyzeImage(file, true, userId, {
        makeup_removed: true,
        image_angles: ['frontal']
      });

      toast.dismiss(loadingToast);
      toast.success('Analysis complete!');
      
      // Store result temporarily
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      
      // Navigate to results
      navigate(`/results/${result.analysis.analysis_id}`);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.message || 'Analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

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
            <span>Back</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Take Your Selfie
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Follow the guidance below for best results
        </p>

        {/* Guidance Tips */}
        {showGuidance && !capturedImage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">Tips for Best Results:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Remove makeup and cleanse your face</li>
                    <li>• Use natural, even lighting (face a window)</li>
                    <li>• Look directly at the camera</li>
                    <li>• Keep a neutral expression</li>
                    <li>• Ensure your entire face is visible</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowGuidance(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Camera/Preview Area */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="relative aspect-[3/4] max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden">
            {!capturedImage ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                  facingMode: 'user',
                  width: 1280,
                  height: 720
                }}
              />
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Face Guide Overlay */}
            {!capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-80 border-4 border-white border-dashed rounded-full opacity-50"></div>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="mt-6 flex justify-center space-x-4">
            {!capturedImage ? (
              <>
                <button
                  onClick={capturePhoto}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                  <span>Capture Photo</span>
                </button>
                
                <label className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-8 py-3 rounded-lg font-medium flex items-center space-x-2 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </>
            ) : (
              <>
                <button
                  onClick={retake}
                  disabled={isAnalyzing}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  Retake
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Skin'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <strong>Reminder:</strong> This analysis is for cosmetic purposes only. 
              For medical concerns, please consult a dermatologist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

