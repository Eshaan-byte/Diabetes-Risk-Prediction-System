import joblib
import numpy as np

# Load model, scaler, PCA
model = joblib.load("app/ml/trained_model.pkl")
scaler = joblib.load("app/ml/scaler.pkl")
pca = joblib.load("app/ml/pca.pkl")

def predict_risk(data: dict) -> dict:
    X = np.array([[data["pregnancies"], data["glucose"], data["bloodPressure"],
                   data["insulin"], data["bMI"], data["diabeticFamily"], data["age"],
                   (data["bMI"] / data["age"])]])
    
    # Reshape, scale, transform
    X_scaled = scaler.transform(X.reshape(1, -1))
    X_pca = pca.transform(X_scaled)

    # Predict probability
    proba = model.predict_proba(X_pca)[:, 1]
    risk = float(proba[0])

    if risk <= 0.33:
        label = "low risk"
    elif risk <= 0.66:
        label = "medium risk"
    else:
        label = "high risk"

    return {"prediction": label, "risk_score": round(risk * 100, 2)}
