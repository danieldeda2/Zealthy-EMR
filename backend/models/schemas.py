from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List


class PatientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)


class AppointmentCreate(BaseModel):
    provider: str = Field(..., min_length=1, max_length=200)
    datetime: str
    repeat: str = Field(..., pattern="^(weekly|monthly)$")
    end_date: Optional[str] = None


class AppointmentUpdate(BaseModel):
    provider: Optional[str] = Field(None, min_length=1, max_length=200)
    datetime: Optional[str] = None
    repeat: Optional[str] = Field(None, pattern="^(weekly|monthly)$")
    end_date: Optional[str] = None


class PrescriptionCreate(BaseModel):
    medication: str = Field(..., min_length=1)
    dosage: str = Field(..., min_length=1)
    quantity: int = Field(..., ge=1)
    refill_on: str
    refill_schedule: str = Field(..., pattern="^(weekly|monthly)$")


class PrescriptionUpdate(BaseModel):
    medication: Optional[str] = Field(None, min_length=1)
    dosage: Optional[str] = Field(None, min_length=1)
    quantity: Optional[int] = Field(None, ge=1)
    refill_on: Optional[str] = None
    refill_schedule: Optional[str] = Field(None, pattern="^(weekly|monthly)$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
