import React from "react";
import { useModelMode } from "../contexts/ModelModeContext";

const modelLabels: Record<string, string> = {
  xgboost: "XGBoost",
  randomforest: "Random Forest",
  logisticregression: "Logistic Regression",
  svc: "Suppor Vector Classification (SVC)",
  knn: "K-Nearest Neighbors",
  mlp: "Multilayer Perceptron (MLP)",
};

export default function ModelSelector() {
  const { model, setModel } = useModelMode();

  return (
    <select
      value={model}
      onChange={(e) => setModel(e.target.value as any)}
      className="bg-white border border-gray-300 text-gray-700 rounded-lg px-3 py-2 cursor-pointer shadow-sm hover:border-gray-400"
    >
      {Object.entries(modelLabels).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
