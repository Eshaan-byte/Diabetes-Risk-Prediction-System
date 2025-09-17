from fastapi import FastAPI
from app.routes import auth, records, prediction

app = FastAPI(title="Health Records API", version="1.0.0")

# Include route modules
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(records.router, prefix="/records", tags=["Records"])
app.include_router(prediction.router, prefix="/predict", tags=["Prediction"])

@app.get("/")
def root():
    return {"message": "Health Records API is running 🚀"}