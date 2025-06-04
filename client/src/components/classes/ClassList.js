import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClassList = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        };
        const res = await axios.get('/api/classes', config);
        setClasses(res.data);
      } catch (err) {
        console.error(err);
        if (err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchClasses();
  }, [navigate]);

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };
      const res = await axios.post(
        '/api/classes',
        { name: newClassName },
        config
      );
      setClasses([...classes, res.data]);
      setNewClassName('');
      setError('');
    } catch (err) {
      setError(err.response.data.msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Create New Class Form */}
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create New Class
              </h3>
              <div className="mt-5">
                <form onSubmit={onSubmit} className="sm:flex sm:items-center">
                  <div className="w-full sm:max-w-xs">
                    <label htmlFor="className" className="sr-only">
                      Class Name
                    </label>
                    <input
                      type="text"
                      name="className"
                      id="className"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter class name"
                      value={newClassName}
                      onChange={e => setNewClassName(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create
                  </button>
                </form>
                {error && (
                  <div className="mt-2 text-sm text-red-600">{error}</div>
                )}
              </div>
            </div>
          </div>

          {/* Classes List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {classes.map(classItem => (
                <li key={classItem._id}>
                  <a
                    href={`/classes/${classItem._id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {classItem.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {classItem.students.length} Students
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

export default ClassList; 