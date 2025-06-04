import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssessmentHistory = () => {
  const { studentId, classId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(`/api/students/${studentId}`, { withCredentials: true });
        console.log('Student Data:', res.data);
        setStudent(res.data);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to fetch student data');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentId]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;
  if (!student) return <div className="text-center p-8">No student found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Assessment History</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate(`/class/${classId}/student/${studentId}/report`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            View Detailed Report
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Student Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <p className="font-medium">Name: {student.name || 'N/A'}</p>
            <p className="font-medium">Roll No: {student.rollNo || 'N/A'}</p>
            <p className="font-medium">Gender: {student.gender || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium">Age: {student.age || 'N/A'}</p>
            <p className="font-medium">Email: {student.email || 'N/A'}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Assessments</h2>
        {student.assessments && student.assessments.length > 0 ? (
          <div className="space-y-4">
            {student.assessments.map((assessment, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">Type: {assessment.type}</p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(assessment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Accuracy: {assessment.accuracy}%</p>
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mt-1">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${assessment.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-medium">Expected Answer:</p>
                  <p className="text-gray-700">{assessment.expectedAnswer}</p>
                </div>
                <div className="mt-2">
                  <p className="font-medium">Student's Answer:</p>
                  <p className="text-gray-700">
                    {assessment.studentAnswer || assessment.transcript || assessment.ocrResult || 'No answer provided'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No assessments found for this student.</p>
        )}
      </div>
    </div>
  );
};

export default AssessmentHistory; 