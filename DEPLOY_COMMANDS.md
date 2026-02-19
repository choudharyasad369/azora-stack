# Quick Deployment Commands

**Copy and paste these commands in order**

---

## 🚀 Step 1: Initialize Git

```bash
cd D:\azora-stack\azora-stack
git init
```

---

## 📦 Step 2: Stage All Files

```bash
git add .
git status
```

---

## 💾 Step 3: Create Initial Commit

```bash
git commit -m "Initial production commit - AzoraStack SaaS"
```

---

## 🔗 Step 4: Connect to GitHub

```bash
git remote remove origin
git remote add origin https://github.com/choudharyasad369/azora-stack.git
git branch -M main
git remote -v
```

---

## 🚢 Step 5: Push to GitHub

```bash
git push -u origin main
```

**If authentication fails**, use Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Use token as password when prompted

---

## 🌐 Step 6: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)
1. Go to: https://vercel.com
2. Click "Add New Project"
3. Import: `choudharyasad369/azora-stack`
4. Add environment variables
5. Click "Deploy"

### Option B: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## ✅ Verify Deployment

```bash
# Check git status
git status

# View remote
git remote -v

# View commit history
git log --oneline
```

---

## 🔄 Future Updates

```bash
# Make changes, then:
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will auto-deploy on push!

---

**Status**: Ready to deploy! 🚀
