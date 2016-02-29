@echo off
cd /d %~dp0
cls
echo.
echo.
echo Installing dependencies, please wait...
call npm install
cls
echo.
echo.
echo All dependencies installed successfully...
echo.
echo Press any key to exit...
pause >nul 2<&1
