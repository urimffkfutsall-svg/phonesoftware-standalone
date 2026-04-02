@echo off
title PhoneSoftware Builder
echo ========================================
echo    PhoneSoftware - Windows Build Tool
echo ========================================
echo.
echo [1/3] Building Python backend...
cd backend
pyinstaller server.spec --distpath ../backend-dist --workpath ../build-temp/backend --clean -y
if errorlevel 1 (
    echo ERROR: Backend build failed!
    pause & exit /b 1
)
cd ..
echo.
echo [2/3] Building React frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause & exit /b 1
)
echo.
echo [3/3] Packaging Electron app...
call npx electron-builder --win
if errorlevel 1 (
    echo ERROR: Electron build failed!
    pause & exit /b 1
)
cd ..
echo.
echo ========================================
echo  BUILD COMPLETE!
echo  Installer: frontend/dist/
echo ========================================
pause