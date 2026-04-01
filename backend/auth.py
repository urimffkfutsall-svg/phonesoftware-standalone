"""PhoneSoftware - Authentication utilities (standalone)"""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timezone, timedelta
import jwt, os, bcrypt

JWT_SECRET = os.environ.get("JWT_SECRET", "phonesoftware_secret_key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", 24))
security = HTTPBearer()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_token(user_id: str, role: str, tenant_id: str = None, username: str = "") -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    if tenant_id:
        payload["tenant_id"] = tenant_id
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    import database as db_module
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        user = await db_module.ps_users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        if not user:
            user = await db_module.pos_users.find_one({"id": user_id, "role": "super_admin"}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Perdoruesi nuk u gjet")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token-i ka skaduar")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token i pavlefskem")


async def log_audit(user_id: str, action: str, entity_type: str, entity_id: str, details: dict = None):
    import database as db_module
    from datetime import datetime, timezone
    import uuid
    doc = {
        'id': str(uuid.uuid4()),
        'user_id': user_id,
        'action': action,
        'entity_type': entity_type,
        'entity_id': entity_id,
        'details': details or {},
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db_module.ps_audit_logs.insert_one(doc)
