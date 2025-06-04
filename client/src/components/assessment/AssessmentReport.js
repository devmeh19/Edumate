import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const AssessmentReport = () => {
  const { studentId, classId } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, classRes] = await Promise.all([
          axios.get(`/api/students/${studentId}`, { withCredentials: true }),
          axios.get(`/api/classes/${classId}`, { withCredentials: true })
        ]);
        console.log('Student Data:', studentRes.data);
        console.log('Class Data:', classRes.data);
        setStudentData(studentRes.data);
        setClassData(classRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId, classId]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;
  if (!studentData || !classData) return <div className="text-center p-8">No data found</div>;

  // Calculate average accuracy for the student
  const studentAssessments = studentData.assessments || [];
  const studentAverageAccuracy = studentAssessments.length > 0
    ? studentAssessments.reduce((acc, curr) => acc + curr.accuracy, 0) / studentAssessments.length
    : 0;

  // Calculate class average accuracy
  const allStudentsAssessments = classData.students.flatMap(student => student.assessments || []);
  const classAverageAccuracy = allStudentsAssessments.length > 0
    ? allStudentsAssessments.reduce((acc, curr) => acc + curr.accuracy, 0) / allStudentsAssessments.length
    : 0;

  // Prepare data for pie chart (Assessment Type Distribution)
  const assessmentTypes = studentAssessments.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(assessmentTypes),
    datasets: [{
      data: Object.values(assessmentTypes),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    }],
  };

  // Prepare data for bar chart (Accuracy Comparison)
  const barData = {
    labels: ['Student Average', 'Class Average'],
    datasets: [{
      label: 'Accuracy (%)',
      data: [studentAverageAccuracy, classAverageAccuracy],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    }],
  };

  const renderAssessmentDetails = (assessment) => {
    if (assessment.type === 'level-based') {
      const currentLevel = assessment.currentLevel || 1;
      const levels = ['Story', 'Poem', 'Sentence', 'Words', 'Letter'];
      const currentLevelName = levels[currentLevel - 1];
      const progress = assessment.progress || {};
      
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Level Progress</h3>
            <div className="space-y-3">
              {levels.map((level, index) => {
                const levelProgress = progress[level.toLowerCase()] || { completed: false, accuracy: 0 };
                const isCurrentLevel = index + 1 === currentLevel;
                const isCompleted = levelProgress.completed;
                
                return (
                  <div
                    key={level}
                    className={`p-3 rounded-lg border ${
                      isCurrentLevel
                        ? 'border-indigo-500 bg-indigo-50'
                        : isCompleted
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{level}</span>
                        {isCurrentLevel && !isCompleted && (
                          <span className="ml-2 text-sm text-indigo-600">(Current Level)</span>
                        )}
                      </div>
                      <div className="text-right">
                        {levelProgress.accuracy > 0 && (
                          <span className="text-sm">
                            Accuracy: {levelProgress.accuracy}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Current Level Details</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">Current Level</h4>
                <p className="text-gray-600">{currentLevelName}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Expected Answer</h4>
                <p className="text-gray-600">{assessment.expectedAnswer}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Student's Response</h4>
                <p className="text-gray-600">{assessment.transcript}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Accuracy</h4>
                <p className="text-gray-600">{assessment.accuracy}%</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700">Expected Answer</h4>
          <p className="text-gray-600">{assessment.expectedAnswer}</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-700">Student's Response</h4>
          <p className="text-gray-600">
            {assessment.type === 'speech' ? assessment.transcript : assessment.ocrResult}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-700">Accuracy</h4>
          <p className="text-gray-600">{assessment.accuracy}%</p>
        </div>
      </div>
    );
  };

  const calculateDetailedStats = () => {
    const stats = {
      totalAssessments: studentAssessments.length,
      averageAccuracy: studentAverageAccuracy,
      classAverage: classAverageAccuracy,
      levelBasedStats: {
        story: { count: 0, totalAccuracy: 0, average: 0 },
        poem: { count: 0, totalAccuracy: 0, average: 0 },
        sentence: { count: 0, totalAccuracy: 0, average: 0 },
        words: { count: 0, totalAccuracy: 0, average: 0 },
        letter: { count: 0, totalAccuracy: 0, average: 0 }
      },
      numeracyStats: {
        numberRecognition: { count: 0, totalAccuracy: 0, average: 0 },
        basicOperations: { count: 0, totalAccuracy: 0, average: 0 },
        patterns: { count: 0, totalAccuracy: 0, average: 0 },
        placeValue: { count: 0, totalAccuracy: 0, average: 0 },
        money: { count: 0, totalAccuracy: 0, average: 0 },
        time: { count: 0, totalAccuracy: 0, average: 0 },
        fractions: { count: 0, totalAccuracy: 0, average: 0 },
        geometry: { count: 0, totalAccuracy: 0, average: 0 },
        data: { count: 0, totalAccuracy: 0, average: 0 },
        problemSolving: { count: 0, totalAccuracy: 0, average: 0 }
      },
      typeDistribution: {
        speech: 0,
        ocr: 0,
        'level-based': 0,
        numeracy: 0
      },
      recentProgress: [],
      focusAreas: []
    };

    // Calculate level-based and numeracy statistics
    studentAssessments.forEach(assessment => {
      stats.typeDistribution[assessment.type] = (stats.typeDistribution[assessment.type] || 0) + 1;

      if (assessment.type === 'level-based' && assessment.progress) {
        Object.entries(assessment.progress).forEach(([level, data]) => {
          if (data.completed) {
            stats.levelBasedStats[level].count++;
            stats.levelBasedStats[level].totalAccuracy += data.accuracy;
          }
        });
      }

      if (assessment.type === 'numeracy' && assessment.numeracyProgress) {
        Object.entries(assessment.numeracyProgress).forEach(([category, data]) => {
          if (data.completed) {
            stats.numeracyStats[category].count++;
            stats.numeracyStats[category].totalAccuracy += data.accuracy;
          }
        });
      }
    });

    // Calculate averages for each level and numeracy category
    Object.keys(stats.levelBasedStats).forEach(level => {
      const levelStats = stats.levelBasedStats[level];
      levelStats.average = levelStats.count > 0 
        ? levelStats.totalAccuracy / levelStats.count 
        : 0;
    });

    Object.keys(stats.numeracyStats).forEach(category => {
      const categoryStats = stats.numeracyStats[category];
      categoryStats.average = categoryStats.count > 0 
        ? categoryStats.totalAccuracy / categoryStats.count 
        : 0;
    });

    // Calculate recent progress (last 5 assessments)
    const recentAssessments = studentAssessments.slice(-5);
    stats.recentProgress = recentAssessments.map(assessment => ({
      date: new Date(assessment.date).toLocaleDateString(),
      type: assessment.type,
      accuracy: assessment.accuracy,
      levelName: assessment.levelName || assessment.category || null
    }));

    // Identify focus areas
    const lowestLevel = Object.entries(stats.levelBasedStats)
      .reduce((lowest, [level, stats]) => 
        stats.average < lowest.average ? { level, ...stats } : lowest,
        { level: '', average: 100 }
      );

    const lowestNumeracy = Object.entries(stats.numeracyStats)
      .reduce((lowest, [category, stats]) => 
        stats.average < lowest.average ? { category, ...stats } : lowest,
        { category: '', average: 100 }
      );

    if (lowestLevel.average < 50) {
      stats.focusAreas.push({
        level: lowestLevel.level,
        message: `Needs improvement in ${lowestLevel.level} level (Average: ${lowestLevel.average.toFixed(1)}%)`
      });
    }

    if (lowestNumeracy.average < 50) {
      stats.focusAreas.push({
        category: lowestNumeracy.category,
        message: `Needs improvement in ${lowestNumeracy.category} (Average: ${lowestNumeracy.average.toFixed(1)}%)`
      });
    }

    return stats;
  };

  const stats = calculateDetailedStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Assessment Report</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Student Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Student Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {studentData.name || 'N/A'}</p>
            <p><span className="font-medium">Class:</span> {classData.name || 'N/A'}</p>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Total Assessments: {stats.totalAssessments}</p>
              <p className="font-medium">Student Average: {stats.averageAccuracy.toFixed(1)}%</p>
              <p className="font-medium">Class Average: {stats.classAverage.toFixed(1)}%</p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {stats.averageAccuracy > stats.classAverage 
                    ? 'Performing above class average'
                    : stats.averageAccuracy < stats.classAverage
                    ? 'Performing below class average'
                    : 'Performing at class average'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Level-Based Progress */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Level-Based Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(stats.levelBasedStats).map(([level, data]) => (
              <div key={level} className="p-4 border rounded-lg">
                <h3 className="font-medium capitalize mb-2">{level}</h3>
                <p className="text-sm">Completed: {data.count}</p>
                <p className="text-sm">Average: {data.average.toFixed(1)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${data.average}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Numeracy Progress */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Numeracy Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(stats.numeracyStats).map(([category, data]) => (
              <div key={category} className="p-4 border rounded-lg">
                <h3 className="font-medium capitalize mb-2">{category.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <p className="text-sm">Completed: {data.count}</p>
                <p className="text-sm">Average: {data.average.toFixed(1)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${data.average}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        {stats.focusAreas.length > 0 && (
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Areas for Improvement</h2>
            <div className="space-y-2">
              {stats.focusAreas.map((area, index) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">{area.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Progress */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Progress</h2>
          <div className="space-y-4">
            {stats.recentProgress.map((progress, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {progress.type === 'level-based' 
                        ? `${progress.levelName} Level`
                        : progress.type.charAt(0).toUpperCase() + progress.type.slice(1)}
                    </p>
                    <p className="text-sm text-gray-600">{progress.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Accuracy: {progress.accuracy}%</p>
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mt-1">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${progress.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Assessment Type Distribution</h2>
          <div className="h-64">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Accuracy Comparison */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Accuracy Comparison</h2>
          <div className="h-64">
            <Bar
              data={barData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReport; 