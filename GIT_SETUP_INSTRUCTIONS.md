# Git Setup Instructions

Git is installed but not accessible in the current terminal session.

---

## ✅ Solution: Restart Terminal

### Option 1: Restart PowerShell/CMD (Recommended)
1. **Close** the current PowerShell or CMD window
2. **Open a new** PowerShell or CMD window
3. **Navigate** to the project:
   ```bash
   cd D:\azora-stack\azora-stack
   ```
4. **Verify** Git is working:
   ```bash
   git --version
   ```
5. **Continue** with deployment commands

---

## Option 2: Add Git to PATH Manually (Advanced)

If restarting doesn't work, add Git to PATH:

1. **Find Git installation path** (usually):
   ```
   C:\Program Files\Git\cmd
   ```

2. **Add to PATH**:
   - Press `Win + X` → System
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\Git\cmd`
   - Click "OK" on all windows

3. **Restart terminal** and verify:
   ```bash
   git --version
   ```

---

## 🚀 After Git is Working

Run these commands in order:

```bash
# Navigate to project
cd D:\azora-stack\azora-stack

# Initialize Git
git init

# Stage all files
git add .

# Create commit
git commit -m "Initial production commit - AzoraStack SaaS"

# Remove existing remote (if any)
git remote remove origin

# Add GitHub repository
git remote add origin https://github.com/choudharyasad369/azora-stack.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## 🔐 Authentication

When prompted for credentials:

### Option A: Personal Access Token (Recommended)
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "AzoraStack Deployment"
4. Select scope: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. When Git asks for password, **paste the token**

### Option B: GitHub CLI
```bash
# Install GitHub CLI
winget install GitHub.cli

# Authenticate
gh auth login

# Follow prompts to login
```

---

## ✅ Verification

After pushing, verify:
1. Go to: https://github.com/choudharyasad369/azora-stack
2. You should see all your code
3. Check the commit message: "Initial production commit - AzoraStack SaaS"

---

## 🎯 Next Step: Deploy to Vercel

Once code is on GitHub:
1. Go to: https://vercel.com
2. Click "Add New Project"
3. Import: `choudharyasad369/azora-stack`
4. Add environment variables
5. Click "Deploy"

---

## 🆘 Still Having Issues?

### Git command not found after restart?
- Verify Git is installed: Check "Add/Remove Programs"
- Reinstall Git: https://git-scm.com/download/win
- During installation, ensure "Git from the command line" is selected

### Permission denied?
- Run PowerShell/CMD as Administrator
- Or use GitHub Desktop: https://desktop.github.com

### Authentication failed?
- Ensure you're using Personal Access Token, not password
- Token must have `repo` scope
- Username is: `choudharyasad369`

---

**Current Status**: Waiting for terminal restart to access Git

**Next Action**: Close and reopen your terminal, then run the deployment commands
