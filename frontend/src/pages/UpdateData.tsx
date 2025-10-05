import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Upload, Calculator, RotateCcw } from 'lucide-react';

interface FormData {
  pregnancies: string;
  glucose: string;
  bloodPressure: string;
  insulin: string;
  bmi: string;
  diabetesFamily: boolean;
  age: string;
}

export default function UpdateData() {
  const navigate = useNavigate();
  const { addAssessment } = useData();

  const [formData, setFormData] = useState<FormData>({
    pregnancies: '',
    glucose: '',
    bloodPressure: '',
    insulin: '',
    bmi: '',
    diabetesFamily: false,
    age: ''
  });

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [riskResult, setRiskResult] = useState<{
    percentage: number;
    level: 'Low' | 'Moderate' | 'High';
  } | null>(null);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const newValue = Number(value);
    if (newValue < 0) return; // ignore negatives

    setFormData({...formData,[name]: newValue});
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    }
  };

  const calculateRisk = () => {
    // Simple risk calculation algorithm (in real app, this would be ML model) TBA
    
    // return { percentage, level };
  };

  const handleCalculateRisk = () => {
    setIsLoading(true);
    
    // Validate required fields
    const requiredFields = ['glucose', 'bloodPressure', 'insulin', 'bmi', 'age'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (missingFields.length > 0) {
      alert('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    
    // setTimeout(() => {
    //   const result = calculateRisk();
    //   setRiskResult(result);
    //   setIsLoading(false);
      
    //   // Add assessment to context
    //   const assessment = {
    //     date: new Date().toISOString().split('T')[0],
    //     riskLevel: result.level,
    //     riskPercentage: result.percentage,
    //     pregnancies: parseInt(formData.pregnancies) || 0,
    //     glucose: parseInt(formData.glucose),
    //     bloodPressure: parseInt(formData.bloodPressure),
    //     insulin: parseInt(formData.insulin) || 0,
    //     bmi: parseFloat(formData.bmi),
    //     diabetesFamily: (formData.diabetesFamily) || false,
    //     age: parseInt(formData.age)
    //   };
      
    //   addAssessment(assessment);
    // }, 1500);

    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleResetForm = () => {
    setFormData({
      pregnancies: '',
      glucose: '',
      bloodPressure: '',
      insulin: '',
      bmi: '',
      diabetesFamily: false,
      age: ''
    });
    setRiskResult(null);
    setCsvFile(null);
  };

  const handleSubmitCsv = () => {
    //TBA
    if (csvFile) {
      alert('CSV data processing would be implemented here');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Update Your Health Data</h1>
        <p className="text-gray-600">Complete a new diabetes risk assessment</p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-sm p-8 border">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Diabetes Risk Assessment Form</h2>
        <p className="text-gray-600 mb-6">Enter the required health measurements for diabetes risk prediction</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Pregnancies
            </label>
            <input
              type="number"
              name="pregnancies"
              min={0}  // prevents typing values less than 0
              value={formData.pregnancies}
              onChange={handleInputChange}
              placeholder="Enter # of times pregnant"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              min={0}  // prevents typing values less than 0
              value={formData.glucose}
              onChange={handleInputChange}
              placeholder="e.g., 95"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
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
              min={0}  // prevents typing values less than 0
              value={formData.bloodPressure}
              onChange={handleInputChange}
              placeholder="e.g., 70"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
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
              min={0}  // prevents typing values less than 0
              value={formData.age}
              onChange={handleInputChange}
              placeholder="e.g., 25"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
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
              min={0}  // prevents typing values less than 0
              value={formData.insulin}
              onChange={handleInputChange}
              placeholder="e.g., 80"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              min={0}  // prevents typing values less than 0
              value={formData.bmi}
              onChange={handleInputChange}
              placeholder="e.g., 32.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Weight (kg) / Height (m)²</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diabetic Family
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
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">Do you have a family member with diabetes?</p>
          </div>

        </div>

        {/* Risk Result */}
        {riskResult && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Risk Assessment Result</h3>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg text-white font-medium ${
                riskResult.level === 'Low' ? 'bg-green-500' :
                riskResult.level === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {riskResult.level} Risk
              </div>
              <span className="text-2xl font-bold">{riskResult.percentage}% Risk</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            onClick={handleCalculateRisk}
            disabled={isLoading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isLoading ? 'Calculating...' : 'Calculate Risk'}
          </button>
          
          <button
            onClick={handleResetForm}
            className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Form
          </button>
        </div>
      </div>

      {/* CSV Upload Section */}
      <div className="bg-white rounded-lg shadow-sm p-8 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">CSV Data Upload (Optional)</h3>
        <p className="text-gray-600 mb-6">Upload CSV files containing diabetes-related medical data</p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500">CSV files only (MAX: 10MB)</p>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
          >
            Choose File
          </label>
          
          {csvFile && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">File selected: {csvFile.name}</p>
              <button
                onClick={handleSubmitCsv}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit with CSV Data
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-orange-600">
          * Please fill all required fields with valid values
        </div>
      </div>
    </div>
  );
}