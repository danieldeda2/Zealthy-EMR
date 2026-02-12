import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import connect_db, close_db
from routes import auth, patients, appointments, prescriptions, reference

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Zealthy Mini-EMR API",
    description="Backend API for the Zealthy EMR & Patient Portal",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow local dev + deployed frontend
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [
    "http://localhost:3000",
    frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(prescriptions.router, prefix="/api")
app.include_router(reference.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "zealthy-emr-api"}
