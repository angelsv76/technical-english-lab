import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isTeacherLoggedIn } from '../services/authService';

interface Props {
  children: React.ReactNode;
}

export const TeacherRoute: React.FC<Props> = ({ children }) => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    isTeacherLoggedIn().then(result => { if (mounted) setAuthorized(result); })
      .catch(() => { if (mounted) setAuthorized(false); });
    return () => { mounted = false; };
  }, []);

  if (authorized === null) return <div role="status" className="min-h-screen grid place-items-center">Verificando acceso docente…</div>;
  if (!authorized) {
    return <Navigate to="/teacher/login" replace />;
  }

  return <>{children}</>;
};
