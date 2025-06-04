import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SAMPLE_QUESTIONS = {
  NUMBER_RECOGNITION: [
    {
      level: 1,
      questions: [
        { question: "What number is this? 15", answer: "15" },
        { question: "What number is this? 8", answer: "8" }
      ]
    },
    {
      level: 2,
      questions: [
        { question: "What number is this? 45", answer: "45" },
        { question: "What number is this? 78", answer: "78" }
      ]
    },
    {
      level: 3,
      questions: [
        { question: "Write this number: seven", answer: "7" },
        { question: "Write this number: twelve", answer: "12" }
      ]
    }
  ],
  BASIC_OPERATIONS: [
    {
      level: 1,
      questions: [
        { question: "What is 5 + 7?", answer: "12" },
        { question: "What is 8 + 9?", answer: "17" }
      ]
    },
    {
      level: 2,
      questions: [
        { question: "What is 15 - 8?", answer: "7" },
        { question: "What is 20 - 12?", answer: "8" }
      ]
    },
    {
      level: 3,
      questions: [
        { question: "What is 6 × 7?", answer: "42" },
        { question: "What is 8 × 9?", answer: "72" }
      ]
    },
    {
      level: 4,
      questions: [
        { question: "What is 56 ÷ 8?", answer: "7" },
        { question: "What is 72 ÷ 9?", answer: "8" }
      ]
    }
  ],
  PATTERNS: [
    {
      level: 1,
      questions: [
        { question: "Complete the pattern: 2, 4, 6, __, 10", answer: "8" },
        { question: "Complete the pattern: 5, 10, 15, __, 25", answer: "20" }
      ]
    },
    {
      level: 2,
      questions: [
        { question: "What comes next: 3, 6, 9, 12, __", answer: "15" },
        { question: "What comes next: 4, 8, 12, 16, __", answer: "20" }
      ]
    },
    {
      level: 3,
      questions: [
        { question: "Is 24 an odd or even number?", answer: "even" },
        { question: "Is 17 an odd or even number?", answer: "odd" }
      ]
    }
  ],
  PLACE_VALUE: [
    {
      level: 1,
      questions: [
        { question: "In 45, what digit is in the tens place?", answer: "4" },
        { question: "In 67, what digit is in the ones place?", answer: "7" }
      ]
    },
    {
      level: 2,
      questions: [
        { question: "In 234, what digit is in the hundreds place?", answer: "2" },
        { question: "In 567, what digit is in the tens place?", answer: "6" }
      ]
    },
    {
      level: 3,
      questions: [
        { question: "Which is greater: 45 or 54?", answer: "54" },
        { question: "Which is smaller: 78 or 87?", answer: "78" }
      ]
    }
  ],
  MONEY: [
    {
      level: 1,
      questions: [
        { question: "How much is a quarter worth?", answer: "25" },
        { question: "How much is a dime worth?", answer: "10" }
      ]
    },
    {
      level: 2,
      questions: [
        { question: "What is the total of 2 quarters and 3 dimes?", answer: "80" },
        { question: "What is the total of 1 quarter and 4 nickels?", answer: "45" }
      ]
    },
    {
      level: 3,
      questions: [
        { question: "If you have $1 and spend 75 cents, how much change do you get?", answer: "25" },
        { question: "If you have $2 and spend $1.35, how much change do you get?", answer: "65" }
      ]
    }
  ]
};

const NUMERACY_CATEGORIES = {
  NUMBER_RECOGNITION: {
    name: 'Number Recognition',
    levels: [
      { name: 'Basic Numbers', description: 'Identify numbers 1-20' },
      { name: 'Advanced Numbers', description: 'Identify numbers 21-100' },
      { name: 'Number Words', description: 'Read numbers in word form' }
    ]
  },
  BASIC_OPERATIONS: {
    name: 'Basic Operations',
    levels: [
      { name: 'Addition', description: 'Single and double digit addition' },
      { name: 'Subtraction', description: 'Single and double digit subtraction' },
      { name: 'Multiplication', description: 'Basic multiplication tables' },
      { name: 'Division', description: 'Simple division problems' }
    ]
  },
  PATTERNS: {
    name: 'Number Patterns',
    levels: [
      { name: 'Skip Counting', description: 'Count by 2s, 5s, and 10s' },
      { name: 'Number Sequences', description: 'Complete number sequences' },
      { name: 'Odd and Even', description: 'Identify odd and even numbers' }
    ]
  },
  PLACE_VALUE: {
    name: 'Place Value',
    levels: [
      { name: 'Ones and Tens', description: 'Understand ones and tens place' },
      { name: 'Hundreds', description: 'Understand hundreds place' },
      { name: 'Comparing Numbers', description: 'Compare numbers using >, <, =' }
    ]
  },
  MONEY: {
    name: 'Money Skills',
    levels: [
      { name: 'Coin Recognition', description: 'Identify coins and their values' },
      { name: 'Counting Money', description: 'Count and add money amounts' },
      { name: 'Making Change', description: 'Calculate change from purchases' }
    ]
  },
  TIME: {
    name: 'Time and Measurement',
    levels: [
      { name: 'Clock Reading', description: 'Read analog and digital clocks' },
      { name: 'Calendar', description: 'Understand calendar concepts' },
      { name: 'Basic Measurement', description: 'Measure length, weight, and capacity' }
    ]
  },
  FRACTIONS: {
    name: 'Fractions',
    levels: [
      { name: 'Basic Fractions', description: 'Identify and compare fractions' },
      { name: 'Fraction Operations', description: 'Add and subtract simple fractions' },
      { name: 'Fraction Problems', description: 'Solve fraction word problems' }
    ]
  },
  GEOMETRY: {
    name: 'Geometry',
    levels: [
      { name: 'Shapes', description: 'Identify basic geometric shapes' },
      { name: 'Properties', description: 'Understand shape properties' },
      { name: 'Area and Perimeter', description: 'Calculate area and perimeter' }
    ]
  },
  DATA: {
    name: 'Data Handling',
    levels: [
      { name: 'Graphs', description: 'Read and interpret simple graphs' },
      { name: 'Statistics', description: 'Calculate mean, median, and mode' },
      { name: 'Probability', description: 'Understand basic probability' }
    ]
  },
  PROBLEM_SOLVING: {
    name: 'Problem Solving',
    levels: [
      { name: 'Word Problems', description: 'Solve mathematical word problems' },
      { name: 'Logical Reasoning', description: 'Solve logical reasoning problems' },
      { name: 'Pattern Recognition', description: 'Identify and extend patterns' }
    ]
  }
};

const NumeracyAssessment = () => {
  const { studentId, classId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', expectedAnswer: '', userAnswer: '' });
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    if (selectedCategory) {
      const categoryQuestions = SAMPLE_QUESTIONS[selectedCategory] || [];
      setQuestions(categoryQuestions);
    }
  }, [selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentLevel(1);
    setShowAddQuestion(false);
    setShowResult(false);
    const categoryQuestions = SAMPLE_QUESTIONS[category] || [];
    setQuestions(categoryQuestions);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question || !newQuestion.expectedAnswer) {
      setError('Please provide both question and expected answer');
      return;
    }

    // Save the user's answer with the question
    const updatedQuestions = [...questions];
    const levelIndex = updatedQuestions.findIndex(q => q.level === currentLevel);
    const questionObj = {
      question: newQuestion.question,
      answer: newQuestion.expectedAnswer,
      userAnswer: newQuestion.userAnswer || ''
    };
    if (levelIndex === -1) {
      updatedQuestions.push({
        level: currentLevel,
        questions: [questionObj]
      });
    } else {
      updatedQuestions[levelIndex].questions.push(questionObj);
    }

    setQuestions(updatedQuestions);
    setNewQuestion({ question: '', expectedAnswer: '', userAnswer: '' });
    setShowAddQuestion(false);
    setError('');
  };

  const handleSubmitAnswer = () => {
    if (!newQuestion.userAnswer) {
      setError('Please provide your answer');
      return;
    }

    const isAnswerCorrect = newQuestion.userAnswer.trim().toLowerCase() === 
                          newQuestion.expectedAnswer.trim().toLowerCase();
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      if (!selectedCategory || !questions.length) {
        setError('Please complete the assessment before saving');
        return;
      }

      // Calculate score based on correct answers
      const currentLevelQuestions = questions.find(q => q.level === currentLevel)?.questions || [];
      const totalQuestions = currentLevelQuestions.length;
      const correctAnswers = currentLevelQuestions.filter(q => 
        q.userAnswer && q.userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()
      ).length;
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      // Create category progress object
      const categoryProgress = {
        completed: true,
        accuracy: score
      };

      // Map category names to progress field names
      const categoryMap = {
        'NUMBER_RECOGNITION': 'numberRecognition',
        'BASIC_OPERATIONS': 'basicOperations',
        'PATTERNS': 'patterns',
        'PLACE_VALUE': 'placeValue',
        'MONEY': 'money',
        'TIME': 'time',
        'FRACTIONS': 'fractions',
        'GEOMETRY': 'geometry',
        'DATA': 'data',
        'PROBLEM_SOLVING': 'problemSolving'
      };

      // Create progress object with only the relevant category
      const progress = {
        [categoryMap[selectedCategory]]: categoryProgress
      };

      // Use all user answers for transcript
      const userAnswers = currentLevelQuestions.map(q => q.userAnswer || '');

      const assessmentData = {
        type: 'numeracy',
        category: selectedCategory,
        level: currentLevel,
        score: score,
        expectedAnswer: currentLevelQuestions.map(q => q.answer).join(', '),
        transcript: userAnswers.join(', '),
        accuracy: score,
        date: new Date().toISOString(),
        progress: progress
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Numeracy Assessment</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(NUMERACY_CATEGORIES).map(([key, category]) => (
            <div
              key={key}
              onClick={() => handleCategorySelect(key)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              <p className="text-gray-600">{category.levels[0].description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {NUMERACY_CATEGORIES[selectedCategory].name} - Level {currentLevel}
              </h2>
              
              {/* Sample Questions Display */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Sample Questions</h3>
                {questions.find(q => q.level === currentLevel)?.questions.map((q, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-md">
                    <p className="font-medium">{q.question}</p>
                  </div>
                ))}
              </div>

              {/* Add Question Button */}
              {!showAddQuestion && (
                <button
                  onClick={() => setShowAddQuestion(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-6"
                >
                  Add New Question
                </button>
              )}

              {/* Add Question Form */}
              {showAddQuestion && (
                <div className="mb-6 p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-4">Add New Question</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Question</label>
                      <input
                        type="text"
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                        className="mt-1 w-full p-2 border rounded-md"
                        placeholder="Enter question"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expected Answer</label>
                      <input
                        type="password"
                        value={newQuestion.expectedAnswer}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, expectedAnswer: e.target.value }))}
                        className="mt-1 w-full p-2 border rounded-md"
                        placeholder="Enter expected answer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Your Answer</label>
                      <input
                        type="text"
                        value={newQuestion.userAnswer}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, userAnswer: e.target.value }))}
                        className="mt-1 w-full p-2 border rounded-md"
                        placeholder="Enter your answer"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSubmitAnswer}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Submit Answer
                      </button>
                      <button
                        onClick={handleAddQuestion}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Result Display */}
              {showResult && (
                <div className={`mt-4 p-4 rounded-md ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className="font-medium">
                    {isCorrect ? 'Correct!' : 'Incorrect!'}
                  </p>
                  <p className="mt-2">
                    The correct answer is: {newQuestion.expectedAnswer}
                  </p>
                </div>
              )}

              {/* Save Assessment Button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 mt-6"
              >
                {isSaving ? 'Saving...' : 'Save Assessment'}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumeracyAssessment; 