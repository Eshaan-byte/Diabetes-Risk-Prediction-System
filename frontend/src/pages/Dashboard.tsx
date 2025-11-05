import React from 'react';
import { useData, Assessment } from '../contexts/DataContext';
import { useModelMode } from '../contexts/ModelModeContext';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ModelMetricsGrid from '../components/ModelMetricsGrid';
import { TrendingUp, Users, Activity, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { assessments, getLatestAssessment } = useData();
  const { model } = useModelMode();
  const riskPercentageKey = `riskPercentage_${model}` as keyof Assessment;
  const riskLevelKey = `riskLevel_${model}` as keyof Assessment;
  const latestAssessment = getLatestAssessment();

  // Calculate statistics
  const averageBMI = assessments.reduce((sum, a) => sum + a.bmi, 0) / assessments.length;
  const totalAssessments = assessments.length;
  const latestRiskPercentage = latestAssessment ? Number(latestAssessment[riskPercentageKey] ?? 0) : 0;
  const latestDate = latestAssessment ? format(new Date(latestAssessment.date!), 'dd/MM/yyyy') : '';

  // Prepare chart data
  {/* Risk Trend Over Time */ }
  const riskTrendData = assessments.map(a => ({
    id: a.id,
    date: format(new Date(a.date!), 'dd/MM/yy'),
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

  {/* Risk Level Distribution */ }
  const riskDistributionData = [
    { name: 'Low Risk', value: assessments.filter(a => a[riskLevelKey] === 'Low').length, color: '#10B981' },
    { name: 'Moderate Risk', value: assessments.filter(a => a[riskLevelKey] === 'Moderate').length, color: '#F59E0B' },
    { name: 'High Risk', value: assessments.filter(a => a[riskLevelKey] === 'High').length, color: '#EF4444' }
  ];

  {/* BMI & Glucose Trends */ }
  const bmiGlucoseTrendData = assessments.map(a => ({
    id: a.id,
    date: format(new Date(a.date!), 'dd/MM/yy'),
    bmi: a.bmi,
    glucose: a.glucose / 5 // Scale glucose for better visualization
  }));

  //Prepare offset for BMI & GLUCOSE TRENDS with same dates
  const bmiGlucoseTrendWithOffset = bmiGlucoseTrendData.map((item, index, arr) => {
    // Count previous duplicates
    const duplicateCount = arr.slice(0, index).filter(d => d.date === item.date).length;
    return {
      ...item,
      dateForChart: duplicateCount ? `${item.date} (${duplicateCount})` : item.date
    };
  });

  {/* Health Factor Comparison */ }
  const healthFactorData = [
    { factor: 'Age', current: latestAssessment?.age, optimal: 25 },
    { factor: 'Blood Pressure', current: latestAssessment?.bloodPressure, optimal: 75 },
    { factor: 'BMI', current: latestAssessment?.bmi, optimal: 22 },
    { factor: 'Glucose', current: latestAssessment?.glucose, optimal: 85 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Diabetes Risk Dashboard</h1>
        <p className="text-gray-600">Overview of your diabetes risk assessments and health trends</p>
      </div>

      {/* The model Performances */}
      <ModelMetricsGrid />

      {/* Statistics Cards of User Health Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Diabetes Risk Level"
          value={`${latestRiskPercentage}%`}
          subtitle="Current risk level"
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Assessments"
          value={totalAssessments}
          subtitle="Completed assessments"
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Average BMI"
          value={averageBMI.toFixed(1)}
          subtitle="Body mass index"
          icon={Activity}
          color="bg-yellow-500"
        />
        <StatCard
          title="Last Assessment"
          value={latestDate}
          subtitle="Most recent checkup"
          icon={Calendar}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Trend Over Time */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Trend Over Time</h3>
          <p className="text-sm text-gray-600 mb-4">Your diabetes risk percentage progression. Click the dot for record details</p>
          <div className="h-64">
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

        {/* Risk Level Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
          <p className="text-sm text-gray-600 mb-4">Distribution of your risk assessments</p>
          <div className="h-64">
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

        {/* BMI & Glucose Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI & Glucose Trends</h3>
          <p className="text-sm text-gray-600 mb-4">Key health metrics over time. Click the dot for record details</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bmiGlucoseTrendWithOffset}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateForChart" interval="preserveStartEnd" padding={{ left: 20, right: 20 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bmi" stroke="#10B981" strokeWidth={2} name="BMI"
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
                <Line type="monotone" dataKey="glucose" stroke="#8B5CF6" strokeWidth={2} name="Glucose (scaled)"
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

        {/* Health Factor Comparison */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Factor Comparison</h3>
          <p className="text-sm text-gray-600 mb-4">Current vs. Optimal health metrics</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthFactorData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="factor" type="category" width={100} />
                <YAxis type="number" />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#EF4444" name="Current" />
                <Bar dataKey="optimal" fill="#10B981" name="Optimal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}