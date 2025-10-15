import joblib
import numpy as np

# Load model, scaler, PCA
model = joblib.load("app/ml/trained_model.pkl")

def predict_risk(data: dict) -> dict:
    X = np.array([[data["pregnancies"], data["glucose"], data["blood_pressure"],
                   data["insulin"], data["bmi"], data["diabetic_family"], data["age"],
                   (data["bmi"] / data["age"])]])

    # Predict probability
    proba = model.predict_proba(X)[:, 1]
    risk = float(proba[0])

    if risk <= 0.33:
        label = "Low Risk"
    elif risk <= 0.66:
        label = "Medium Risk"
    else:
        label = "High Risk"

    return {"outcome": label, "prediction_prob": round(risk * 100, 2)}
