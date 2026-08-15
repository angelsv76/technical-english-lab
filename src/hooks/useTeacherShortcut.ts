import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook that listens for Ctrl + Shift + T keyboard shortcut
 * to navigate to the teacher login page.
 */
export const useTeacherShortcut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detect Ctrl + Shift + T
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        navigate('/teacher-login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
};
