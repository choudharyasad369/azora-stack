@echo off
echo ========================================
echo AzoraStack - GitHub Deployment Script
echo ========================================
echo.

REM Check if Git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not found in PATH
    echo.
    echo Please:
    echo 1. Close this window
    echo 2. Open a new Command Prompt or PowerShell
    echo 3. Run this script again
    echo.
    echo Or read: GIT_SETUP_INSTRUCTIONS.md
    pause
    exit /b 1
)

echo Git found! Proceeding with deployment...
echo.

REM Navigate to project directory
cd /d D:\azora-stack\azora-stack

echo Step 1: Initializing Git repository...
git init
if errorlevel 1 (
    echo ERROR: Failed to initialize Git
    pause
    exit /b 1
)
echo ✓ Git initialized
echo.

echo Step 2: Staging all files...
git add .
if errorlevel 1 (
    echo ERROR: Failed to stage files
    pause
    exit /b 1
)
echo ✓ Files staged
echo.

echo Step 3: Creating commit...
git commit -m "Initial production commit - AzoraStack SaaS"
if errorlevel 1 (
    echo ERROR: Failed to create commit
    pause
    exit /b 1
)
echo ✓ Commit created
echo.

echo Step 4: Removing existing remote (if any)...
git remote remove origin 2>nul
echo ✓ Remote cleaned
echo.

echo Step 5: Adding GitHub remote...
git remote add origin https://github.com/choudharyasad369/azora-stack.git
if errorlevel 1 (
    echo ERROR: Failed to add remote
    pause
    exit /b 1
)
echo ✓ Remote added
echo.

echo Step 6: Setting main branch...
git branch -M main
if errorlevel 1 (
    echo ERROR: Failed to set branch
    pause
    exit /b 1
)
echo ✓ Branch set to main
echo.

echo Step 7: Pushing to GitHub...
echo.
echo IMPORTANT: You will be asked for credentials
echo Username: choudharyasad369
echo Password: Use your Personal Access Token (NOT your GitHub password)
echo.
echo Get token from: https://github.com/settings/tokens
echo.
pause

git push -u origin main
if errorlevel 1 (
    echo.
    echo ERROR: Failed to push to GitHub
    echo.
    echo Common issues:
    echo 1. Authentication failed - Use Personal Access Token as password
    echo 2. Repository doesn't exist - Create it on GitHub first
    echo 3. No internet connection
    echo.
    echo Read: GIT_SETUP_INSTRUCTIONS.md for help
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo Your code is now at:
echo https://github.com/choudharyasad369/azora-stack
echo.
echo Next step: Deploy to Vercel
echo 1. Go to: https://vercel.com
echo 2. Click "Add New Project"
echo 3. Import: choudharyasad369/azora-stack
echo 4. Add environment variables
echo 5. Click "Deploy"
echo.
echo Read: GITHUB_VERCEL_DEPLOYMENT.md for details
echo.
pause
