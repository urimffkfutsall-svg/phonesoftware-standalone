"""PhoneSoftware Authentication Routes"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from dateutil import parser as date_parser

from .database import ps_tenants, ps_users
from .models import PSLoginRequest, PSTokenResponse, PSUserResponse, PSUserRole
from auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/phonesoftware/auth", tags=["PhoneSoftware Auth"])


@router.post("/login", response_model=PSTokenResponse)
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
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Llogaria eshte e caktivizuar")
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
