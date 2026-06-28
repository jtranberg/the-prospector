@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0.."

set BACKUP_DIR=%CD%\backups
set ENV_FILE=%CD%\.env
set RESTORE_DB=prospector_restore_test

if not exist "%ENV_FILE%" (
  echo Could not find .env file at:
  echo %ENV_FILE%
  pause
  exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
  if "%%A"=="MONGODB_URI" set MONGODB_URI=%%B
)

if "%MONGODB_URI%"=="" (
  echo MONGODB_URI was not found in .env
  pause
  exit /b 1
)

echo ===============================
echo Prospector Restore TEST
echo ===============================
echo.
echo Available backups:
dir /b "%BACKUP_DIR%\*.archive.gz"
echo.

set /p BACKUP_FILE=Enter backup filename exactly: 

if not exist "%BACKUP_DIR%\%BACKUP_FILE%" (
  echo Backup file not found.
  pause
  exit /b 1
)

echo.
echo Restoring to SAFE TEST database:
echo %RESTORE_DB%
echo.

mongorestore --uri="%MONGODB_URI%" --gzip --archive="%BACKUP_DIR%\%BACKUP_FILE%" --nsFrom="test.*" --nsTo="%RESTORE_DB%.*"

if %ERRORLEVEL% EQU 0 (
  echo.
  echo Restore test completed successfully.
  echo Check Atlas for database: %RESTORE_DB%
) else (
  echo.
  echo Restore failed.
)

echo.
pause