import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Tesseract from 'tesseract.js';

const OCRAssessment = () => {
  const { classId, studentId } = useParams();
  const navigate = useNavigate();
  const [ocrResult, setOcrResult] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
  const [accuracy, setAccuracy] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showAccuracy, setShowAccuracy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // OCR Functionality
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        { logger: m => console.log(m) }
      );
      setOcrResult(result.data.text);
    } catch (err) {
      setError('OCR processing failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate accuracy
  const calculateAccuracy = (expected, actual) => {
    console.log('Calculating accuracy:', { expected, actual });
    if (!expected || !actual) return 0;
    
    // Clean and normalize the texts
    const cleanExpected = expected.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
    const cleanActual = actual.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
    
    // Split into words and remove empty strings
    const expectedWords = cleanExpected.split(/\s+/).filter(word => word.length > 0);
    const actualWords = cleanActual.split(/\s+/).filter(word => word.length > 0);
    
    console.log('Cleaned expected words:', expectedWords);
    console.log('Cleaned actual words:', actualWords);
    
    // Count matching words
    let matches = 0;
    expectedWords.forEach(expectedWord => {
      // Check for exact matches first
      if (actualWords.includes(expectedWord)) {
        matches++;
      } else {
        // Check for partial matches (for OCR errors)
        const partialMatch = actualWords.some(actualWord => {
          // Check if words are similar (for OCR errors)
          const similarity = calculateSimilarity(expectedWord, actualWord);
          return similarity > 0.8; // 80% similarity threshold
        });
        if (partialMatch) {
          matches++;
        }
      }
    });
    
    const accuracy = (matches / expectedWords.length) * 100;
    console.log('Accuracy calculated:', accuracy);
    return Math.round(accuracy);
  };

  // Helper function to calculate string similarity
  const calculateSimilarity = (str1, str2) => {
    if (str1.length === 0 || str2.length === 0) return 0;
    
    // Calculate Levenshtein distance
    const matrix = Array(str1.length + 1).fill().map(() => 
      Array(str2.length + 1).fill(0)
    );
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= str2.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    const distance = matrix[str1.length][str2.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
  };

  // Evaluate Assessment
  const handleEvaluate = () => {
    console.log('Evaluating OCR assessment...');
    console.log('Expected answer:', expectedAnswer);
    console.log('OCR result:', ocrResult);
    
    if (!expectedAnswer || !ocrResult) {
      setError('Please provide both expected answer and OCR result');
      return;
    }

    const calculatedAccuracy = calculateAccuracy(expectedAnswer, ocrResult);
    console.log('Setting accuracy:', calculatedAccuracy);
    setAccuracy(calculatedAccuracy);
    setShowAccuracy(true);
    setError('');
  };

  // Save Assessment
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      if (!ocrResult) {
        setError('Please perform OCR before saving');
        return;
      }

      const assessmentData = {
        type: 'ocr',
        expectedAnswer: expectedAnswer,
        ocrResult: ocrResult,
        accuracy: accuracy,
        date: new Date().toISOString()
      };

      console.log('Saving assessment with data:', assessmentData);

      const response = await axios.post(
        `/api/classes/${classId}/students/${studentId}/assessments`,
        assessmentData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Save response:', response.data);

      if (response.status === 201) {
        navigate(`/class/${classId}/student/${studentId}/report`);
      } else {
        setError(response.data.message || 'Failed to save assessment. Please try again.');
      }
    } catch (err) {
      console.error('Error saving assessment:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data.message || 'Failed to save assessment. Please try again.');
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        setError('Failed to save assessment. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">OCR Assessment</h1>
          <button
            onClick={() => navigate(`/class/${classId}/student/${studentId}/assessment`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Options
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Expected Answer Input */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Expected Answer</h2>
          <textarea
            value={expectedAnswer}
            onChange={(e) => setExpectedAnswer(e.target.value)}
            placeholder="Enter the expected answer..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
          />
        </div>

        {/* OCR Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">OCR (Image to Text)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>
            {isProcessing && (
              <div className="text-center py-4">
                <p className="text-gray-600">Processing image...</p>
              </div>
            )}
            <div className="border rounded-md p-4 min-h-[200px]">
              <p className="text-gray-700">{ocrResult || 'OCR result will appear here...'}</p>
            </div>
          </div>
        </div>

        {/* Evaluate Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleEvaluate}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Evaluate Assessment
          </button>
        </div>

        {/* Accuracy Display */}
        {showAccuracy && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Accuracy</h2>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-indigo-600 h-4 rounded-full"
                  style={{ width: `${accuracy}%` }}
                ></div>
              </div>
              <span className="ml-4 text-lg font-semibold">{accuracy.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Save Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default OCRAssessment; 