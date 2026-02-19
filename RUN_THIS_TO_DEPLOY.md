# 🚀 RUN THIS TO DEPLOY

**Quick deployment instructions for AzoraStack**

---

## ⚡ FASTEST METHOD

### Step 1: Close and Reopen Terminal
1. **Close** your current PowerShell/CMD window
2. **Open a NEW** PowerShell or CMD window
3. This ensures Git is in your PATH

### Step 2: Run Deployment Script

**Option A: Using Batch Script (CMD)**
```bash
cd D:\azora-stack\azora-stack
deploy-to-github.bat
```

**Option B: Using PowerShell Script**
```powershell
cd D:\azora-stack\azora-stack
.\deploy-to-github.ps1
```

**Option C: Manual Commands**
```bash
cd D:\azora-stack\azora-stack
git init
git add .
git commit -m "Initial production commit - AzoraStack SaaS"
git remote add origin https://github.com/choudharyasad369/azora-stack.git
git branch -M main
git push -u origin main
```

---

## 🔐 When Asked for Credentials

**Username**: `choudharyasad369`

**Password**: Use Personal Access Token (NOT your GitHub password)

### Get Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "AzoraStack Deployment"
4. Select scope: ✅ `repo` (full control)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. Paste it when asked for password

---

## ✅ After Successful Push

You'll see:
```
✓ SUCCESS! Code pushed to GitHub
Your code is now at:
https://github.com/choudharyasad369/azora-stack
```

---

## 🌐 Next: Deploy to Vercel

1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Select: `choudharyasad369/azora-stack`
5. Add environment variables (see `.env.vercel.example`)
6. Click "Deploy"

---

## 🐛 Troubleshooting

### "Git is not recognized"
**Solution**: Close terminal, open new one, try again

### "Authentication failed"
**Solution**: Use Personal Access Token, not password

### "Repository not found"
**Solution**: Ensure repository exists at:
https://github.com/choudharyasad369/azora-stack

---

## 📚 Need More Help?

Read these files:
- `GIT_SETUP_INSTRUCTIONS.md` - Git setup help
- `GITHUB_VERCEL_DEPLOYMENT.md` - Complete guide
- `DEPLOY_COMMANDS.md` - Command reference

---

**Ready? Close terminal, open new one, run the script!** 🚀
