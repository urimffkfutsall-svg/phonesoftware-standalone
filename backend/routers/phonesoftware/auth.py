"""PhoneSoftware Authentication Routes"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from dateutil import parser as date_parser

from .database import ps_tenants, ps_users
from .models import PSLoginRequest, PSTokenResponse, PSUserResponse, PSUserRole
from auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/phonesoftware/auth", tags=["PhoneSoftware Auth"])


@router.post("/login", response_model=PSTokenResponse)
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt as pyjwt

_bearer = HTTPBearer(auto_error=False)

async def get_ps_current_user(credentials: HTTPAuthorizationCredentials = Depends(_bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Token mungon")
    try:
        secret = os.environ.get("JWT_SECRET", "phonesoftware_secret_2024")
        payload = pyjwt.decode(credentials.credentials, secret, algorithms=["HS256"])
        user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalid")
        user = await ps_users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Perdoruesi nuk u gjet")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token invalid: {str(e)}")


async def ps_login(request: PSLoginRequest):
    """Login to PhoneSoftware"""
    import database as db_module
    super_admin = await db_module.pos_users.find_one(
        {"username": request.username, "role": "super_admin"},
        {"_id": 0}
    )

    if super_admin:
        if not verify_password(request.password, super_admin.get("password_hash", "")):
            raise HTTPException(status_code=401, detail="Kredencialet e gabuara")
        token = create_token(
            user_id=super_admin["id"],
            username=super_admin.get("username", ""),
            role="super_admin",
            tenant_id=None
        )
        created_at = super_admin.get("created_at")
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()
        return PSTokenResponse(
            access_token=token,
            user=PSUserResponse(
                id=super_admin["id"],
                username=super_admin["username"],
                full_name=super_admin.get("full_name", "Super Administrator"),
                role=PSUserRole.SUPER_ADMIN,
                is_active=True,
                tenant_id=None,
                created_at=created_at or datetime.now(timezone.utc).isoformat()
            )
        )

    user = await ps_users.find_one({"username": request.username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Kredencialet e gabuara")
    if user.get("role") == "super_admin":
        token = create_token(
            user_id=user["id"],
            username=user.get("username", ""),
            role="super_admin",
            tenant_id=None
        )
        created_at = user.get("created_at")
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()
        return PSTokenResponse(
            access_token=token,
            user=PSUserResponse(
                id=user["id"],
                username=user["username"],
                full_name=user.get("full_name", "Super Administrator"),
                role=PSUserRole.SUPER_ADMIN,
                is_active=True,
                tenant_id=None,
                created_at=created_at or datetime.now(timezone.utc).isoformat()
            )
        )
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Llogaria eshte e caktivizuar")
    if user.get("role") != "super_admin":
        email_verified = user.get("email_verified", False)
        admin_verified = user.get("admin_verified", False)
        if not email_verified and not admin_verified:
            raise HTTPException(status_code=403, detail="Llogaria nuk eshte verifikuar. Kontrolloni emailin tuaj.")
    if user.get("role") != "super_admin":
        email_verified = user.get("email_verified", False)
        admin_verified = user.get("admin_verified", False)
        if not email_verified and not admin_verified:
            raise HTTPException(status_code=403, detail="Llogaria nuk eshte verifikuar. Kontrolloni emailin tuaj.")
    if not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Kredencialet e gabuara")

    tenant_id = user.get("tenant_id")
    if tenant_id:
        tenant = await ps_tenants.find_one({"id": tenant_id}, {"_id": 0})
        if tenant:
            if tenant.get("status") == "suspended":
                raise HTTPException(status_code=403, detail="Firma juaj eshte pezulluar. Kontaktoni administratorin.")
            subscription_expires = tenant.get("subscription_expires")
            if subscription_expires:
                try:
                    if isinstance(subscription_expires, str):
                        expires_date = date_parser.parse(subscription_expires)
                    else:
                        expires_date = subscription_expires
                    if expires_date.tzinfo is None:
                        expires_date = expires_date.replace(tzinfo=timezone.utc)
                    now = datetime.now(timezone.utc)
                    if expires_date < now:
                        days_expired = (now - expires_date).days
                        raise HTTPException(status_code=402, detail=f"SUBSCRIPTION_EXPIRED|{days_expired}")
                except HTTPException:
                    raise
                except Exception:
                    pass

    token = create_token(
        user_id=user["id"],
        username=user.get("username", ""),
        role=user["role"],
        tenant_id=tenant_id
    )
    created_at = user.get("created_at")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()

    return PSTokenResponse(
        access_token=token,
        user=PSUserResponse(
            id=user["id"],
            username=user["username"],
            full_name=user.get("full_name", ""),
            role=user["role"],
            phone=user.get("phone"),
            email=user.get("email"),
            specialization=user.get("specialization"),
            is_active=user.get("is_active", True),
            tenant_id=user.get("tenant_id"),
            created_at=created_at or ""
        )
    )


@router.get("/me", response_model=PSUserResponse)
async def get_ps_me(current_user: dict = Depends(get_current_user)):
    """Get current PhoneSoftware user info"""
    created_at = current_user.get("created_at")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    return PSUserResponse(
        id=current_user["id"],
        username=current_user["username"],
        full_name=current_user.get("full_name", ""),
        role=current_user.get("role", "staff"),
        phone=current_user.get("phone"),
        email=current_user.get("email"),
        specialization=current_user.get("specialization"),
        is_active=current_user.get("is_active", True),
        tenant_id=current_user.get("tenant_id"),
        created_at=created_at or ""
    )


from pydantic import BaseModel
from typing import Optional
import uuid, smtplib, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class PSRegisterRequest(BaseModel):
    emri: str
    mbiemri: str
    emri_firmes: str
    username: str
    password: str
    telefoni: str
    email: str
    shteti: str
    qyteti: str

def send_verification_email(to_email: str, token: str, full_name: str):
    try:
        email_user = os.environ.get("EMAIL_USER", "")
        email_pass = os.environ.get("EMAIL_PASS", "")
        frontend_url = os.environ.get("FRONTEND_URL", "https://phonesoftware-frontend.onrender.com")
        if not email_user or not email_pass:
            return False
        verify_url = f"{frontend_url}/#/phonesoftware/verify-email/{token}"
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Verifikoni emailin tuaj - PhoneSoftware"
        msg["From"] = email_user
        msg["To"] = to_email
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
          <div style="background:#00a79d;padding:20px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0">PhoneSoftware</h1>
          </div>
          <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px">
            <h2>Pershendetje, {full_name}!</h2>
            <p>Faleminderit per regjistrim. Klikoni butonin me poshte per te verifikuar emailin tuaj:</p>
            <div style="text-align:center;margin:30px 0">
              <a href="{verify_url}" style="background:#00a79d;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
                Verifiko Emailin
              </a>
            </div>
            <p style="color:#666;font-size:12px">Nese nuk u regjistruat ju, injoroni kete email.</p>
          </div>
        </div>
        """
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(email_user, email_pass)
            server.sendmail(email_user, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

@router.post("/register")
async def ps_register(request: PSRegisterRequest):
    existing = await ps_users.find_one({"username": request.username})
    if existing:
        raise HTTPException(status_code=400, detail="Ky username eshte i zene")
    existing_email = await ps_users.find_one({"email": request.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Ky email eshte i regjistruar")
    verify_token = str(uuid.uuid4())
    tenant_id = str(uuid.uuid4())
    await ps_tenants.insert_one({
        "id": tenant_id,
        "emri_firmes": request.emri_firmes,
        "shteti": request.shteti,
        "qyteti": request.qyteti,
        "telefoni": request.telefoni,
        "email": request.email,
        "status": "pending",
        "email_verified": True,
        "admin_verified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    new_user = {
        "id": str(uuid.uuid4()),
        "username": request.username,
        "password_hash": hash_password(request.password),
        "full_name": f"{request.emri} {request.mbiemri}",
        "email": request.email,
        "phone": request.telefoni,
        "role": "admin",
        "is_active": True,
        "email_verified": True,
        "admin_verified": False,
        "verify_token": verify_token,
        "tenant_id": tenant_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await ps_users.insert_one(new_user)
    full_name = f"{request.emri} {request.mbiemri}"
    send_verification_email(request.email, verify_token, full_name)
    return {"message": "Regjistrimi u krye me sukses. Kontrolloni emailin per verifikim."}

@router.get("/verify-email/{token}")
async def verify_email(token: str):
    user = await ps_users.find_one({"verify_token": token})
    if not user:
        raise HTTPException(status_code=404, detail="Token invalid ose i skaduar")
    await ps_users.update_one(
        {"verify_token": token},
        {"": {"email_verified": True, "verify_token": None}}
    )
    if user.get("tenant_id"):
        await ps_tenants.update_one(
            {"id": user["tenant_id"]},
            {"": {"email_verified": True, "status": "active"}}
        )
    return {"message": "Emaili u verifikua me sukses! Tani mund te kyqeni."}

@router.get("/admin/tenants")
async def get_all_tenants():
    tenants = await ps_tenants.find({}, {"_id": 0}).to_list(1000)
    for t in tenants:
        user = await ps_users.find_one({"tenant_id": t["id"], "role": "admin"}, {"_id": 0})
        if user:
            t["owner_username"] = user.get("username", "")
            t["owner_name"] = user.get("full_name", "")
    return tenants

@router.put("/admin/tenants/{tenant_id}")
async def update_tenant(tenant_id: str, data: dict):
    await ps_tenants.update_one({"id": tenant_id}, {"": data})
    return {"message": "U ndryshua"}

@router.delete("/admin/tenants/{tenant_id}")
async def delete_tenant(tenant_id: str):
    await ps_tenants.delete_one({"id": tenant_id})
    await ps_users.delete_many({"tenant_id": tenant_id})
    return {"message": "U fshi"}

@router.post("/admin/tenants/{tenant_id}/verify")
async def admin_verify_tenant(tenant_id: str):
    await ps_tenants.update_one({"id": tenant_id}, {"": {"admin_verified": True, "status": "active"}})
    await ps_users.update_many({"tenant_id": tenant_id}, {"": {"admin_verified": True}})
    return {"message": "Firma u verifikua nga administratori"}

@router.post("/admin/tenants/{tenant_id}/activate")
async def activate_tenant(tenant_id: str):
    await ps_tenants.update_one({"id": tenant_id}, {"": {"status": "active"}})
    await ps_users.update_many({"tenant_id": tenant_id}, {"": {"is_active": True}})
    return {"message": "Firma u aktivizua"}

@router.post("/admin/tenants/{tenant_id}/suspend")
async def suspend_tenant(tenant_id: str):
    await ps_tenants.update_one({"id": tenant_id}, {"": {"status": "suspended"}})
    return {"message": "Firma u pezullua"}


from pydantic import BaseModel
from typing import Optional
import uuid, smtplib, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class PSRegisterRequest(BaseModel):
    emri: str
    mbiemri: str
    emri_firmes: str
    username: str
    password: str
    telefoni: str
    email: str
    shteti: str
    qyteti: str

def send_verification_email(to_email: str, token: str, full_name: str):
    try:
        email_user = os.environ.get("EMAIL_USER", "")
        email_pass = os.environ.get("EMAIL_PASS", "")
        frontend_url = os.environ.get("FRONTEND_URL", "https://phonesoftware-frontend.onrender.com")
        if not email_user or not email_pass:
            return False
        verify_url = f"{frontend_url}/#/phonesoftware/verify-email/{token}"
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Verifikoni emailin tuaj - PhoneSoftware"
        msg["From"] = email_user
        msg["To"] = to_email
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
          <div style="background:#00a79d;padding:20px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0">PhoneSoftware</h1>
          </div>
          <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px">
            <h2>Pershendetje, {full_name}!</h2>
            <p>Faleminderit per regjistrim. Klikoni butonin me poshte per te verifikuar emailin tuaj:</p>
            <div style="text-align:center;margin:30px 0">
              <a href="{verify_url}" style="background:#00a79d;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
                Verifiko Emailin
              </a>
            </div>
            <p style="color:#666;font-size:12px">Nese nuk u regjistruat ju, injoroni kete email.</p>
          </div>
        </div>
        """
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(email_user, email_pass)
            server.sendmail(email_user, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

@router.post("/register")
async def ps_register(request: PSRegisterRequest):
    existing = await ps_users.find_one({"username": request.username})
    if existing:
        raise HTTPException(status_code=400, detail="Ky username eshte i zene")
    existing_email = await ps_users.find_one({"email": request.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Ky email eshte i regjistruar")
    verify_token = str(uuid.uuid4())
    tenant_id = str(uuid.uuid4())
    await ps_tenants.insert_one({
        "id": tenant_id,
        "emri_firmes": request.emri_firmes,
        "shteti": request.shteti,
        "qyteti": request.qyteti,
        "telefoni": request.telefoni,
        "email": request.email,
        "status": "pending",
        "email_verified": True,
        "admin_verified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    new_user = {
        "id": str(uuid.uuid4()),
        "username": request.username,
        "password_hash": hash_password(request.password),
        "full_name": f"{request.emri} {request.mbiemri}",
        "email": request.email,
        "phone": request.telefoni,
        "role": "admin",
        "is_active": True,
        "email_verified": True,
        "admin_verified": False,
        "verify_token": verify_token,
        "tenant_id": tenant_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await ps_users.insert_one(new_user)
    full_name = f"{request.emri} {request.mbiemri}"
    send_verification_email(request.email, verify_token, full_name)
    return {"message": "Regjistrimi u krye me sukses. Kontrolloni emailin per verifikim."}

@router.get("/verify-email/{token}")
async def verify_email(token: str):
    user = await ps_users.find_one({"verify_token": token})
    if not user:
        raise HTTPException(status_code=404, detail="Token invalid ose i skaduar")
    await ps_users.update_one(
        {"verify_token": token},
        {"": {"email_verified": True, "verify_token": None}}
    )
    if user.get("tenant_id"):
        await ps_tenants.update_one(
            {"id": user["tenant_id"]},
            {"": {"email_verified": True, "status": "active"}}
        )
    return {"message": "Emaili u verifikua me sukses! Tani mund te kyqeni."}

@router.get("/admin/tenants")
async def get_all_tenants():
    tenants = await ps_tenants.find({}, {"_id": 0}).to_list(1000)
    for t in tenants:
        user = await ps_users.find_one({"tenant_id": t["id"], "role": "admin"}, {"_id": 0})
        if user:
            t["owner_username"] = user.get("username", "")
            t["owner_name"] = user.get("full_name", "")
    return tenants

@router.put("/admin/tenants/{tenant_id}")
async def update_tenant(tenant_id: str, data: dict):
    await ps_tenants.update_one({"id": tenant_id}, {"": data})
    return {"message": "U ndryshua"}

@router.delete("/admin/tenants/{tenant_id}")
async def delete_tenant(tenant_id: str):
    await ps_tenants.delete_one({"id": tenant_id})
    await ps_users.delete_many({"tenant_id": tenant_id})
    return {"message": "U fshi"}

@router.post("/admin/tenants/{tenant_id}/verify")
async def admin_verify_tenant(tenant_id: str):
    await ps_tenants.update_one({"id": tenant_id}, {"": {"admin_verified": True, "status": "active"}})
    await ps_users.update_many({"tenant_id": tenant_id}, {"": {"admin_verified": True}})
    return {"message": "Firma u verifikua nga administratori"}

@router.post("/admin/tenants/{tenant_id}/activate")
async def activate_tenant(tenant_id: str):
    await ps_tenants.update_one({"id": tenant_id}, {"": {"status": "active"}})
    await ps_users.update_many({"tenant_id": tenant_id}, {"": {"is_active": True}})
    return {"message": "Firma u aktivizua"}

@router.post("/admin/tenants/{tenant_id}/suspend")
async def suspend_tenant(tenant_id: str):
    await ps_tenants.update_one({"id": tenant_id}, {"": {"status": "suspended"}})
    return {"message": "Firma u pezullua"}
