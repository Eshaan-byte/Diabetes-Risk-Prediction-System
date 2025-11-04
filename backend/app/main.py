from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, records, prediction

app = FastAPI(title="Health Records API", version="1.0.0")

# CORS setup
origins = [
    "http://localhost:5173",   # local frontend
    "http://127.0.0.1:5173",
    "https://your-frontend-domain.com"  # production Frontend TBA
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(records.router, prefix="/records", tags=["Records"])
app.include_router(prediction.router, prefix="/predict", tags=["Prediction"])

@app.get("/")
def root():
    return {"message": "Health Records API is running"}


#Run the uvicorn FastAPI
#py -m uvicorn app.main:app --reload