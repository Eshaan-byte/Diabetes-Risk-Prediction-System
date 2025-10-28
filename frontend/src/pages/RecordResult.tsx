import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { LineChart, Line, XAxis, YAxis, PieChart, Pie, Cell, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface EditFormData {
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

  const [formData, setFormData] = useState<EditFormData>({
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
          pregnancies: record.pregnancies?.toString() || '',
          glucose: record.glucose?.toString() || '',
          bloodPressure: record.bloodPressure?.toString() || '',
          insulin: record.insulin?.toString() || '',
          bmi: record.bmi?.toString() || '',
          diabetesFamily: record.diabetesFamily || false,
          age: record.age?.toString() || '',
          riskLevel: record.riskLevel,
          riskPercentage: record.riskPercentage
        });
      } else {
        setRecordFound(false);
      }
    }
  }, [id, assessments]);

  const handleGoToDasboard = () => {
    navigate('/dasboard');
  };

  const handleGoToRecords = () => {
    navigate('/review-records');
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
      date: format(new Date(a.date!), 'dd/MM/yyyy'),
      risk: a.riskPercentage
    }));
  
    const bmiTrendData = assessments.map(a => ({
      date: format(new Date(a.date!), 'dd/MM/yyyy'),
      bmi: a.bmi
    }));
  
    const riskDistributionData = [
    { name: 'Low Risk', value: assessments.filter(a => a.riskLevel === 'Low').length,   color: '#10B981' },
    { name: 'Moderate Risk', value: assessments.filter(a => a.riskLevel === 'Moderate').length, color: '#F59E0B' },
    { name: 'High Risk', value: assessments.filter(a => a.riskLevel === 'High').length, color: '#EF4444' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Prediction Result</h1>
          <p className="text-gray-600">Your diabetes risk assessment result</p>
        </div>
      </div>

      {/* View Form */}
      <form className="bg-white rounded-lg shadow-sm p-8 border">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Assessment Data</h2>

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
            <p className="text-xs text-gray-500 mt-1">Enter 0 if never pregnant</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation
            </label>
            <input
              type="text"
              name="recommendation"
              value={formData.riskLevel} //ADD RECOMMENDATION HERE
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">The predicted risk level</p>
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

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Risk Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">Risk Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" interval="preserveStartEnd" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="risk" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BMI Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-green-600 mb-4">BMI Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bmiTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" interval="preserveStartEnd" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bmi" stroke="#10B981" strokeWidth={2} />
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