import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import ClassList from './components/dashboard/ClassList';
import ClassDetail from './components/dashboard/ClassDetail';
import AssessmentOptions from './components/assessment/AssessmentOptions';
import SpeechAssessment from './components/assessment/SpeechAssessment';
import OCRAssessment from './components/assessment/OCRAssessment';
import LevelBasedAssessment from './components/assessment/LevelBasedAssessment';
import AssessmentHistory from './components/assessment/AssessmentHistory';
import AssessmentReport from './components/assessment/AssessmentReport';
import NumeracyAssessment from './components/assessment/NumeracyAssessment';
import PrivateRoute from './components/routing/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <PrivateRoute>
                <ClassList />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:classId"
            element={
              <PrivateRoute>
                <ClassDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:classId/student/:studentId/assessment"
            element={
              <PrivateRoute>
                <AssessmentOptions />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:classId/student/:studentId/assessment/speech"
            element={
              <PrivateRoute>
                <SpeechAssessment />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:classId/student/:studentId/assessment/ocr"
            element={
              <PrivateRoute>
                <OCRAssessment />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:classId/student/:studentId/assessment/level-based"
            element={
              <PrivateRoute>
                <LevelBasedAssessment />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:classId/student/:studentId/assessment/numeracy"
            element={
              <PrivateRoute>
                <NumeracyAssessment />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:classId/student/:studentId/assessments"
            element={
              <PrivateRoute>
                <AssessmentHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:classId/student/:studentId/report"
            element={
              <PrivateRoute>
                <AssessmentReport />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 