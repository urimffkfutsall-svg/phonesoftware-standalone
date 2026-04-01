"""PhoneSoftware - Database connection (standalone)"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path

# Load .env manually
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key.strip()] = value.strip()

mongo_url = os.environ.get("MONGO_URL", "mongodb+srv://urimi1806:1806@cluster0.3jzigcr.mongodb.net/?appName=Cluster0")
db_name = os.environ.get("DB_NAME", "phonesoftware_db")

print(f"[DB] Connecting to: {mongo_url[:50]}...")

_client = AsyncIOMotorClient(mongo_url, tls=True, tlsCAFile=__import__("certifi").where())
_db = _client[db_name]

ps_tenants = _db["ps_tenants"]
ps_users = _db["ps_users"]
ps_customers = _db["ps_customers"]
ps_repairs = _db["ps_repairs"]
ps_inventory = _db["ps_inventory"]
ps_stock_movements = _db["ps_stock_movements"]
ps_sales = _db["ps_sales"]
ps_notifications = _db["ps_notifications"]
ps_audit_logs = _db["ps_audit_logs"]
pos_users = _db["users"]


async def init_ps_indexes():
    try:
        await ps_tenants.create_index("name", unique=True)
        await ps_tenants.create_index("email", unique=True)
        await ps_users.create_index([("username", 1), ("tenant_id", 1)], unique=True)
        await ps_customers.create_index([("phone", 1), ("tenant_id", 1)])
        await ps_repairs.create_index("ticket_number", unique=True)
        await ps_repairs.create_index([("tenant_id", 1), ("status", 1)])
        await ps_inventory.create_index([("tenant_id", 1), ("category", 1)])
        await ps_sales.create_index("sale_number", unique=True)
    except Exception as e:
        print(f"Index warning: {e}")



