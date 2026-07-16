param(
    [ValidateSet('start', 'restart', 'stop', 'status')]
    [string]$Action = 'start'
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Runtime = Join-Path $Root 'storage\app\dev-services'
$Logs = Join-Path $Root 'storage\logs'
$Services = @(
    @{ Name = 'backend'; Port = 8890; Command = 'php'; Arguments = @('artisan', 'serve', '--host=127.0.0.1', '--port=8890') },
    @{ Name = 'frontend'; Port = 5180; Command = 'npm.cmd'; Arguments = @('run', 'dev', '--', '--host=127.0.0.1', '--port=5180', '--strictPort') }
)

New-Item -ItemType Directory -Force -Path $Runtime, $Logs | Out-Null

function Get-ServiceProcess($Service) {
    $pidFile = Join-Path $Runtime "$($Service.Name).pid"
    if (-not (Test-Path $pidFile)) { return $null }
    $servicePid = [int](Get-Content $pidFile -Raw)
    Get-Process -Id $servicePid -ErrorAction SilentlyContinue
}

function Stop-Services {
    foreach ($service in $Services) {
        $process = Get-ServiceProcess $service
        if ($process) {
            Stop-Process -Id $process.Id -Force
            Write-Host "Stopped $($service.Name) (PID $($process.Id))."
        }
        Remove-Item (Join-Path $Runtime "$($service.Name).pid") -Force -ErrorAction SilentlyContinue
    }
}

function Start-Services {
    foreach ($service in $Services) {
        if (Get-ServiceProcess $service) {
            Write-Host "$($service.Name) is already running."
            continue
        }
        if (Get-NetTCPConnection -State Listen -LocalPort $service.Port -ErrorAction SilentlyContinue) {
            throw "Port $($service.Port) is already in use. Stop the conflicting service or update the configured port."
        }
        $log = Join-Path $Logs "$($service.Name).log"
        $errorLog = Join-Path $Logs "$($service.Name).error.log"
        $process = Start-Process -FilePath $service.Command -ArgumentList $service.Arguments -WorkingDirectory $Root -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError $errorLog -PassThru
        Set-Content (Join-Path $Runtime "$($service.Name).pid") $process.Id
        Write-Host "Started $($service.Name) on port $($service.Port) (PID $($process.Id))."
    }
    Write-Host 'Open http://127.0.0.1:8890'
}

switch ($Action) {
    'start' { Start-Services }
    'restart' { Stop-Services; Start-Services }
    'stop' { Stop-Services }
    'status' {
        foreach ($service in $Services) {
            $process = Get-ServiceProcess $service
            Write-Host "$($service.Name): $(if ($process) { "running (PID $($process.Id))" } else { 'stopped' })"
        }
    }
}
