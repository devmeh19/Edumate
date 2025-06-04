import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Tesseract from 'tesseract.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StudentAssessment = () => {
  const { classId, studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [ocrResult, setOcrResult] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
  const [accuracy, setAccuracy] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [assessmentType, setAssessmentType] = useState('speech'); // 'speech' or 'ocr'
  const [showAccuracy, setShowAccuracy] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await axios.get(`/api/students/${studentId}`, { withCredentials: true });
        setStudent(res.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load student data');
        }
      }
    };

    fetchStudentData();
  }, [studentId, navigate]);

  // Speech Recognition Setup
  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognition.onerror = (event) => {
        setError('Speech recognition error: ' + event.error);
      };

      recognition.start();
      setIsRecording(true);
    } else {
      setError('Speech recognition is not supported in your browser');
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

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

  // Simple string comparison for accuracy
  const calculateAccuracy = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    // Convert to lowercase and remove spaces
    const s1 = str1.toLowerCase().replace(/\s+/g, '');
    const s2 = str2.toLowerCase().replace(/\s+/g, '');
    
    // Count matching characters
    let matches = 0;
    const minLength = Math.min(s1.length, s2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (s1[i] === s2[i]) matches++;
    }
    
    // Calculate percentage
    return (matches / Math.max(s1.length, s2.length)) * 100;
  };

  // Evaluate Assessment
  const handleEvaluate = () => {
    // Get the student's response based on assessment type
    const studentResponse = assessmentType === 'speech' ? transcript : ocrResult;
    
    // Basic validation
    if (!expectedAnswer) {
      setError('Please enter the expected answer');
      return;
    }
    
    if (!studentResponse) {
      setError(`Please provide ${assessmentType === 'speech' ? 'speech' : 'OCR'} input`);
      return;
    }

    // Calculate and set accuracy
    const newAccuracy = calculateAccuracy(studentResponse, expectedAnswer);
    setAccuracy(newAccuracy);
    setError(''); // Clear any errors
  };

  // Save Assessment
  const handleSave = async () => {
    if (!expectedAnswer) {
      setError('Please provide the expected answer');
      return;
    }

    if (accuracy === 0) {
      setError('Please evaluate the assessment before saving');
      return;
    }

    try {
      const assessmentData = {
        type: assessmentType,
        expectedAnswer,
        accuracy,
        date: new Date()
      };

      if (assessmentType === 'speech') {
        assessmentData.transcript = transcript;
      } else {
        assessmentData.ocrResult = ocrResult;
      }

      await axios.post(
        `/api/classes/${classId}/students/${studentId}/assessment`,
        assessmentData,
        { withCredentials: true }
      );
      
      alert('Assessment saved successfully!');
      navigate(`/class/${classId}`);
    } catch (err) {
      setError('Failed to save assessment: ' + (err.response?.data?.msg || err.message));
    }
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  const chartData = {
    labels: student.assessments.map(a => new Date(a.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Assessment Accuracy',
        data: student.assessments.map(a => a.accuracy),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Student Assessment</h1>
          <button
            onClick={() => navigate(`/class/${classId}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Class
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Assessment Type Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Assessment Type</h2>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="speech"
                checked={assessmentType === 'speech'}
                onChange={(e) => setAssessmentType(e.target.value)}
                className="mr-2"
              />
              Speech to Text
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="ocr"
                checked={assessmentType === 'ocr'}
                onChange={(e) => setAssessmentType(e.target.value)}
                className="mr-2"
              />
              OCR (Image to Text)
            </label>
          </div>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Speech to Text Section */}
          <div className={`bg-white rounded-lg shadow-md p-6 ${assessmentType === 'ocr' ? 'opacity-50' : ''}`}>
            <h2 className="text-xl font-semibold mb-4">Speech to Text</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
                  disabled={assessmentType === 'ocr'}
                  className={`px-4 py-2 rounded-md ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white ${assessmentType === 'ocr' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
              </div>
              <div className="border rounded-md p-4 min-h-[200px]">
                <p className="text-gray-700">{transcript || 'Speech transcript will appear here...'}</p>
              </div>
            </div>
          </div>

          {/* OCR Section */}
          <div className={`bg-white rounded-lg shadow-md p-6 ${assessmentType === 'speech' ? 'opacity-50' : ''}`}>
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
                  disabled={assessmentType === 'speech'}
                  className={`block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100 ${assessmentType === 'speech' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        {accuracy > 0 && (
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

export default StudentAssessment; 