from fastapi import APIRouter
from database import get_db

router = APIRouter(prefix="/reference", tags=["Reference Data"])


@router.get("/medications")
async def get_medications():
    db = get_db()
    ref = await db.reference.find_one({"type": "medications"})
    if ref:
        return ref["values"]
    return []


@router.get("/dosages")
async def get_dosages():
    db = get_db()
    ref = await db.reference.find_one({"type": "dosages"})
    if ref:
        return ref["values"]
    return []
