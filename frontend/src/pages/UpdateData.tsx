import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Upload, Calculator, RotateCcw } from 'lucide-react';
import { AssessmentInput } from '../contexts/DataContext';
import Papa from 'papaparse';

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
  const { addAssessment, addAssessmentsBulk } = useData();

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
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [csvProcessing, setCsvProcessing] = useState(false);
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
      setCsvProcessing(true);
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            alert('Error parsing CSV: ' + results.errors[0].message);
            setCsvProcessing(false);
            return;
          }
          
          setCsvData(results.data);
          setCsvPreview(results.data.slice(0, 5)); // Show first 5 rows as preview
          setCsvProcessing(false);
        },
        error: (error) => {
          alert('Error reading file: ' + error.message);
          setCsvProcessing(false);
        }
      });
    } else {
      alert('Please select a valid CSV file');
    }
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
    
    setTimeout(async () => {
      
      
      // Add assessment to context
      const assessment: AssessmentInput = {
        date: new Date().toISOString().split('T')[0],
        pregnancies: parseInt(formData.pregnancies) || 0,
        glucose: parseInt(formData.glucose),
        bloodPressure: parseInt(formData.bloodPressure),
        insulin: parseInt(formData.insulin) || 0,
        bmi: parseFloat(formData.bmi),
        diabetesFamily: formData.diabetesFamily || false,
        age: parseInt(formData.age),
      };

      const id = await addAssessment(assessment)
      setIsLoading(false);
      if (id) {navigate(`/record-result/${id}`)}
    }, 1500);
  }

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

  const handleSubmitCsv = async () => {
    if (!csvData.length) {
      alert('No CSV data to process');
      return;
    }

    setCsvProcessing(true);
    
    try {
      // Map CSV columns to expected format
      const processedData = csvData.map((row: any) => ({
        pregnancies: parseInt(row.pregnancies || row.Pregnancies || '0') || 0,
        glucose: parseInt(row.glucose || row.Glucose || '0') || 0,
        bloodPressure: parseInt(row.blood_pressure || row['Blood Pressure'] || row.BloodPressure || '0') || 0,
        insulin: parseInt(row.insulin || row.Insulin || '0') || 0,
        bmi: parseFloat(row.bmi || row.BMI || '0') || 0,
        diabetesFamily: row.diabetic_family === 'true' || row.diabetic_family === '1' || 
                        row['Diabetic Family'] === 'true' || row['Diabetic Family'] === '1' || false,
        age: parseInt(row.age || row.Age || '0') || 0,
        date: row.created_at || row.date || new Date().toISOString()
      }));

      // Validate data
      const validData = processedData.filter(record => 
        record.glucose > 0 && record.bloodPressure > 0 && record.bmi > 0 && record.age > 0
      );

      if (validData.length === 0) {
        alert('No valid records found in CSV. Please check the format.');
        setCsvProcessing(false);
        return;
      }

      // Call the API
      await addAssessmentsBulk(validData);
      alert(`Successfully processed ${validData.length} records from CSV`);
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert('Error processing CSV data');
    } finally {
      setCsvProcessing(false);
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
              {csvProcessing && (
                <p className="text-blue-600 mt-2">Processing CSV...</p>
              )}
              {csvPreview.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Data Preview (first 5 rows):</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          {Object.keys(csvPreview[0]).map((key) => (
                            <th key={key} className="px-2 py-1 border border-gray-300 text-left font-medium">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {Object.values(row).map((value: any, cellIndex) => (
                              <td key={cellIndex} className="px-2 py-1 border border-gray-300">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Total records: {csvData.length}
                  </p>
                </div>
              )}
              <button
                onClick={handleSubmitCsv}
                disabled={csvProcessing || csvData.length === 0}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {csvProcessing ? 'Processing...' : `Process ${csvData.length} Records`}
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