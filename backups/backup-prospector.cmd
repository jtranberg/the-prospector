@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0.."

set BACKUP_DIR=%CD%\backups
set DB_NAME=test
set ENV_FILE=%CD%\.env

if not exist "%ENV_FILE%" (
  echo Could not find .env file at:
  echo %ENV_FILE%
  echo.
  pause
  exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
  if "%%A"=="MONGODB_URI" set MONGODB_URI=%%B
)

if "%MONGODB_URI%"=="" (
  echo MONGODB_URI was not found in .env
  echo.
  pause
  exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f %%A in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd-HHmm"') do set TIMESTAMP=%%A

set FILE_NAME=Prospector-%TIMESTAMP%.archive.gz

echo ===============================
echo Dave Hall's Prospector Backup
echo ===============================
echo.
echo Project folder:
echo %CD%
echo.
echo Backup file:
echo %BACKUP_DIR%\%FILE_NAME%
echo.

mongodump --uri="%MONGODB_URI%" --db=%DB_NAME% --gzip --archive="%BACKUP_DIR%\%FILE_NAME%"

if %ERRORLEVEL% EQU 0 (
  echo.
  echo Backup completed successfully.
) else (
  echo.
  echo Backup failed.
)

echo.
pause