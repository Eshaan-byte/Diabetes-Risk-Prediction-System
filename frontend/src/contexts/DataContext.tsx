import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiBase } from '../config';

const API_BASE = getApiBase(); 

export interface Assessment {
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
  fetchAssessments: ()=> Promise<void>;
  addAssessment: (assessment: Omit<Assessment, 'id' | 'riskLevel' | 'riskPercentage'>) => Promise<void>;
  addAssessmentsBulk: (assessments: Omit<Assessment, 'id' | 'riskLevel' | 'riskPercentage'>[]) => Promise<void>;
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

function mapAssessmentToApi(assessment: Omit<Assessment, 'id' | 'riskLevel' | 'riskPercentage'> | Assessment,
  isUpdate = false) {
  const payload: any = {
    glucose: assessment.glucose,
    blood_pressure: assessment.bloodPressure,
    bmi: assessment.bmi,
    pregnancies: assessment.pregnancies,
    insulin: assessment.insulin,
    diabetic_family: assessment.diabetesFamily ? 1 : 0,
    age: assessment.age,
    // Automatically set created_at: use existing date or current timestamp
    created_at: 'date' in assessment && assessment.date ? assessment.date : new Date().toISOString(),
  };

  if (isUpdate && 'id' in assessment) {
    payload.record_id = assessment.id; // required for update
  }

  return payload;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  //FetchAssessments from the DB
  const fetchAssessments = async () => {
    if (!user?.token) return;

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

  // Load assessments on component mount
  useEffect(() => {
    if (user?.token) fetchAssessments();
  }, [user?.token]);


  //AddAssessment API CALL
  const addAssessment = async (assessment: Omit<Assessment, 'id' | 'riskLevel' | 'riskPercentage'>) => {
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
        await fetchAssessments();
      } else {
        console.error("Failed to add assessment", await res.json());
      }
    } catch (err) {
      console.error("Network error adding assessment:", err);
    }
  };

  //AddAssesmenntBulk APIcall
  const addAssessmentsBulk = async (
  assessments: Omit<Assessment, 'id' | 'riskLevel' | 'riskPercentage'>[]) => {
  try {
    // map each assessment to API format with created_at
    const payload = assessments.map(a => (
      mapAssessmentToApi(a)
    ));

    console.log(assessments)
    console.log(payload)

    const res = await fetch(`${API_BASE}/records/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // After bulk insert, refetch all assessments
      await fetchAssessments();
    } else {
      console.error("Failed to add bulk assessments", await res.json());
    }
  } catch (err) {
    console.error("Network error adding bulk assessments:", err);
  }
};



  //UpdateAssessment APICALL
  const updateAssessment = async (id: string, updatedAssessment: Assessment) => {
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
        await fetchAssessments();
      } else {
        console.error("Failed to update assessment", await res.json());
      }
    } catch (err) {
      console.error("Network error updating assessment:", err);
    }
  };

  //DeleteAssessment APICALL
  const deleteAssessment = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/records/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user?.token}`,
        },
      });

      if (res.ok) {
        await fetchAssessments();
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
      fetchAssessments,
      addAssessment,
      addAssessmentsBulk,
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