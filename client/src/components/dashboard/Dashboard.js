import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAssessments: 0,
    averageAccuracy: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, statsRes] = await Promise.all([
          axios.get('/api/classes', { withCredentials: true }),
          axios.get('/api/stats', { withCredentials: true })
        ]);

        setClasses(classesRes.data);
        setStats(statsRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to fetch data');
        }
      }
    };

    fetchData();
  }, [navigate]);

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Assessment Accuracy',
        data: [65, 70, 75, 80],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Total Students</h2>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Total Assessments</h2>
          <p className="text-3xl font-bold">{stats.totalAssessments}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Average Accuracy</h2>
          <p className="text-3xl font-bold">{stats.averageAccuracy}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assessment Progress</h2>
          <Line data={chartData} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Classes</h2>
          <div className="space-y-4">
            {classes.map(classItem => (
              <div
                key={classItem._id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/classes/${classItem._id}`)}
              >
                <h3 className="font-semibold">{classItem.name}</h3>
                <p className="text-gray-600">{classItem.students?.length || 0} students</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 