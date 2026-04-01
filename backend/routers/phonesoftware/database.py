"""PhoneSoftware Database Collections - Standalone"""
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

import database as db_module

ps_tenants = db_module.ps_tenants
ps_users = db_module.ps_users
ps_customers = db_module.ps_customers
ps_repairs = db_module.ps_repairs
ps_inventory = db_module.ps_inventory
ps_stock_movements = db_module.ps_stock_movements
ps_sales = db_module.ps_sales
ps_notifications = db_module.ps_notifications
ps_audit_logs = db_module.ps_audit_logs
pos_users = db_module.pos_users

JWT_SECRET = os.environ.get("JWT_SECRET", "phonesoftware_secret_key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
security = HTTPBearer()

async def get_ps_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        user = await ps_users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        if not user:
            user = await pos_users.find_one({"id": user_id, "role": "super_admin"}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Perdoruesi nuk u gjet")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token-i ka skaduar")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token i pavlefskem")
