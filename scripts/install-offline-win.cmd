@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "PS1=%SCRIPT_DIR%install-offline-win.ps1"

if not exist "%PS1%" (
  echo Missing install-offline-win.ps1 next to this installer. 1>&2
  pause
  exit /b 1
)

set "PREFIX=%USERPROFILE%\.openclaw-offline"
set "BIN_DIR=%USERPROFILE%\.local\bin"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS1%" -Prefix "%PREFIX%" -BinDir "%BIN_DIR%"

echo.
pause
