import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNo: '',
    gender: 'male',
    age: '',
    email: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadClassData();
  }, [classId]);

  const loadClassData = async () => {
    try {
      const res = await axios.get(`/api/classes/${classId}`, { withCredentials: true });
      setClassData(res.data);
    } catch (err) {
      setError('Failed to load class data');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `/api/classes/${classId}/students`,
        newStudent,
        { withCredentials: true }
      );
      setClassData(res.data);
      setNewStudent({
        name: '',
        rollNo: '',
        gender: 'male',
        age: '',
        email: ''
      });
    } catch (err) {
      setError('Failed to add student');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      const res = await axios.delete(
        `/api/classes/${classId}/students/${studentId}`,
        { withCredentials: true }
      );
      setClassData(res.data);
    } catch (err) {
      setError('Failed to remove student');
    }
  };

  const handleStartAssessment = (studentId) => {
    navigate(`/class/${classId}/student/${studentId}/assessment`);
  };

  const handleViewAssessments = (studentId) => {
    navigate(`/class/${classId}/student/${studentId}/assessments`);
  };

  if (!classData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{classData.name}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Classes
          </button>
        </div>

        {/* Add Student Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="Enter student name"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={newStudent.rollNo}
                  onChange={(e) => setNewStudent({...newStudent, rollNo: e.target.value})}
                  placeholder="Enter roll number"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={newStudent.gender}
                  onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={newStudent.age}
                  onChange={(e) => setNewStudent({...newStudent, age: e.target.value})}
                  placeholder="Enter age"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  placeholder="Enter email"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Add Student
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Students</h2>
          </div>
          <div className="divide-y">
            {classData.students && classData.students.length > 0 ? (
              classData.students.map((student) => (
                <div
                  key={student._id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <span className="text-lg">{student.name}</span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleStartAssessment(student._id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Start Assessment
                    </button>
                    <button
                      onClick={() => handleViewAssessments(student._id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      View Assessments
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-gray-600">
                No students in this class yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetail; 