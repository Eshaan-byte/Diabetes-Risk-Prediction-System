import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Assessment {
  id: string;
  date: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  riskPercentage: number;
  bmi: number;
  glucose: number;
  bloodPressure: number;
  pregnancies?: number;
  skinThickness?: number;
  insulin?: number;
  diabetesPedigree?: number;
  age: number;
}

interface DataContextType {
  assessments: Assessment[];
  addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
  updateAssessment: (id: string, assessment: Partial<Assessment>) => void;
  deleteAssessment: (id: string) => void;
  getLatestAssessment: () => Assessment | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const mockAssessments: Assessment[] = [
  {
    id: '1',
    date: '2024-01-15',
    riskLevel: 'Moderate',
    riskPercentage: 35,
    bmi: 24.8,
    glucose: 105,
    bloodPressure: 134,
    pregnancies: 0,
    skinThickness: 23,
    insulin: 94,
    diabetesPedigree: 0.627,
    age: 32
  },
  {
    id: '2',
    date: '2024-02-20',
    riskLevel: 'High',
    riskPercentage: 66,
    bmi: 28.2,
    glucose: 138,
    bloodPressure: 142,
    pregnancies: 1,
    skinThickness: 35,
    insulin: 168,
    diabetesPedigree: 0.832,
    age: 32
  },
  {
    id: '3',
    date: '2024-03-10',
    riskLevel: 'Moderate',
    riskPercentage: 45,
    bmi: 27.1,
    glucose: 98,
    bloodPressure: 126,
    pregnancies: 1,
    skinThickness: 29,
    insulin: 94,
    diabetesPedigree: 0.832,
    age: 32
  },
  {
    id: '4',
    date: '2024-04-05',
    riskLevel: 'Low',
    riskPercentage: 25,
    bmi: 24.8,
    glucose: 92,
    bloodPressure: 122,
    pregnancies: 1,
    skinThickness: 23,
    insulin: 78,
    diabetesPedigree: 0.832,
    age: 33
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);

  const addAssessment = (assessment: Omit<Assessment, 'id'>) => {
    const newAssessment = {
      ...assessment,
      id: Date.now().toString()
    };
    setAssessments(prev => [newAssessment, ...prev]);
  };

  const updateAssessment = (id: string, updatedAssessment: Partial<Assessment>) => {
    setAssessments(prev => prev.map(assessment => 
      assessment.id === id ? { ...assessment, ...updatedAssessment } : assessment
    ));
  };

  const deleteAssessment = (id: string) => {
    setAssessments(prev => prev.filter(assessment => assessment.id !== id));
  };

  const getLatestAssessment = () => {
    return assessments.length > 0 ? assessments[0] : undefined;
  };

  return (
    <DataContext.Provider value={{
      assessments,
      addAssessment,
      updateAssessment,
      deleteAssessment,
      getLatestAssessment
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}