@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0.."

set BACKUP_DIR=%CD%\backups
set ENV_FILE=%CD%\.env
set DB_NAME=test

if not exist "%ENV_FILE%" (
    echo Could not find .env
    pause
    exit /b
)

for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
    if "%%A"=="MONGODB_URI" set MONGODB_URI=%%B
)

if "%MONGODB_URI%"=="" (
    echo MONGODB_URI not found.
    pause
    exit /b
)

echo.
echo ===========================================
echo        Dave Hall's Prospector
echo          DATABASE RESTORE
echo ===========================================
echo.
echo Available Backups
echo -----------------
dir /b "%BACKUP_DIR%\*.archive.gz"
echo.

set /p BACKUP=Enter backup filename:

if not exist "%BACKUP_DIR%\%BACKUP%" (
    echo.
    echo Backup file not found.
    pause
    exit /b
)

echo.
echo *******************************************
echo WARNING
echo *******************************************
echo.
echo This will DELETE the current database:
echo.
echo      %DB_NAME%
echo.
echo and replace it with:
echo.
echo      %BACKUP%
echo.
echo *******************************************
echo.

set /p CONFIRM=Type RESTORE to continue:

if /I not "%CONFIRM%"=="RESTORE" (
    echo.
    echo Restore cancelled.
    pause
    exit /b
)

echo.
echo Dropping existing database...
mongosh "%MONGODB_URI%" --eval "db.getSiblingDB('%DB_NAME%').dropDatabase()"

echo.
echo Restoring database...
mongorestore ^
 --uri="%MONGODB_URI%" ^
 --gzip ^
 --archive="%BACKUP_DIR%\%BACKUP%"

echo.
echo ===========================================
echo Restore Complete
echo ===========================================
pause