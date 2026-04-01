new_code = '''

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
    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    await ps_tenants_col.insert_one({
        "id": tenant_id,
        "emri_firmes": request.emri_firmes,
        "shteti": request.shteti,
        "qyteti": request.qyteti,
        "telefoni": request.telefoni,
        "email": request.email,
        "status": "pending",
        "email_verified": False,
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
        "email_verified": False,
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
    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    if user.get("tenant_id"):
        await ps_tenants_col.update_one(
            {"id": user["tenant_id"]},
            {"": {"email_verified": True, "status": "active"}}
        )
    return {"message": "Emaili u verifikua me sukses! Tani mund te kyqeni."}

@router.get("/admin/tenants")
async def get_all_tenants():
    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    tenants = await ps_tenants_col.find({}, {"_id": 0}).to_list(1000)
    for t in tenants:
        user = await ps_users.find_one({"tenant_id": t["id"], "role": "admin"}, {"_id": 0})
        if user:
            t["owner_username"] = user.get("username", "")
            t["owner_name"] = user.get("full_name", "")
    return tenants

@router.put("/admin/tenants/{tenant_id}")
async def update_tenant(tenant_id: str, data: dict):
    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    await ps_tenants_col.update_one({"id": tenant_id}, {"": data})
    return {"message": "U ndryshua"}

@router.delete("/admin/tenants/{tenant_id}")
async def delete_tenant(tenant_id: str):
    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    await ps_tenants_col.delete_one({"id": tenant_id})
    await ps_users.delete_many({"tenant_id": tenant_id})
    return {"message": "U fshi"}

@router.post("/admin/tenants/{tenant_id}/verify")
async def admin_verify_tenant(tenant_id: str):
    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    await ps_tenants_col.update_one({"id": tenant_id}, {"": {"admin_verified": True, "status": "active"}})
    await ps_users.update_many({"tenant_id": tenant_id}, {"": {"admin_verified": True}})
    return {"message": "Firma u verifikua nga administratori"}

@router.post("/admin/tenants/{tenant_id}/activate")
async def activate_tenant(tenant_id: str):
    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    await ps_tenants_col.update_one({"id": tenant_id}, {"": {"status": "active"}})
    await ps_users.update_many({"tenant_id": tenant_id}, {"": {"is_active": True}})
    return {"message": "Firma u aktivizua"}

@router.post("/admin/tenants/{tenant_id}/suspend")
async def suspend_tenant(tenant_id: str):
    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    await ps_tenants_col.update_one({"id": tenant_id}, {"": {"status": "suspended"}})
    return {"message": "Firma u pezullua"}
'''

with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Update login to check email/admin verified
old_check = 'if not user.get("is_active", True):\n        raise HTTPException(status_code=401, detail="Llogaria eshte e caktivizuar")'
new_check = '''if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Llogaria eshte e caktivizuar")
    email_verified = user.get("email_verified", False)
    admin_verified = user.get("admin_verified", False)
    if not email_verified and not admin_verified:
        raise HTTPException(status_code=403, detail="Llogaria nuk eshte verifikuar. Kontrolloni emailin tuaj.")'''
c = c.replace(old_check, new_check)
c += new_code

with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)
print('auth.py OK!')
