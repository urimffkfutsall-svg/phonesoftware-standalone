# -*- mode: python ; coding: utf-8 -*-
import os
block_cipher = None
a = Analysis(
    ['server.py'],
    pathex=['.'],
    binaries=[],
    datas=[("routers", "routers")],
    hiddenimports=[
        "uvicorn.logging","uvicorn.loops","uvicorn.loops.auto",
        "uvicorn.protocols","uvicorn.protocols.http","uvicorn.protocols.http.auto",
        "uvicorn.lifespan","uvicorn.lifespan.on",
        "motor","pymongo","jwt","bcrypt","fastapi","pydantic",
        "email_validator","python_multipart","passlib","passlib.handlers.bcrypt",
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    cipher=block_cipher,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)
exe = EXE(
    pyz, a.scripts, a.binaries, a.zipfiles, a.datas,
    name='server',
    debug=False,
    strip=False,
    upx=True,
    console=True,
    icon='../frontend/assets/icon.ico' if os.path.exists('../frontend/assets/icon.ico') else None
)