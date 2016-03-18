@echo off

where node >nul
if %ERRORLEVEL% NEQ 0 (

    set SETUP_DIR=%CD%

    echo NodeJs is not installed on this computer...
    echo.
    echo Press any key to download NodeJs...
    pause >nul 2<&1

if not exist "%systemdrive%\Program Files (x86)" (
    start https://nodejs.org/dist/v5.6.0/node-v5.6.0-x86.msi
) else (
    start https://nodejs.org/dist/v5.6.0/node-v5.6.0-x64.msi
)

echo.
echo.
echo Please open the downloaded file and follow the instructions when it's done downloading...
echo Reopen this batch after you have installed NodeJs...
echo.
echo.
echo Press any key to exit...
pause >nul 2<&1
exit

) else (

if exist "node_modules/." (
echo.
echo Dependencies already installed...
echo.
echo.
set /p input="Do you want to update? (Y/N)"
cls
if "%input%" == "N" if "%input%" == "n" (
echo.
echo Press any key to exit...
pause >nul
)
rd /s /q "node_modules/"
)

echo.
echo.
echo Clearing cache... Please wait...
call npm cache clean
cls
echo.
echo.
echo Installing dependencies, please wait...
call npm install
cls
echo.
echo.
echo Installed successfully...

cls
echo.
echo.
echo All dependencies installed successfully...
echo.
echo Press any key to exit...
pause >nul
)
