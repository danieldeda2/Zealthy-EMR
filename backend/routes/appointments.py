from fastapi import APIRouter, HTTPException
from database import get_db
from models.schemas import AppointmentCreate, AppointmentUpdate
from utils.serializers import serialize_doc, serialize_list
from bson import ObjectId

router = APIRouter(prefix="/patients/{patient_id}/appointments", tags=["Appointments"])


def valid_oid(id, label="ID"):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail=f"Invalid {label}")
    return ObjectId(id)


@router.get("")
async def list_appointments(patient_id: str):
    db = get_db()
    valid_oid(patient_id, "patient ID")
    appointments = await db.appointments.find({"patient_id": patient_id}).to_list(1000)
    return serialize_list(appointments)


@router.post("", status_code=201)
async def create_appointment(patient_id: str, body: AppointmentCreate):
    db = get_db()
    patient = await db.patients.find_one({"_id": valid_oid(patient_id, "patient ID")})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doc = {
        "patient_id": patient_id,
        "provider": body.provider,
        "datetime": body.datetime,
        "repeat": body.repeat,
        "end_date": body.end_date,
    }

    result = await db.appointments.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.put("/{appointment_id}")
async def update_appointment(patient_id: str, appointment_id: str, body: AppointmentUpdate):
    db = get_db()
    oid = valid_oid(appointment_id, "appointment ID")

    update = {}
    if body.provider is not None:
        update["provider"] = body.provider
    if body.datetime is not None:
        update["datetime"] = body.datetime
    if body.repeat is not None:
        update["repeat"] = body.repeat
    if "end_date" in body.model_fields_set:
        update["end_date"] = body.end_date

    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db.appointments.update_one(
        {"_id": oid, "patient_id": patient_id}, {"$set": update}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt = await db.appointments.find_one({"_id": oid})
    return serialize_doc(appt)


@router.delete("/{appointment_id}")
async def delete_appointment(patient_id: str, appointment_id: str):
    db = get_db()
    oid = valid_oid(appointment_id, "appointment ID")
    result = await db.appointments.delete_one({"_id": oid, "patient_id": patient_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted"}
