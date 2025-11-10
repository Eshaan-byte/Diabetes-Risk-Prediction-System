import joblib
import numpy as np

# List of exported models
model_files = {
    "logisticregression": "app/ml/model_LogisticRegression.pkl",
    "randomforest": "app/ml/model_RandomForest.pkl",
    "svc": "app/ml/model_SVC.pkl",
    "knn": "app/ml/model_KNN.pkl",
    "mlp": "app/ml/model_MLP.pkl",
    "xgboost": "app/ml/model_XGBoost.pkl"
}

# Load all models
models = {name: joblib.load(path) for name, path in model_files.items()}

# Helper function to convert probability to risk label
def risk_label(risk: float) -> str:
    if risk <= 0.33:
        return "Low Risk"
    elif risk <= 0.66:
        return "Medium Risk"
    else:
        return "High Risk"

def predict_risk(data: dict) -> dict:
    X = np.array([[data["pregnancies"], data["glucose"], data["blood_pressure"],
                   data["insulin"], data["bmi"], data["diabetic_family"], data["age"],
                   (data["bmi"] / data["age"])]])
    
    results = {}
    
    for name, model in models.items():
        proba = np.array(model.predict_proba(X))[:, 1]
        risk = float(proba[0])

        # Use helper to get label
        label = risk_label(risk)

        results[f"outcome_{name}"] = label
        results[f"prediction_prob_{name}"] = round(risk * 100, 2)
    
    return results
