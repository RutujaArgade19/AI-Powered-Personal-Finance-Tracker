from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, transactions, insights

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Finance Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
app.include_router(insights.router, prefix="/insights", tags=["insights"])

@app.get("/")
def root():
    return {"message": "AI Finance Tracker API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
