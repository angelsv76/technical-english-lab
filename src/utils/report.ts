import jsPDF from 'jspdf';
import { Student } from '../types';

export const generatePDFReport = (
  student: Student,
  weekNumber: number,
  score: number,
  bestScore: number,
  status: 'Passed' | 'Not Passed'
) => {
  const doc = new jsPDF();
  const primaryColor = '#F57C00';
  const date = new Date().toLocaleDateString();

  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Technical English Lab', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Reporte de Evaluación Semanal', 105, 30, { align: 'center' });

  // Student Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Información del Estudiante', 20, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Nombre: ${student.name}`, 20, 65);
  doc.text(`NIE: ${student.nie}`, 20, 72);
  doc.text(`Grupo: ${student.code}`, 20, 79);
  doc.text(`Fecha: ${date}`, 20, 86);

  // Results
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Resultados de la Semana ' + weekNumber, 20, 105);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Puntaje Obtenido: ${score}%`, 20, 115);
  doc.text(`Mejor Puntaje: ${bestScore}%`, 20, 122);
  
  const statusColor = status === 'Passed' ? [0, 150, 0] : [200, 0, 0];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`Estado: ${status === 'Passed' ? 'APROBADO' : 'REPROBADO'}`, 20, 135);

  // Footer
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 270, 190, 270);
  
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Este documento es un reporte automático generado por Technical English Lab.', 105, 280, { align: 'center' });

  doc.save(`Reporte_Semana_${weekNumber}_${student.name.replace(/\s+/g, '_')}.pdf`);
};
