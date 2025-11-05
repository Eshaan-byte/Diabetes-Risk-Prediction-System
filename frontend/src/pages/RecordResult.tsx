import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData, Assessment } from '../contexts/DataContext';
import { useModelMode } from '../contexts/ModelModeContext';
import ModelSelector from '../components/ModelSelector';
import ModelMetricsGrid from '../components/ModelMetricsGrid';
import { LineChart, Line, XAxis, YAxis, PieChart, Pie, Cell, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

interface EditFormData {
  date?: string
  pregnancies: string;
  glucose: string;
  bloodPressure: string;
  insulin: string;
  bmi: string;
  diabetesFamily: boolean;
  age: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  riskPercentage: number;
}

export default function RecordResult() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { assessments } = useData();
  const { model } = useModelMode();
  const riskPercentageKey = `riskPercentage_${model}` as keyof Assessment;
  const riskLevelKey = `riskLevel_${model}` as keyof Assessment;

  const [formData, setFormData] = useState<EditFormData>({
    date: '',
    pregnancies: '',
    glucose: '',
    bloodPressure: '',
    insulin: '',
    bmi: '',
    diabetesFamily: false,
    age: '',
    riskLevel: 'Low',
    riskPercentage: 0
  });

  const [recordFound, setRecordFound] = useState(true);

  useEffect(() => {
    if (id) {
      const record = assessments.find(assessment => assessment.id === id);
      if (record) {
        setFormData({
          date: record.date,
          pregnancies: record.pregnancies?.toString() || '',
          glucose: record.glucose?.toString() || '',
          bloodPressure: record.bloodPressure?.toString() || '',
          insulin: record.insulin?.toString() || '',
          bmi: record.bmi?.toString() || '',
          diabetesFamily: record.diabetesFamily || false,
          age: record.age?.toString() || '',
          riskLevel: (record[riskLevelKey] as "Low" | "Moderate" | "High") || "Low",
          riskPercentage: (record[riskPercentageKey] as number) || 0
        });
      } else {
        setRecordFound(false);
      }
    }
  }, [id, assessments, model]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleCancel = () => {
    navigate(-1); // fallback: browser back
  };


  const handleGoToDasboard = () => {
    navigate('/dasboard');
  };

  const handleGoToRecords = () => {
    navigate('/review-records');
  };

  // Recommendation engine based on risk level
  const getRecommendations = (riskLevel: 'Low' | 'Moderate' | 'High', riskPercentage: number): string[] => {
    const bmiValue = parseFloat(formData.bmi);
    const glucoseValue = parseFloat(formData.glucose);
    const bloodPressureValue = parseFloat(formData.bloodPressure);
    const age = parseFloat(formData.age);

    if (riskLevel === 'Low') {
      return [
        '✓ Great news! Your diabetes risk is currently low.',
        '• Continue maintaining a healthy lifestyle with balanced diet and regular exercise.',
        '• Monitor your blood glucose levels periodically (at least once a year).',
        '• Maintain a healthy weight with BMI between 18.5-24.9.',
        '• Stay physically active with at least 150 minutes of moderate exercise per week.',
        '• Consider regular health check-ups to maintain your current health status.',
      ];
    } else if (riskLevel === 'Moderate') {
      const recommendations = [
        '⚠ Your diabetes risk is moderate. Take preventive action now.',
        '• Schedule a consultation with your healthcare provider within the next month.',
        '• Monitor your blood glucose levels more frequently (every 3-6 months).',
        '• Adopt a diabetes-prevention diet: reduce refined carbs and sugar intake.',
      ];

      if (bmiValue > 25) {
        recommendations.push('• Your BMI indicates overweight. Aim to lose 5-10% of body weight through diet and exercise.');
      }

      if (glucoseValue > 125) {
        recommendations.push('• Your glucose level is elevated. Limit sugary foods and drinks, increase fiber intake.');
      }

      if (bloodPressureValue > 80) {
        recommendations.push('• Monitor blood pressure regularly. Reduce sodium intake and manage stress.');
      }

      recommendations.push(
        '• Increase physical activity to at least 30 minutes daily.',
        '• Consider joining a diabetes prevention program.',
        '• Get adequate sleep (7-9 hours per night) to help regulate metabolism.'
      );

      return recommendations;
    } else {
      // High risk
      const recommendations = [
        '🚨 Your diabetes risk is HIGH. Immediate medical attention is recommended.',
        '• URGENT: Schedule an appointment with your doctor or endocrinologist immediately.',
        '• Get a comprehensive diabetes screening (HbA1c test) as soon as possible.',
        '• Begin monitoring blood glucose levels daily if possible.',
      ];

      if (bmiValue > 30) {
        recommendations.push('• Your BMI indicates obesity. Work with a nutritionist for a weight management plan.');
      } else if (bmiValue > 25) {
        recommendations.push('• Reduce weight through a structured diet and exercise program supervised by healthcare professionals.');
      }

      if (glucoseValue > 140) {
        recommendations.push('• Your glucose level is significantly elevated. Follow a strict low-glycemic diet.');
        recommendations.push('• Avoid all sugary beverages, refined carbohydrates, and processed foods.');
      }

      if (bloodPressureValue > 90) {
        recommendations.push('• Your blood pressure is high. Consult a doctor about blood pressure management.');
      }

      if (age > 45) {
        recommendations.push('• Given your age, regular diabetes screening is critical.');
      }

      if (formData.diabetesFamily) {
        recommendations.push('• Family history increases your risk. Genetic counseling may be beneficial.');
      }

      recommendations.push(
        '• Strongly consider medication options with your healthcare provider.',
        '• Join a diabetes education program to learn about prevention and management.',
        '• Regular physical activity is crucial - aim for 45-60 minutes of moderate exercise daily.',
        '• Work with a registered dietitian to create a personalized meal plan.',
        '• Monitor for symptoms: excessive thirst, frequent urination, unexplained weight loss, fatigue.'
      );

      return recommendations;
    }
  };

  if (!recordFound) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Record Not Found</h1>
        <p className="text-gray-600 mb-6">The record you're trying to view doesn't exist.</p>
        <button
          onClick={() => navigate('/review-records')}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Records
        </button>
      </div>
    );
  }

  // Prepare chart data
  const riskTrendData = assessments.map(a => ({
    id: a.id,
    date: format(new Date(a.date!), 'dd/MM/yyyy'),
    risk: a[riskPercentageKey] as number
  }));
  
  //Prepare offset for RISK TREND DATA with same dates
  const riskTrendDataWithOffset = riskTrendData.map((item, index, arr) => {
    // Count previous duplicates
    const duplicateCount = arr.slice(0, index).filter(d => d.date === item.date).length;
    return {
      ...item,
      dateForChart: duplicateCount ? `${item.date} (${duplicateCount})` : item.date
    };
  });

  const bmiTrendData = assessments.map(a => ({
    id: a.id,
    date: format(new Date(a.date!), 'dd/MM/yyyy'),
    bmi: a.bmi
  }));

  //Prepare offset for BMI TRENDS with same dates
  const bmiTrendWithOffset = bmiTrendData.map((item, index, arr) => {
    // Count previous duplicates
    const duplicateCount = arr.slice(0, index).filter(d => d.date === item.date).length;
    return {
      ...item,
      dateForChart: duplicateCount ? `${item.date} (${duplicateCount})` : item.date
    };
  });
  
  const riskDistributionData = [
    { name: 'Low Risk', value: assessments.filter(a => a[riskLevelKey] === 'Low').length,   color: '#10B981' },
    { name: 'Moderate Risk', value: assessments.filter(a => a[riskLevelKey] === 'Moderate').length, color: '#F59E0B' },
    { name: 'High Risk', value: assessments.filter(a => a[riskLevelKey] === 'High').length, color: '#EF4444' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleCancel}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Prediction Result</h1>
          <p className="text-gray-600">Your diabetes risk assessment result</p>
        </div>
      </div>

      {/* View Form */}
      <form className="bg-white rounded-lg shadow-sm p-8 border">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Assessment Data</h2>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Record Date: {formData.date!.split("-").reverse().join("-")}
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Pregnancies
            </label>
            <input
              type="number"
              name="pregnancies"
              min={0}
              value={formData.pregnancies}
              placeholder="Enter # of times pregnant"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">0 = never pregnant</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Glucose Level (mg/dL) *
            </label>
            <input
              type="number"
              name="glucose"
              min={0}
              value={formData.glucose}
              placeholder="e.g., 95"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">2-hour oral glucose tolerance test</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diastolic Blood Pressure (mmHg) *
            </label>
            <input
              type="number"
              name="bloodPressure"
              min={0}
              value={formData.bloodPressure}
              placeholder="e.g., 70"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Lower number in blood pressure reading</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age (years) *
            </label>
            <input
              type="number"
              name="age"
              min={0}
              value={formData.age}
              placeholder="e.g., 25"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Current age in years</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insulin Level (μU/mL)
            </label>
            <input
              type="number"
              name="insulin"
              min={0}
              value={formData.insulin}
              placeholder="e.g., 80"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">2-hour serum insulin level</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BMI (Body Mass Index) *
            </label>
            <input
              type="number"
              step="0.1"
              name="bmi"
              min={0}
              value={formData.bmi}
              placeholder="e.g., 32.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Weight (kg) / Height (m)²</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diabetic Family History
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="diabetesFamily"
                  value="true"
                  checked={formData.diabetesFamily === true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      diabetesFamily: e.target.value === "true"
                    })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled
                />
                <span className="ml-2">Yes</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="diabetesFamily"
                  value="false"
                  checked={formData.diabetesFamily === false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      diabetesFamily: e.target.value === "true"
                    })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">Do you have a family member with diabetes?</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">Results</h2>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-2 mb-4">
          <h3 className="block text-base font-semibold text-gray-800">Model Used</h3>
          <ModelSelector />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2  ">
              Risk Level
            </label>
            <input
              type="text"
              name="riskLevel"
              value={formData.riskLevel}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">The predicted risk level</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Percentage
            </label>
            <input
              type="text"
              name="riskPercentage"
              value={formData.riskPercentage + "%"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">The predicted risk percentage</p>
          </div>

        </div>

        {/* Recommendations Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Personalized Recommendations
          </h3>
          <div className={`p-6 rounded-lg border-2 ${
            formData.riskLevel === 'Low'
              ? 'bg-green-50 border-green-200'
              : formData.riskLevel === 'Moderate'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <ul className="space-y-3">
              {getRecommendations(formData.riskLevel, formData.riskPercentage).map((recommendation, index) => (
                <li
                  key={index}
                  className={`text-sm ${
                    index === 0
                      ? 'font-semibold text-lg mb-2'
                      : 'text-gray-700'
                  }`}
                >
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            type="button"
            onClick={handleGoToDasboard}
            className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
          >
            Back to Dashboard
          </button>
          
          <button
            type="button"
            onClick={handleGoToRecords}
            className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
          >
            Go to Records
          </button>
        </div>
      </form>



      {/* The model Performances */}
      <ModelMetricsGrid/>


      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Risk Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">Risk Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendDataWithOffset}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateForChart" interval="preserveStartEnd" padding={{ left: 20, right: 20 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="risk" stroke="#3B82F6" strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{
                    r: 7,
                    style: { cursor: "pointer" },
                    onClick: (_, payload) => {
                      const id = (payload as any).payload.id
                      navigate(`/record-result/${id}`);
                    }
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BMI Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-green-600 mb-4">BMI Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bmiTrendWithOffset}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateForChart" interval="preserveStartEnd" padding={{ left: 20, right: 20 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bmi" stroke="#10B981" strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{
                    r: 7,
                    style: { cursor: "pointer" },
                    onClick: (_, payload) => {
                      const id = (payload as any).payload.id
                      navigate(`/record-result/${id}`);
                    }
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-600 mb-4">Risk Level Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {riskDistributionData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}