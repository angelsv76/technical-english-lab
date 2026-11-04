import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isTeacherSession } from '../services/authService';

interface Props {
  children: React.ReactNode;
}

export const TeacherRoute: React.FC<Props> = ({ children }) => {
  const [status, setStatus] = useState<'checking' | 'ok' | 'denied'>('checking');

  useEffect(() => {
    let active = true;
    isTeacherSession()
      .then(ok => { if (active) setStatus(ok ? 'ok' : 'denied'); })
      .catch(() => { if (active) setStatus('denied'); });
    return () => { active = false; };
  }, []);

  if (status === 'checking') {
    return <div role="status" className="min-h-screen flex items-center justify-center text-zinc-500">Verificando acceso…</div>;
  }
  if (status === 'denied') return <Navigate to="/teacher/login" replace />;
  return <>{children}</>;
};
