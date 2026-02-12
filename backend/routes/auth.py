from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from models.schemas import LoginRequest
from utils.auth import verify_password, create_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
async def login(body: LoginRequest):
    db = get_db()
    user = await db.patients.find_one({"email": body.email})

    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(str(user["_id"]))

    return {
        "token": token,
        "user": {
            "_id": str(user["_id"]),
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
        },
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "_id": current_user["_id"],
        "id": current_user["_id"],
        "name": current_user["name"],
        "email": current_user["email"],
    }
