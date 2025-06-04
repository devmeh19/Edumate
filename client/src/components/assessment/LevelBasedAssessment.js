import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LevelBasedAssessment = () => {
  const { classId, studentId } = useParams();
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [showAccuracy, setShowAccuracy] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState({
    story: { completed: false, accuracy: 0 },
    poem: { completed: false, accuracy: 0 },
    sentence: { completed: false, accuracy: 0 },
    words: { completed: false, accuracy: 0 },
    letter: { completed: false, accuracy: 0 }
  });
  const recognitionRef = useRef(null);

  const levels = [
    { id: 1, name: 'Story', description: 'Read a short story' },
    { id: 2, name: 'Poem', description: 'Recite a poem' },
    { id: 3, name: 'Sentence', description: 'Read a sentence' },
    { id: 4, name: 'Words', description: 'Read individual words' },
    { id: 5, name: 'Letter', description: 'Read individual letters' }
  ];

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
        // Check for partial matches
        const partialMatch = actualWords.some(actualWord => {
          const similarity = calculateSimilarity(expectedWord, actualWord);
          return similarity > 0.8;
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

  const calculateSimilarity = (str1, str2) => {
    if (str1.length === 0 || str2.length === 0) return 0;
    
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
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const distance = matrix[str1.length][str2.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
  };

  const handleEvaluate = () => {
    console.log('Evaluating assessment...');
    console.log('Expected Answer:', expectedAnswer);
    console.log('Transcript:', transcript);
    
    if (!expectedAnswer || !transcript) {
      setError('Please provide both expected answer and student response');
      return;
    }

    const calculatedAccuracy = calculateAccuracy(expectedAnswer, transcript);
    console.log('Setting accuracy:', calculatedAccuracy);
    setAccuracy(calculatedAccuracy);
    setShowAccuracy(true);
    setError('');

    // Update progress if accuracy is above threshold
    if (calculatedAccuracy >= 33) {
      const levelName = levels[currentLevel - 1].name.toLowerCase();
      setProgress(prev => ({
        ...prev,
        [levelName]: { completed: true, accuracy: calculatedAccuracy }
      }));

      // Unlock next level if available
      if (currentLevel < levels.length) {
        setCurrentLevel(prev => prev + 1);
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      if (!currentLevel || !progress) {
        setError('Please complete the assessment before saving');
        return;
      }

      const assessmentData = {
        type: 'level-based',
        expectedAnswer: expectedAnswer,
        transcript: transcript,
        accuracy: accuracy,
        date: new Date().toISOString(),
        currentLevel: currentLevel,
        levelName: levels[currentLevel - 1].name,
        levelNumber: currentLevel,
        progress: {
          story: progress.story || { completed: false, accuracy: 0 },
          poem: progress.poem || { completed: false, accuracy: 0 },
          sentence: progress.sentence || { completed: false, accuracy: 0 },
          words: progress.words || { completed: false, accuracy: 0 },
          letter: progress.letter || { completed: false, accuracy: 0 }
        }
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
          <h1 className="text-3xl font-bold">Level-Based Assessment</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Level Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Level Progress</h2>
          <div className="space-y-4">
            {levels.map((level) => (
              <div
                key={level.id}
                className={`p-4 rounded-lg border ${
                  level.id === currentLevel
                    ? 'border-indigo-500 bg-indigo-50'
                    : level.id < currentLevel
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{level.name}</h3>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </div>
                  <div className="text-right">
                    {level.id < currentLevel ? (
                      <span className="text-green-600">Completed</span>
                    ) : level.id === currentLevel ? (
                      <span className="text-indigo-600">Current Level</span>
                    ) : (
                      <span className="text-gray-500">Locked</span>
                    )}
                    {progress[level.name.toLowerCase()]?.accuracy > 0 && (
                      <div className="text-sm">
                        Accuracy: {progress[level.name.toLowerCase()].accuracy}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Level Assessment */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Level {currentLevel}: {levels[currentLevel - 1].name}
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Answer
            </label>
            <textarea
              value={expectedAnswer}
              onChange={(e) => setExpectedAnswer(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="3"
              placeholder="Enter the expected answer"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student's Response
            </label>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
                className={`px-4 py-2 rounded-md ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              {isRecording && (
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-gray-600">Recording...</span>
                </div>
              )}
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="3"
              placeholder="Student's response will appear here"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handleEvaluate}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Evaluate Assessment
            </button>
            {showAccuracy && (
              <div className="text-right">
                <p className="text-lg font-medium">Accuracy: {accuracy}%</p>
                <div className="w-32 bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${accuracy}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showAccuracy && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Assessment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelBasedAssessment; 