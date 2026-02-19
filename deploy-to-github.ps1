# AzoraStack - GitHub Deployment Script (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AzoraStack - GitHub Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is available
try {
    $gitVersion = git --version 2>&1
    Write-Host "✓ Git found: $gitVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERROR: Git is not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Close this window" -ForegroundColor Yellow
    Write-Host "2. Open a new PowerShell window" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or read: GIT_SETUP_INSTRUCTIONS.md" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Navigate to project directory
Set-Location "D:\azora-stack\azora-stack"

Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Yellow
git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to initialize Git" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Git initialized" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Staging all files..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to stage files" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Files staged" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Creating commit..." -ForegroundColor Yellow
git commit -m "Initial production commit - AzoraStack SaaS"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create commit" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Commit created" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Removing existing remote (if any)..." -ForegroundColor Yellow
git remote remove origin 2>$null
Write-Host "✓ Remote cleaned" -ForegroundColor Green
Write-Host ""

Write-Host "Step 5: Adding GitHub remote..." -ForegroundColor Yellow
git remote add origin https://github.com/choudharyasad369/azora-stack.git
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to add remote" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Remote added" -ForegroundColor Green
Write-Host ""

Write-Host "Step 6: Setting main branch..." -ForegroundColor Yellow
git branch -M main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to set branch" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Branch set to main" -ForegroundColor Green
Write-Host ""

Write-Host "Step 7: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: You will be asked for credentials" -ForegroundColor Cyan
Write-Host "Username: choudharyasad369" -ForegroundColor Cyan
Write-Host "Password: Use your Personal Access Token (NOT your GitHub password)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Get token from: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"

git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to push to GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Authentication failed - Use Personal Access Token as password" -ForegroundColor Yellow
    Write-Host "2. Repository doesn't exist - Create it on GitHub first" -ForegroundColor Yellow
    Write-Host "3. No internet connection" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Read: GIT_SETUP_INSTRUCTIONS.md for help" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ SUCCESS! Code pushed to GitHub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your code is now at:" -ForegroundColor Cyan
Write-Host "https://github.com/choudharyasad369/azora-stack" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Deploy to Vercel" -ForegroundColor Yellow
Write-Host "1. Go to: https://vercel.com" -ForegroundColor White
Write-Host "2. Click 'Add New Project'" -ForegroundColor White
Write-Host "3. Import: choudharyasad369/azora-stack" -ForegroundColor White
Write-Host "4. Add environment variables" -ForegroundColor White
Write-Host "5. Click 'Deploy'" -ForegroundColor White
Write-Host ""
Write-Host "Read: GITHUB_VERCEL_DEPLOYMENT.md for details" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
