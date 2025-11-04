import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiBase } from '../config';

const API_BASE = getApiBase(); 

type ModelKey = 
  | "xgboost"
  | "randomforest"
  | "logisticregression"
  | "svc"
  | "knn"
  | "mlp";

// Helper to omit all risk fields for any model
type RiskKeys = `riskLevel_${ModelKey}` | `riskPercentage_${ModelKey}`;
export type AssessmentInput = Omit<Assessment, 'id' | RiskKeys>;

export interface Assessment {
  id?: string;
  date?: string;
  bmi: number;
  glucose: number;
  bloodPressure: number;
  pregnancies?: number;
  insulin?: number;
  diabetesFamily?: boolean;
  age: number;

  riskLevel_xgboost: 'Low' | 'Moderate' | 'High';
  riskPercentage_xgboost: number;

  riskLevel_logisticregression: 'Low' | 'Moderate' | 'High';
  riskPercentage_logisticregression: number;

  riskLevel_randomforest: 'Low' | 'Moderate' | 'High';
  riskPercentage_randomforest: number;

  riskLevel_svc: 'Low' | 'Moderate' | 'High';
  riskPercentage_svc: number;

  riskLevel_knn: 'Low' | 'Moderate' | 'High';
  riskPercentage_knn: number;

  riskLevel_mlp: 'Low' | 'Moderate' | 'High';
  riskPercentage_mlp: number;
}

interface DataContextType {
  assessments: Assessment[];
  fetchAssessments: ()=> Promise<void>;
  addAssessment: (assessment: AssessmentInput) => Promise<string>;
  addAssessmentsBulk: (assessments: AssessmentInput[]) => Promise<void>;
  updateAssessment: (id: string, assessment: AssessmentInput) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  getLatestAssessment: () => Assessment | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);


//function to map riskLevel from API to the app
function toRiskLabel(value: string): "Low" | "Moderate" | "High" {
  if (!value) return "Low"; // fallback
  if (value.toLowerCase().includes("low")) return "Low";
  if (value.toLowerCase().includes("medium") || value.toLowerCase().includes("moderate")) return "Moderate";
  return "High";
}

//function to map the API response into the app
function mapApiToAssessment(apiData: any): Assessment {
  return {
    id: String(apiData.record_id),
    date: apiData.created_at.split("T")[0], // just DD-MM-YYYY
    bmi: apiData.bmi,
    glucose: apiData.glucose,
    bloodPressure: apiData.blood_pressure,
    pregnancies: apiData.pregnancies,
    insulin: apiData.insulin,
    diabetesFamily: Boolean(apiData.diabetic_family),
    age: apiData.age,
     // XGBoost
    riskLevel_xgboost: toRiskLabel(apiData.outcome_xgboost),
    riskPercentage_xgboost: apiData.prediction_prob_xgboost,

    // Logistic Regression
    riskLevel_logisticregression: toRiskLabel(apiData.outcome_logisticregression),
    riskPercentage_logisticregression: apiData.prediction_prob_logisticregression,

    // Random Forest
    riskLevel_randomforest: toRiskLabel(apiData.outcome_randomforest),
    riskPercentage_randomforest: apiData.prediction_prob_randomforest,

    // SVC
    riskLevel_svc: toRiskLabel(apiData.outcome_svc),
    riskPercentage_svc: apiData.prediction_prob_svc,

    // KNN
    riskLevel_knn: toRiskLabel(apiData.outcome_knn),
    riskPercentage_knn: apiData.prediction_prob_knn,

    // MLP
    riskLevel_mlp: toRiskLabel(apiData.outcome_mlp),
    riskPercentage_mlp: apiData.prediction_prob_mlp,
  };
}

function mapAssessmentToApi(assessment: AssessmentInput | Assessment,
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
  const addAssessment = async (assessment: AssessmentInput) => {
    try {
      const res = await fetch(`${API_BASE}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify(mapAssessmentToApi(assessment)),
      });

      const data = await res.json(); // parse the response body


      if (!res.ok) {
      const errText = await res.text(); // or res.json() if API returns JSON
      console.error("Failed to add assessments", errText);
      throw new Error(`Failed to add assessments: ${res.status} - ${errText}`);
    }

    // After insert, refetch all assessments
    await fetchAssessments();
    return data.record_id;
    } catch (err) {
      console.error("Network error adding assessment:", err);
      return null;
    }
  };

  //AddAssesmenntBulk APIcall
  const addAssessmentsBulk = async (assessments: AssessmentInput[]) => {
  try {
    // map each assessment to API format with created_at
    const payload = assessments.map(a => (mapAssessmentToApi(a)));

    const res = await fetch(`${API_BASE}/records/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.token}`,
      },
      body: JSON.stringify(payload),
    });
    console.log(payload)

    if (!res.ok) {
      const errText = await res.text(); // or res.json() if API returns JSON
      console.error("Failed to add bulk assessments", errText);
      throw new Error(`Failed to add bulk assessments: ${res.status} - ${errText}`);
    }

    // After bulk insert, refetch all assessments
    await fetchAssessments();
  } catch (err) {
    console.error("Network error adding bulk assessments:", err);
    throw err;
  }
};

  //UpdateAssessment APICALL
  const updateAssessment = async (id: string, updatedAssessment: AssessmentInput) => {
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