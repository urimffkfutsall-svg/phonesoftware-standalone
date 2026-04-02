import os, json

# Create frontend/assets folder
os.makedirs('frontend/assets', exist_ok=True)

# Create PyInstaller spec for backend
spec_content = [
    '# -*- mode: python ; coding: utf-8 -*-',
    'import os',
    'block_cipher = None',
    'a = Analysis(',
    "    ['server.py'],",
    "    pathex=['.'],",
    '    binaries=[],',
    '    datas=[("routers", "routers")],',
    '    hiddenimports=[',
    '        "uvicorn.logging","uvicorn.loops","uvicorn.loops.auto",',
    '        "uvicorn.protocols","uvicorn.protocols.http","uvicorn.protocols.http.auto",',
    '        "uvicorn.lifespan","uvicorn.lifespan.on",',
    '        "motor","pymongo","jwt","bcrypt","fastapi","pydantic",',
    '        "email_validator","python_multipart","passlib","passlib.handlers.bcrypt",',
    '    ],',
    '    hookspath=[],',
    '    runtime_hooks=[],',
    '    excludes=[],',
    '    cipher=block_cipher,',
    ')',
    'pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)',
    'exe = EXE(',
    '    pyz, a.scripts, a.binaries, a.zipfiles, a.datas,',
    "    name='server',",
    '    debug=False,',
    '    strip=False,',
    '    upx=True,',
    '    console=True,',
    "    icon='../frontend/assets/icon.ico' if os.path.exists('../frontend/assets/icon.ico') else None",
    ')',
]
with open('backend/server.spec', 'w', encoding='utf-8') as f:
    f.write('\n'.join(spec_content))
print("backend/server.spec created!")

# Create build_windows.bat
bat = [
    '@echo off',
    'title PhoneSoftware Builder',
    'echo ========================================',
    'echo    PhoneSoftware - Windows Build Tool',
    'echo ========================================',
    'echo.',
    'echo [1/3] Building Python backend...',
    'cd backend',
    'pyinstaller server.spec --distpath ../backend-dist --workpath ../build-temp/backend --clean -y',
    'if errorlevel 1 (',
    '    echo ERROR: Backend build failed!',
    '    pause & exit /b 1',
    ')',
    'cd ..',
    'echo.',
    'echo [2/3] Building React frontend...',
    'cd frontend',
    'call npm run build',
    'if errorlevel 1 (',
    '    echo ERROR: Frontend build failed!',
    '    pause & exit /b 1',
    ')',
    'echo.',
    'echo [3/3] Packaging Electron app...',
    'call npx electron-builder --win',
    'if errorlevel 1 (',
    '    echo ERROR: Electron build failed!',
    '    pause & exit /b 1',
    ')',
    'cd ..',
    'echo.',
    'echo ========================================',
    'echo  BUILD COMPLETE!',
    'echo  Installer: frontend/dist/',
    'echo ========================================',
    'pause',
]
with open('build_windows.bat', 'w', encoding='utf-8') as f:
    f.write('\n'.join(bat))
print("build_windows.bat created!")

# Fix electron.js path (it was written to frontend/ correctly)
print("Checking electron.js...")
print("EXISTS:", os.path.exists('frontend/electron.js'))
print("assets dir:", os.path.exists('frontend/assets'))
