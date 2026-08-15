import React from 'react';
import { useTeacherShortcut } from '../hooks/useTeacherShortcut';

/**
 * Global component that enables hidden teacher access via keyboard shortcuts.
 * This component doesn't render anything visible.
 */
export const HiddenTeacherAccess: React.FC = () => {
  useTeacherShortcut();
  
  return null;
};
