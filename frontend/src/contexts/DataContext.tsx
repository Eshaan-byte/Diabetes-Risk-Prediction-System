import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CONFIG, getApiBase } from '../config';

const API_BASE = getApiBase(); 

interface Assessment {
  id?: string;
  date?: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  riskPercentage: number;
  bmi: number;
  glucose: number;
  bloodPressure: number;
  pregnancies?: number;
  insulin?: number;
  diabetesFamily?: boolean;
  age: number;
}

interface DataContextType {
  assessments: Assessment[];
  addAssessment: (assessment: Omit<Assessment, 'id'>) => Promise<void>;
  updateAssessment: (id: string, assessment: Assessment) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  getLatestAssessment: () => Assessment | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function mapApiToAssessment(apiData: any): Assessment {
  return {
    id: String(apiData.record_id),
    date: apiData.created_at.split("T")[0], // just YYYY-MM-DD
    riskLevel: apiData.outcome.includes("Low")
      ? "Low"
      : apiData.outcome.includes("Medium")
      ? "Moderate"
      : "High",
    riskPercentage: apiData.prediction_prob,
    bmi: apiData.bmi,
    glucose: apiData.glucose,
    bloodPressure: apiData.blood_pressure,
    pregnancies: apiData.pregnancies,
    insulin: apiData.insulin,
    diabetesFamily: Boolean(apiData.diabetic_family),
    age: apiData.age,
  };
}

function mapAssessmentToApi(assessment: Assessment, isUpdate = false) {
  const payload: any = {
    glucose: assessment.glucose,
    blood_pressure: assessment.bloodPressure,
    bmi: assessment.bmi,
    pregnancies: assessment.pregnancies,
    insulin: assessment.insulin,
    diabetic_family: assessment.diabetesFamily ? 1 : 0,
    age: assessment.age,
  };

  if (isUpdate) {
    payload.record_id = assessment.id; // required for update
  }

  return payload;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);

 // Load assessments on component mount
  useEffect(() => {
    const fetchAssessments = async () => {
      // Demo mode - load mock data
      if (CONFIG.USE_DEMO_MODE) {
        const mockAssessments: Assessment[] = [
          {
            id: '1',
            date: '2024-10-01',
            riskLevel: 'Low',
            riskPercentage: 25,
            bmi: 24.5,
            glucose: 85,
            bloodPressure: 70,
            pregnancies: 0,
            insulin: 0,
            diabetesFamily: false,
            age: 28
          },
          {
            id: '2',
            date: '2024-09-15',
            riskLevel: 'Moderate',
            riskPercentage: 55,
            bmi: 29.1,
            glucose: 110,
            bloodPressure: 80,
            pregnancies: 1,
            insulin: 85,
            diabetesFamily: true,
            age: 32
          }
        ];
        setAssessments(mockAssessments);
        return;
      }

      // API mode - try actual API
      try {
        const res = await fetch(`${API_BASE}/records/my-records`, {
          method : "GET",
          headers: {
            "Authorization": `Bearer ${user?.token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((item: any) => mapApiToAssessment(item));
          setAssessments(mapped);
        } else {
          console.error("Failed to fetch assessments", await res.json());
        }
      } catch (err) {
        console.error("Network error fetching records:", err);
      }
    };

    if (user?.token) fetchAssessments();
  }, [user?.token]);

  const addAssessment = async (assessment: Omit<Assessment, 'id'>) => {
    // Demo mode - add to local state
    if (CONFIG.USE_DEMO_MODE) {
      const newAssessment: Assessment = {
        ...assessment,
        id: Date.now().toString(),
        date: assessment.date || new Date().toISOString().split('T')[0]
      };
      setAssessments(prev => [...prev, newAssessment]);
      return;
    }

    // API mode - try actual API
    try {
      const res = await fetch(`${API_BASE}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify(mapAssessmentToApi(assessment)),
      });

      if (res.ok) {
        const newAssessment = await res.json();
        setAssessments(prev => [...prev, newAssessment]);
      } else {
        console.error("Failed to add assessment", await res.json());
      }
    } catch (err) {
      console.error("Network error adding assessment:", err);
    }
  };

  const updateAssessment = async (id: string, updatedAssessment: Assessment) => {
    // Demo mode - update local state
    if (CONFIG.USE_DEMO_MODE) {
      setAssessments(prev =>
        prev.map(assessment =>
          assessment.id === id ? updatedAssessment : assessment
        )
      );
      return;
    }

    // API mode - try actual API
    try {
      const res = await fetch(`${API_BASE}/records/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify(mapAssessmentToApi(updatedAssessment, true)),
      });

      if (res.ok) {
        const updated = await res.json();
        setAssessments(prev =>
          prev.map(assessment =>
          assessment.id === id ? updatedAssessment : assessment
          )
        );
      } else {
        console.error("Failed to update assessment", await res.json());
      }
    } catch (err) {
      console.error("Network error updating assessment:", err);
    }
  };

  const deleteAssessment = async (id: string) => {
    // Demo mode - delete from local state
    if (CONFIG.USE_DEMO_MODE) {
      setAssessments(prev => prev.filter(a => a.id !== id));
      return;
    }

    // API mode - try actual API
    try {
      const res = await fetch(`${API_BASE}/records/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user?.token}`,
        },
      });

      if (res.ok) {
        setAssessments(prev => prev.filter(a => a.id !== id));
      } else {
        console.error("Failed to delete assessment", await res.json());
      }
    } catch (err) {
      console.error("Network error deleting assessment:", err);
    }
  };

  const getLatestAssessment = () => {
    return assessments.length > 0 ? assessments[assessments.length - 1] : undefined;
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