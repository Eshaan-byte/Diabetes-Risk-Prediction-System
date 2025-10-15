import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function ReviewRecords() {
  const { assessments, deleteAssessment } = useData();
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

  const handleView = (id: string) => {
    setSelectedRecord(selectedRecord === id ? null : id);
  };

  const handleEdit = (id: string) => {
    // In a real app, this would navigate to an edit form
    console.log('Edit record:', id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteAssessment(id);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Prepare chart data
  const riskTrendData = assessments.map(a => ({
    date: format(new Date(a.date!), 'dd/MM/yyyy'),
    risk: a.riskPercentage
  }));

  const bmiTrendData = assessments.map(a => ({
    date: format(new Date(a.date!), 'dd/MM/yyyy'),
    bmi: a.bmi
  }));

  const glucoseTrendData = assessments.map(a => ({
    date: format(new Date(a.date!), 'dd/MM/yyyy'),
    glucose: a.glucose
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Review Historical Records</h1>
        <p className="text-gray-600">View and analyze your previous diabetes risk assessments</p>
      </div>

      {/* Assessment History Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessment History</h2>
          <p className="text-gray-600">Click on any record to view detailed analysis</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BMI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Glucose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Pressure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assessments.map((assessment) => (
                <React.Fragment key={assessment.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(new Date(assessment.date!), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(assessment.riskLevel)}`}>
                        {assessment.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assessment.riskPercentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assessment.bmi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assessment.glucose} mg/dL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assessment.bloodPressure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleView(assessment.id!)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(assessment.id!)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(assessment.id!)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Detailed View */}
                  {selectedRecord === assessment.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">Detailed Assessment Data</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Pregnancies:</span>
                              <p className="text-gray-900">{assessment.pregnancies || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Insulin Level:</span>
                              <p className="text-gray-900">{assessment.insulin || 'N/A'} μU/mL</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Diabetic Family:</span>
                              <p className="text-gray-900">{assessment.diabetesFamily != null ? assessment.diabetesFamily ? "True" : "False" : "N/A"}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Age:</span>
                              <p className="text-gray-900">{assessment.age} years</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        {/* Glucose Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-purple-600 mb-4">Glucose Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={glucoseTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" interval="preserveStartEnd" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="glucose" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}