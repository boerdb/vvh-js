#Requires -Version 5.1
<#
.SYNOPSIS
  Installeert een dagelijkse Windows-taak die het bezoekersrapport van de VVH-app schrijft.

.DESCRIPTION
  Haalt de dagtotalen via SSH van de server (sleutel ~\.ssh\id_ed25519_homelab) en schrijft
  Bureaublad\VVH bezoekers.txt. Staat de pc op het tijdstip uit, dan draait de taak
  zodra hij weer aan is.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\install_bezoek_rapport_task.ps1
#>
param(
  [string]$TaskName = "VVH-Bezoekersrapport",
  [string]$Time = "13:05",
  [string]$RepoRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  throw "Node.js niet gevonden. Installeer Node.js eerst."
}
$exe = $node.Source

$scriptPath = Join-Path $RepoRoot "scripts\bezoek_rapport.mjs"
if (-not (Test-Path $scriptPath)) {
  throw "Rapportscript ontbreekt: $scriptPath"
}

# Echte bureaubladmap meegeven; die kan via OneDrive ergens anders staan
$rapport = Join-Path ([Environment]::GetFolderPath('Desktop')) "VVH bezoekers.txt"
$argList = "`"$scriptPath`" `"$rapport`""
$action = New-ScheduledTaskAction -Execute $exe -Argument $argList -WorkingDirectory $RepoRoot
$trigger = New-ScheduledTaskTrigger -Daily -At $Time
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew

# Interactive = huidige gebruiker, zonder admin-rechten.
$principal = New-ScheduledTaskPrincipal `
  -UserId "$env:USERDOMAIN\$env:USERNAME" `
  -LogonType Interactive `
  -RunLevel Limited

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Force | Out-Null

Write-Host "Taak geinstalleerd: $TaskName"
Write-Host "  Tijd: dagelijks om $Time"
Write-Host "  Rapport: $rapport"
Write-Host ""
Write-Host "Handmatig draaien:"
Write-Host "  npm run bezoek:rapport"
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'"
