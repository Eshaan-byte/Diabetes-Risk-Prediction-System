import { createContext, useContext, useState, useEffect } from "react";

type ModelKey =
  | "xgboost"
  | "randomforest"
  | "logisticregression"
  | "svc"
  | "knn"
  | "mlp";

interface ModelModeContextType {
  model: ModelKey;
  setModel: (m: ModelKey) => void;
}

const ModelModeContext = createContext<ModelModeContextType | null>(null);

export const ModelModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [model, setModelState] = useState<ModelKey>("xgboost");

  useEffect(() => {
    const saved = localStorage.getItem("mlModel") as ModelKey | null;
    if (saved) setModelState(saved);
  }, []);

  const setModel = (m: ModelKey) => {
    localStorage.setItem("mlModel", m);
    setModelState(m);
  };

  return (
    <ModelModeContext.Provider value={{ model, setModel }}>
      {children}
    </ModelModeContext.Provider>
  );
};

export const useModelMode = () => {
  const ctx = useContext(ModelModeContext);
  if (!ctx) throw new Error("useModelMode must be used inside ModelModeProvider");
  return ctx;
};
