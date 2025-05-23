# Test login API
$body = @{
    email = "admin@example.com"
    password = "password"
} | ConvertTo-Json

Write-Host "Sending login request to API..." -ForegroundColor Green
Write-Host "Request body: $body" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Login failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
} 