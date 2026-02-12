from fastapi import APIRouter, HTTPException
from database import get_db
from models.schemas import PrescriptionCreate, PrescriptionUpdate
from utils.serializers import serialize_doc, serialize_list
from bson import ObjectId

router = APIRouter(prefix="/patients/{patient_id}/prescriptions", tags=["Prescriptions"])


def valid_oid(id, label="ID"):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail=f"Invalid {label}")
    return ObjectId(id)


@router.get("")
async def list_prescriptions(patient_id: str):
    db = get_db()
    valid_oid(patient_id, "patient ID")
    prescriptions = await db.prescriptions.find({"patient_id": patient_id}).to_list(1000)
    return serialize_list(prescriptions)


@router.post("", status_code=201)
async def create_prescription(patient_id: str, body: PrescriptionCreate):
    db = get_db()
    patient = await db.patients.find_one({"_id": valid_oid(patient_id, "patient ID")})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doc = {
        "patient_id": patient_id,
        "medication": body.medication,
        "dosage": body.dosage,
        "quantity": body.quantity,
        "refill_on": body.refill_on,
        "refill_schedule": body.refill_schedule,
    }

    result = await db.prescriptions.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.put("/{prescription_id}")
async def update_prescription(patient_id: str, prescription_id: str, body: PrescriptionUpdate):
    db = get_db()
    oid = valid_oid(prescription_id, "prescription ID")

    update = {}
    if body.medication is not None:
        update["medication"] = body.medication
    if body.dosage is not None:
        update["dosage"] = body.dosage
    if body.quantity is not None:
        update["quantity"] = body.quantity
    if body.refill_on is not None:
        update["refill_on"] = body.refill_on
    if body.refill_schedule is not None:
        update["refill_schedule"] = body.refill_schedule

    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db.prescriptions.update_one(
        {"_id": oid, "patient_id": patient_id}, {"$set": update}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prescription not found")

    rx = await db.prescriptions.find_one({"_id": oid})
    return serialize_doc(rx)


@router.delete("/{prescription_id}")
async def delete_prescription(patient_id: str, prescription_id: str):
    db = get_db()
    oid = valid_oid(prescription_id, "prescription ID")
    result = await db.prescriptions.delete_one({"_id": oid, "patient_id": patient_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return {"message": "Prescription deleted"}
