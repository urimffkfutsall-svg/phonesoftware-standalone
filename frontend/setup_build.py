import os

os.makedirs('frontend/assets', exist_ok=True)

# Create PyInstaller spec for backend
spec = """# -*- mode: python ; coding: utf-8 -*-
block_cipher = None

a = Analysis(
    ['server.py'],
    pathex=['.'],
    binaries=[],
    datas=[
        ('routers', 'routers'),
        ('.env', '.') if os.path.exists('.env') else ('', ''),
    ],
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'motor',
        'pymongo',
        'jwt',
        'bcrypt',
        'fastapi',
        'pydantic',
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)
exe = EXE(
    pyz, a.scripts, a.binaries, a.zipfiles, a.datas,
    name='server',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    icon='../frontend/assets/icon.ico'
)
"""

with open('backend/server.spec', 'w', encoding='utf-8') as f:
    f.write(spec)
print("server.spec created!")

# Create build script
build_script = """@echo off
echo Building PhoneSoftware...
echo.
echo Step 1: Building backend...
cd backend
pyinstaller server.spec --distpath ../backend-dist --workpath ../build-temp/backend --clean
cd ..
echo.
echo Step 2: Building frontend...
cd frontend
npm run build
echo.
echo Step 3: Packaging with Electron...
npm run build-electron
cd ..
echo.
echo Build complete! Check frontend/dist/ for installer.
pause
"""

with open('build_windows.bat', 'w', encoding='utf-8') as f:
    f.write(build_script)
print("build_windows.bat created!")
