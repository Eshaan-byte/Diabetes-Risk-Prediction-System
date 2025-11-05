import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Save, ArrowLeft } from 'lucide-react';

interface EditFormData {
  pregnancies: string;
  glucose: string;
  bloodPressure: string;
  insulin: string;
  bmi: string;
  diabetesFamily: boolean;
  age: string;
}

export default function EditRecord() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { assessments, updateAssessment } = useData();

  const [formData, setFormData] = useState<EditFormData>({
    pregnancies: '',
    glucose: '',
    bloodPressure: '',
    insulin: '',
    bmi: '',
    diabetesFamily: false,
    age: ''
  });

  const [isLoading, setIsLoading] = useState(false);
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
          age: record.age?.toString() || ''
        });
      } else {
        setRecordFound(false);
      }
    }
  }, [id, assessments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const inputElement = e.target;

    // Get max from the input element
    const max = inputElement.max ? parseFloat(inputElement.max) : Infinity;

    // If value is empty, allow it (for clearing the field)
    if (value === '') {
      setFormData({ ...formData, [name]: value });
      return;
    }

    // Convert value to number
    const newValue = parseFloat(value);

    // Ignore invalid numbers
    if (isNaN(newValue)) {
      return;
    }

    // Prevent negative values
    if (newValue < 0) {
      return;
    }

    // Only enforce max constraint during typing
    // This allows users to type partial values like "1" when trying to reach "150"
    if (newValue > max) {
      return; // Block values above maximum
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const inputElement = e.target;

    // Get min and max from the input element
    const min = inputElement.min ? parseFloat(inputElement.min) : 0;
    const max = inputElement.max ? parseFloat(inputElement.max) : Infinity;

    if (value === '') return;

    const numValue = parseFloat(value);

    if (isNaN(numValue)) return;

    // Clamp value between min and max when user finishes typing
    let clampedValue = numValue;
    if (numValue < min) {
      clampedValue = min;
    } else if (numValue > max) {
      clampedValue = max;
    }

    // Update with clamped value
    if (clampedValue !== numValue) {
      setFormData({ ...formData, [name]: clampedValue.toString() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    setIsLoading(true);

    // Validate required fields
    const requiredFields = ['glucose', 'bloodPressure', 'bmi', 'age'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof EditFormData]);
    
    if (missingFields.length > 0) {
      alert('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedRecord = {
        id,
        pregnancies: parseInt(formData.pregnancies) || 0,
        glucose: parseInt(formData.glucose),
        bloodPressure: parseInt(formData.bloodPressure),
        insulin: parseInt(formData.insulin) || 0,
        bmi: parseFloat(formData.bmi),
        diabetesFamily: formData.diabetesFamily,
        age: parseInt(formData.age),
        // Keep original date and recalculate risk
        date: assessments.find(a => a.id === id)?.date,
      };

      updateAssessment(id, updatedRecord);
      navigate('/review-records');
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Error updating record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/review-records');
  };

  if (!recordFound) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Record Not Found</h1>
        <p className="text-gray-600 mb-6">The record you're trying to edit doesn't exist.</p>
        <button
          onClick={() => navigate('/review-records')}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Records
        </button>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-blue-600">Edit Health Record</h1>
          <p className="text-gray-600">Update your diabetes risk assessment data</p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 border">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Assessment Data</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Pregnancies
            </label>
            <input
              type="number"
              name="pregnancies"
              min={0}
              max={17}
              value={formData.pregnancies}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="Enter # of times pregnant"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter 0 if never pregnant. Min: 0, Max: 17</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Glucose Level (mg/dL) *
            </label>
            <input
              type="number"
              name="glucose"
              min={44}
              max={199}
              value={formData.glucose}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., 95"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">2-hour oral glucose tolerance test. Min: 44, Max: 199</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diastolic Blood Pressure (mmHg) *
            </label>
            <input
              type="number"
              name="bloodPressure"
              min={24}
              max={122}
              value={formData.bloodPressure}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., 70"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Lower number in blood pressure reading. Min: 24, Max: 122</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age (years) *
            </label>
            <input
              type="number"
              name="age"
              min={21}
              max={81}
              value={formData.age}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., 25"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Current age in years. Min: 21, Max: 81</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insulin Level (μU/mL)
            </label>
            <input
              type="number"
              name="insulin"
              min={14}
              max={846}
              value={formData.insulin}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., 80"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">2-hour serum insulin level. Min: 14, Max: 846</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BMI (Body Mass Index) *
            </label>
            <input
              type="number"
              step="0.1"
              name="bmi"
              min={18.2}
              max={67.1}
              value={formData.bmi}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., 32.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Weight (kg) / Height (m)². Min: 18.2, Max: 67.1</p>
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

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Updating...' : 'Update Record'}
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 text-sm text-orange-600">
          * Please fill all required fields with valid values
        </div>
      </form>
    </div>
  );
}