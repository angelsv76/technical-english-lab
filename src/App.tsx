/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppState } from './hooks/useAppState';
import { useWeeks } from './hooks/useWeeks';
import { StudentForm } from './components/StudentForm';
import { Dashboard } from './components/Dashboard';
import { WeekPage } from './components/WeekPage';
import { GlossaryPage } from './components/GlossaryPage';
import { TeacherLogin } from './pages/TeacherLogin';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeacherRoute } from './components/TeacherRoute';
import { PortalSelection } from './components/PortalSelection';
import { AITutor } from './components/AITutor';
import { HiddenTeacherAccess } from './components/HiddenTeacherAccess';
import { Footer } from './components/Footer';
import { useState } from 'react';

export default function App() {
  const { 
    student, 
    setStudent, 
    progress, 
    updateProgress, 
    glossary, 
    addToGlossary, 
    markWordCorrect,
    markWordIncorrect,
    logout 
  } = useAppState();

  const { weeks, updateWeek, toggleWeek } = useWeeks();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleStudentLogin = (data: any) => {
    setStudent(data);
    navigate('/student');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSelectWeek = (week: number) => {
    setSelectedWeek(week);
    addToGlossary(week);
    navigate(`/student/week/${week}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <HiddenTeacherAccess />
      
      <div className="flex-1">
        <Routes>
          {/* Portal Selection */}
          <Route path="/" element={<PortalSelection />} />

          {/* Student Routes */}
          <Route path="/student/login" element={
            student ? <Navigate to="/student" replace /> : <StudentForm onLogin={handleStudentLogin} />
          } />
          
          <Route path="/student" element={
            student ? (
              <Dashboard 
                student={student}
                progress={progress}
                glossary={glossary}
                weeks={weeks}
                onSelectWeek={handleSelectWeek}
                onOpenGlossary={() => navigate('/student/glossary')}
                onLogout={handleLogout}
              />
            ) : <Navigate to="/student/login" replace />
          } />

          <Route path="/student/week/:weekId" element={
            student ? (
              <WeekPageWrapper 
                weeks={weeks}
                student={student}
                progress={progress}
                glossary={glossary}
                onComplete={updateProgress}
                onWordCorrect={markWordCorrect}
                onWordIncorrect={markWordIncorrect}
                onBack={() => navigate('/student')}
              />
            ) : <Navigate to="/student/login" replace />
          } />

          <Route path="/student/glossary" element={
            student ? (
              <GlossaryPage 
                glossary={glossary}
                onBack={() => navigate('/student')}
              />
            ) : <Navigate to="/student/login" replace />
          } />

          {/* Teacher Routes */}
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/teacher" element={
            <TeacherRoute>
              <TeacherDashboard />
            </TeacherRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />

      {/* AI Tutor - Only show if student is logged in and on student routes */}
      {student && window.location.pathname.startsWith('/student') && (
        <AITutor 
          context={selectedWeek ? `Semana ${selectedWeek}: ${weeks.find(w => w.week === selectedWeek)?.title}` : 'Dashboard Principal'} 
        />
      )}
    </div>
  );
}

// Helper wrapper for WeekPage to handle params
import { useParams } from 'react-router-dom';
const WeekPageWrapper = ({ weeks, student, progress, glossary, onComplete, onWordCorrect, onWordIncorrect, onBack }: any) => {
  const { weekId } = useParams();
  const weekNum = parseInt(weekId || '0');
  const weekData = weeks.find((w: any) => w.week === weekNum);
  const weekProgress = progress.find((p: any) => p.week === weekNum);

  if (!weekData) return <Navigate to="/student" replace />;

  return (
    <WeekPage 
      weekData={weekData}
      student={student}
      progress={weekProgress}
      glossary={glossary}
      onBack={onBack}
      onComplete={(score: number) => onComplete(weekNum, score)}
      onWordCorrect={onWordCorrect}
      onWordIncorrect={onWordIncorrect}
    />
  );
};
