import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "Zealthy"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERS = [
    {
        "name": "Mark Johnson",
        "email": "mark@some-email-provider.net",
        "password": "Password123!",
        "appointments": [
            {
                "provider": "Dr Kim West",
                "datetime": "2025-09-16T16:30:00.000-07:00",
                "repeat": "weekly",
                "end_date": None,
            },
            {
                "provider": "Dr Lin James",
                "datetime": "2025-09-19T18:30:00.000-07:00",
                "repeat": "monthly",
                "end_date": None,
            },
        ],
        "prescriptions": [
            {
                "medication": "Lexapro",
                "dosage": "5mg",
                "quantity": 2,
                "refill_on": "2025-10-05",
                "refill_schedule": "monthly",
            },
            {
                "medication": "Ozempic",
                "dosage": "1mg",
                "quantity": 1,
                "refill_on": "2025-10-10",
                "refill_schedule": "monthly",
            },
        ],
    },
    {
        "name": "Lisa Smith",
        "email": "lisa@some-email-provider.net",
        "password": "Password123!",
        "appointments": [
            {
                "provider": "Dr Sally Field",
                "datetime": "2025-09-22T18:15:00.000-07:00",
                "repeat": "monthly",
                "end_date": None,
            },
            {
                "provider": "Dr Lin James",
                "datetime": "2025-09-25T20:00:00.000-07:00",
                "repeat": "weekly",
                "end_date": None,
            },
        ],
        "prescriptions": [
            {
                "medication": "Metformin",
                "dosage": "500mg",
                "quantity": 2,
                "refill_on": "2025-10-15",
                "refill_schedule": "monthly",
            },
            {
                "medication": "Diovan",
                "dosage": "100mg",
                "quantity": 1,
                "refill_on": "2025-10-25",
                "refill_schedule": "monthly",
            },
        ],
    },
]

MEDICATIONS = ["Diovan", "Lexapro", "Metformin", "Ozempic", "Prozac", "Seroquel", "Tegretol"]
DOSAGES = ["1mg", "2mg", "3mg", "5mg", "10mg", "25mg", "50mg", "100mg", "250mg", "500mg", "1000mg"]


async def seed():
    print("Seeding database...")
    print(f"  Connecting to MongoDB Atlas...")

    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]

    # Clear existing data
    await db.patients.delete_many({})
    await db.appointments.delete_many({})
    await db.prescriptions.delete_many({})
    await db.reference.delete_many({})
    print("  Cleared existing data")

    # Seed users
    for user_data in USERS:
        patient_doc = {
            "name": user_data["name"],
            "email": user_data["email"],
            "password_hash": pwd_context.hash(user_data["password"]),
        }
        result = await db.patients.insert_one(patient_doc)
        patient_id = str(result.inserted_id)
        print(f"  Created patient: {user_data['name']} ({user_data['email']})")

        for appt in user_data["appointments"]:
            await db.appointments.insert_one({"patient_id": patient_id, **appt})
        print(f"    -> {len(user_data['appointments'])} appointments")

        for rx in user_data["prescriptions"]:
            await db.prescriptions.insert_one({"patient_id": patient_id, **rx})
        print(f"    -> {len(user_data['prescriptions'])} prescriptions")

    # Seed reference data
    await db.reference.insert_one({"type": "medications", "values": MEDICATIONS})
    await db.reference.insert_one({"type": "dosages", "values": DOSAGES})
    print("  Seeded reference data (medications + dosages)")

    # Create indexes
    await db.patients.create_index("email", unique=True)
    await db.appointments.create_index("patient_id")
    await db.prescriptions.create_index("patient_id")
    print("  Created indexes")

    print("\nDatabase seeded successfully!")
    print("\nTest credentials:")
    print("  Email:    mark@some-email-provider.net")
    print("  Password: Password123!")
    print("  Email:    lisa@some-email-provider.net")
    print("  Password: Password123!")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
