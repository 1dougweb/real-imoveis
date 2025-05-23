# Restart script for Laravel
Write-Host "Restarting Laravel server on port 8000..." -ForegroundColor Green

# If there's any php process running, kill it
$phpProcesses = Get-Process -Name php -ErrorAction SilentlyContinue
if ($phpProcesses) {
    Write-Host "Stopping existing PHP processes..." -ForegroundColor Yellow
    Stop-Process -Name php -Force
    Start-Sleep -Seconds 1
}

# Start the Laravel server
Write-Host "Starting Laravel server..." -ForegroundColor Green
php artisan serve --port=8000 