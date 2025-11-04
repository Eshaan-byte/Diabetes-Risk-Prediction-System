import React from "react";
import { CheckCheck, Target, Search, Activity } from "lucide-react";
import StatCard from "./StatCard";
import { useModelMode } from "../contexts/ModelModeContext"; // adjust path
import { modelMetrics } from "../modelMetrics";

const ModelMetricsGrid: React.FC = () => {
  const { model } = useModelMode(); // current model from context

  const metrics = modelMetrics[model]; // auto-pick based on mode

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Accuracy"
        value={`${metrics.accuracy}%`}
        subtitle="Model prediction correctness"
        icon={CheckCheck}
        color="bg-rose-500"
      />
      <StatCard
        title="F1-Score"
        value={`${metrics.f1}%`}
        subtitle="Balance of precision & recall"
        icon={Target}
        color="bg-indigo-500"
      />
      <StatCard
        title="Recall"
        value={`${metrics.recall}%`}
        subtitle="Sensitivity to true cases"
        icon={Search}
        color="bg-teal-500"
      />
      <StatCard
        title="ROC-AUC"
        value={`${metrics.rocAuc}%`}
        subtitle="Overall classification performance"
        icon={Activity}
        color="bg-orange-500"
      />
    </div>
  );
};

export default ModelMetricsGrid;
