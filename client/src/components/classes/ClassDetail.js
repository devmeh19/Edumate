import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        };
        const res = await axios.get(`/api/classes/${classId}`, config);
        setClassData(res.data);
      } catch (err) {
        console.error(err);
        if (err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchClassData();
  }, [classId, navigate]);

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };
      const res = await axios.post(
        '/api/students',
        { name: newStudentName, classId },
        config
      );
      setClassData({
        ...classData,
        students: [...classData.students, res.data]
      });
      setNewStudentName('');
      setError('');
    } catch (err) {
      setError(err.response.data.msg);
    }
  };

  if (!classData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Class Header */}
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {classData.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {classData.students.length} Students
              </p>
            </div>
          </div>

          {/* Add Student Form */}
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Add New Student
              </h3>
              <div className="mt-5">
                <form onSubmit={onSubmit} className="sm:flex sm:items-center">
                  <div className="w-full sm:max-w-xs">
                    <label htmlFor="studentName" className="sr-only">
                      Student Name
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      id="studentName"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter student name"
                      value={newStudentName}
                      onChange={e => setNewStudentName(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add Student
                  </button>
                </form>
                {error && (
                  <div className="mt-2 text-sm text-red-600">{error}</div>
                )}
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {classData.students.map(student => (
                <li key={student._id}>
                  <a
                    href={`/assessment/${student._id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {student.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {student.assessments.length} Assessments
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetail; 