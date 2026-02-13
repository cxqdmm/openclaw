param(
  [string]$Prefix = "$env:USERPROFILE\.openclaw-offline",
  [string]$BinDir = "$env:USERPROFILE\.local\bin",
  [switch]$NoVerify
)

$ErrorActionPreference = "Stop"

function Write-Err([string]$Message) {
  Write-Host $Message -ForegroundColor Red
}

function Assert-Exists([string]$Path, [string]$Label) {
  if (-not (Test-Path -LiteralPath $Path)) {
    Write-Err "Missing $Label at: $Path"
    exit 1
  }
}

function Get-NodeVersion() {
  $raw = (& node -v 2>$null)
  if (-not $raw) { return $null }
  $v = $raw.Trim()
  if ($v.StartsWith("v")) { $v = $v.Substring(1) }
  try { return [version]$v } catch { return $null }
}

function Ensure-Node() {
  $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
  if (-not $nodeCmd) {
    Write-Err "node is not found in PATH. Install Node.js >= 22.12.0 first."
    exit 1
  }
  $v = Get-NodeVersion
  if (-not $v) {
    Write-Err "Unable to parse node version. Output: $(& node -v)"
    exit 1
  }
  $min = [version]"22.12.0"
  if ($v -lt $min) {
    Write-Err "Node.js >= 22.12.0 is required. Detected: $(& node -v)"
    exit 1
  }
}

$SourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Assert-Exists (Join-Path $SourceDir "openclaw.mjs") "openclaw.mjs"
Assert-Exists (Join-Path $SourceDir "dist") "dist/"
Assert-Exists (Join-Path $SourceDir "node_modules") "node_modules/"

Ensure-Node

$InstallDir = Join-Path $Prefix "lib\openclaw"
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

$robocopy = Get-Command robocopy.exe -ErrorAction SilentlyContinue
if (-not $robocopy) {
  Write-Err "robocopy.exe not found. It is required on Windows."
  exit 1
}

& robocopy.exe $SourceDir $InstallDir /MIR /R:2 /W:2 /NFL /NDL /NJH /NJS /NP /XD ".git" 1>$null
$rc = $LASTEXITCODE
if ($rc -ge 8) {
  Write-Err "robocopy failed with exit code $rc"
  exit 1
}

$LauncherPath = Join-Path $BinDir "openclaw.cmd"
$LauncherContent = @"
@echo off
setlocal enabledelayedexpansion

where node >nul 2>nul
if not %errorlevel%==0 (
  echo openclaw: node is not found in PATH. Install Node.js ^>= 22.12.0. 1>&2
  exit /b 1
)

set "OPENCLAW_INSTALL_DIR=$InstallDir"
node "%OPENCLAW_INSTALL_DIR%\openclaw.mjs" %*
"@

Set-Content -LiteralPath $LauncherPath -Value $LauncherContent -Encoding ASCII

Write-Host "Installed OpenClaw to: $InstallDir"
Write-Host "Installed launcher to: $LauncherPath"

if (-not $NoVerify) {
  & $LauncherPath --version
}

Write-Host ""
Write-Host "If 'openclaw' is not found in a new terminal, add this directory to PATH:"
Write-Host "  $BinDir"
