import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await axios.get('/api/classes', { withCredentials: true });
      setClasses(res.data);
    } catch (err) {
      setError('Failed to load classes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/classes', { name: newClassName }, { withCredentials: true });
      setClasses([...classes, res.data]);
      setNewClassName('');
    } catch (err) {
      setError('Failed to create class');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Classes</h1>
        
        {/* Create New Class Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Class</h2>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Enter class name"
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Create Class
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Classes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Link
              key={classItem._id}
              to={`/class/${classItem._id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{classItem.name}</h3>
              <p className="text-gray-600">
                {classItem.students ? `${classItem.students.length} students` : 'No students yet'}
              </p>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {classes.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600">No classes created yet. Create your first class above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassList; 