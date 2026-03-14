import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

export const TeacherRoute: React.FC<Props> = ({ children }) => {
  const isTeacherLoggedIn = localStorage.getItem('teacherLoggedIn') === 'true';

  if (!isTeacherLoggedIn) {
    return <Navigate to="/teacher/login" replace />;
  }

  return <>{children}</>;
};
