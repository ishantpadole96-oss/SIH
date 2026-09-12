# Auto-reconnecting localhost.run tunnel daemon
$ErrorActionPreference = "Continue"

while ($true) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Starting persistent tunnel to localhost.run..."
    try {
        ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=4 -R 80:localhost:3000 nokey@localhost.run
    } catch {
        Write-Host "SSH error: $_"
    }
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Tunnel connection closed. Reconnecting in 2 seconds..."
    Start-Sleep -Seconds 2
}
