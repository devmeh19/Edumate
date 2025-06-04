import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AssessmentOptions = () => {
  const { classId, studentId } = useParams();
  const navigate = useNavigate();

  const handleOptionSelect = (type) => {
    navigate(`/class/${classId}/student/${studentId}/assessment/${type}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Choose Assessment Type</h1>
          <button
            onClick={() => navigate(`/class/${classId}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Class
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => handleOptionSelect('speech')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Speech-to-Text</h2>
            <p className="text-gray-600">
              Record student's speech and convert it to text for assessment
            </p>
          </div>

          <div
            onClick={() => handleOptionSelect('ocr')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">OCR Assessment</h2>
            <p className="text-gray-600">
              Upload an image of student's written work for assessment
            </p>
          </div>

          <div
            onClick={() => handleOptionSelect('level-based')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Level-Based Assessment</h2>
            <p className="text-gray-600">
              Progressive assessment with 5 levels of increasing difficulty
            </p>
          </div>

          <div
            onClick={() => handleOptionSelect('numeracy')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Numeracy Assessment</h2>
            <p className="text-gray-600">
              Comprehensive numeracy skills assessment with multiple categories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentOptions; 