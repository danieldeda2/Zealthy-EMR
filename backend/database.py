import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "Zealthy"

client = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]
    await db.patients.create_index("email", unique=True)
    print("✓ Connected to MongoDB: zealthy")


async def close_db():
    global client
    if client:
        client.close()
        print("✓ MongoDB connection closed")


def get_db():
    return db
