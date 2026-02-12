from fastapi import APIRouter, HTTPException
from database import get_db
from models.schemas import PatientCreate, PatientUpdate
from utils.auth import hash_password
from utils.serializers import serialize_doc
from bson import ObjectId

router = APIRouter(prefix="/patients", tags=["Patients"])


def valid_oid(id):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid patient ID")
    return ObjectId(id)


@router.get("")
async def list_patients():
    db = get_db()
    patients = await db.patients.find({}, {"password_hash": 0}).to_list(1000)

    result = []
    for p in patients:
        pid = p["_id"]
        appt_count = await db.appointments.count_documents({"patient_id": str(pid)})
        rx_count = await db.prescriptions.count_documents({"patient_id": str(pid)})
        doc = serialize_doc(p)
        doc["appointments"] = [None] * appt_count
        doc["prescriptions"] = [None] * rx_count
        result.append(doc)

    return result


@router.get("/{patient_id}")
async def get_patient(patient_id: str):
    db = get_db()
    patient = await db.patients.find_one(
        {"_id": valid_oid(patient_id)}, {"password_hash": 0}
    )
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return serialize_doc(patient)


@router.post("", status_code=201)
async def create_patient(body: PatientCreate):
    db = get_db()

    existing = await db.patients.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=409, detail="A patient with this email already exists")

    doc = {
        "name": body.name,
        "email": body.email,
        "password_hash": hash_password(body.password),
    }

    result = await db.patients.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    del doc["password_hash"]
    return doc


@router.put("/{patient_id}")
async def update_patient(patient_id: str, body: PatientUpdate):
    db = get_db()
    oid = valid_oid(patient_id)

    update = {}
    if body.name is not None:
        update["name"] = body.name
    if body.email is not None:
        existing = await db.patients.find_one({"email": body.email, "_id": {"$ne": oid}})
        if existing:
            raise HTTPException(status_code=409, detail="Email already in use")
        update["email"] = body.email
    if body.password is not None:
        update["password_hash"] = hash_password(body.password)

    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db.patients.update_one({"_id": oid}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient = await db.patients.find_one({"_id": oid}, {"password_hash": 0})
    return serialize_doc(patient)
