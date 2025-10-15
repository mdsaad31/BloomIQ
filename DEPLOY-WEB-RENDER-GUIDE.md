# 🌐 Deploy BloomIQ Web Frontend to Render

## 📋 Overview

Deploy the React web application as a static site on Render.com.

**Expected URL:** `https://bloomiq-web.onrender.com` (or custom domain)

---

## 🎯 Step-by-Step Deployment Guide

### **Step 1: Prepare the Repository**

All necessary files have been created:
- ✅ `web/.env` - Environment configuration with production API URL
- ✅ `web/.node-version` - Node.js version specification
- ✅ `web/render.yaml` - Render deployment configuration
- ✅ `web/public/_redirects` - React Router redirect rules

### **Step 2: Commit and Push Changes**

```bash
cd C:\Users\user\Desktop\Hackathons\chip-to-crop\BloomIQ-v4

# Add all web files
git add web/

# Commit changes
git commit -m "Add web frontend deployment configuration for Render"

# Push to GitHub
git push origin main
```

---

### **Step 3: Create Static Site on Render**

#### **Option A: Using Render Dashboard (Recommended)**

1. **Go to Render.com** and login
2. **Click "New +" → "Static Site"**

3. **Connect GitHub Repository:**
   - Click "Connect GitHub"
   - Select your repository: `BloomIQ`
   - Click "Connect"

4. **Configure Static Site:**
   ```
   Name: bloomiq-web
   Branch: main
   Root Directory: web
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   ```
   REACT_APP_API_URL = https://bloomiq.onrender.com/api
   NODE_VERSION = 18
   ```

6. **Click "Create Static Site"**

7. **Wait for Build** (5-10 minutes)
   - Render will:
     - Install dependencies (`npm install`)
     - Build React app (`npm run build`)
     - Deploy static files from `build/` folder

8. **Get Your Web URL:**
   - After deployment: `https://bloomiq-web.onrender.com`
   - Or custom domain if you set one up

#### **Option B: Using render.yaml (Blueprint)**

1. **Commit render.yaml** (already created)
2. **In Render Dashboard:**
   - Click "New +" → "Blueprint"
   - Connect repository
   - Select `web/render.yaml`
   - Click "Apply"

---

### **Step 4: Update Backend CORS**

The backend needs to allow requests from the new web URL.

**On Render (Backend Service):**

1. Go to your **BloomIQ** backend service
2. Click **Environment** tab
3. Find `ALLOWED_ORIGINS` variable
4. Update to:
   ```
   http://localhost:3000,http://localhost:3001,https://bloomiq.onrender.com,https://bloomiq-web.onrender.com
   ```
5. Click **Save Changes**
6. Backend will automatically redeploy

---

### **Step 5: Test the Deployment**

1. **Open your web URL:** `https://bloomiq-web.onrender.com`

2. **Test all features:**
   - [ ] Registration
   - [ ] Login
   - [ ] Dashboard
   - [ ] Crop Analysis (upload/camera)
   - [ ] View Reports
   - [ ] Weather Search
   - [ ] Profile

---

## 📁 Files Created

### `web/.env`
```bash
# Production environment
REACT_APP_API_URL=https://bloomiq.onrender.com/api
```

### `web/.node-version`
```
18
```

### `web/render.yaml`
```yaml
services:
  - type: web
    name: bloomiq-web
    runtime: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./build
    envVars:
      - key: REACT_APP_API_URL
        value: https://bloomiq.onrender.com/api
```

### `web/public/_redirects`
```
/*    /index.html   200
```
This ensures React Router works correctly on Render (all routes redirect to index.html).

---

## 🔧 Configuration Details

### Build Process:
1. **Install:** `npm install`
2. **Build:** `npm run build` (creates `build/` folder)
3. **Deploy:** Serve static files from `build/`

### Environment Variables:
- `REACT_APP_API_URL` - Backend API URL
- `NODE_VERSION` - Node.js version (18)

### Routing:
- `_redirects` file ensures SPA routing works
- All routes serve `index.html`
- React Router handles client-side navigation

---

## 🌐 Update API Configuration

### For Local Development:

**Edit `web/.env`:**
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### For Production:

**Edit `web/.env`:**
```bash
REACT_APP_API_URL=https://bloomiq.onrender.com/api
```

**Then rebuild:**
```bash
npm run build
```

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to GitHub:

1. Make changes to `web/` folder
2. Commit and push:
   ```bash
   git add web/
   git commit -m "Update web app"
   git push
   ```
3. Render auto-deploys

---

## 🐛 Troubleshooting

### **Build Failed:**

**Check Render Logs:**
1. Go to Render dashboard
2. Click on **bloomiq-web** service
3. Click **Logs** tab
4. Look for error messages

**Common Issues:**

1. **Node version mismatch:**
   - Ensure `.node-version` contains `18`

2. **Missing dependencies:**
   - Check `package.json` has all deps
   - Run `npm install` locally to verify

3. **Build errors:**
   - Run `npm run build` locally first
   - Fix any TypeScript/ESLint errors

### **API Connection Failed:**

1. **Check API URL in logs:**
   - Build logs should show: `REACT_APP_API_URL=https://bloomiq.onrender.com/api`

2. **Check CORS on backend:**
   - Backend must allow your web URL in `ALLOWED_ORIGINS`
   - Check backend logs for CORS errors

3. **Test backend directly:**
   ```bash
   curl https://bloomiq.onrender.com/health
   ```

### **Routes Not Working (404):**

1. **Check `_redirects` file exists:**
   ```bash
   ls web/public/_redirects
   ```

2. **Ensure it's copied to build:**
   - Should be in `build/_redirects` after build

---

## 📊 Render Static Site Features

### ✅ Free Tier Includes:

- ✅ **100 GB bandwidth/month**
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Automatic deploys from GitHub**
- ✅ **Custom domains**
- ✅ **No cold starts** (always fast)

### ⚠️ Limitations:

- Static files only (no server-side code)
- Build time: ~5-10 minutes
- Build failures count towards free tier limits

---

## 🔐 Security Headers

The `render.yaml` includes security headers:

```yaml
headers:
  - path: /*
    name: X-Frame-Options
    value: SAMEORIGIN
  - path: /*
    name: X-Content-Type-Options
    value: nosniff
  - path: /*
    name: Referrer-Policy
    value: strict-origin-when-cross-origin
```

These protect against:
- Clickjacking attacks
- MIME type sniffing
- Referrer leakage

---

## 🎯 Post-Deployment Checklist

- [ ] Web frontend deployed to Render
- [ ] Production URL working
- [ ] Backend CORS updated with web URL
- [ ] All pages load correctly
- [ ] React Router navigation works
- [ ] API calls successful
- [ ] Authentication working
- [ ] Image uploads working
- [ ] Mobile responsive design works

---

## 🌍 Custom Domain (Optional)

### To use your own domain:

1. **In Render Dashboard:**
   - Go to your static site
   - Click **Settings** → **Custom Domains**
   - Click **Add Custom Domain**
   - Enter your domain: `bloomiq.yourdomain.com`

2. **Update DNS:**
   - Add CNAME record pointing to Render
   - Wait for DNS propagation (5-60 minutes)

3. **Update Backend CORS:**
   - Add your custom domain to `ALLOWED_ORIGINS`

---

## 📱 Multiple Deployments

You now have:

1. **Backend API:** `https://bloomiq.onrender.com`
2. **Web App:** `https://bloomiq-web.onrender.com`
3. **Mobile App:** Uses production API URL

All connected and working together! 🎉

---

## 🚀 Alternative Deployment Options

If Render doesn't work:

1. **Vercel** - Free tier, excellent for React
2. **Netlify** - Free tier, similar to Render
3. **GitHub Pages** - Free, requires public repo
4. **Cloudflare Pages** - Free tier, fast CDN
5. **AWS S3 + CloudFront** - Pay per use

---

## ✅ Deployment Complete!

Once deployed, your web app will be:
- ✅ Publicly accessible
- ✅ HTTPS enabled
- ✅ Served via CDN (fast globally)
- ✅ Auto-deploying from GitHub
- ✅ Connected to production backend

**Your users can access BloomIQ from any browser!** 🌿✨

---

## 🎯 Next Steps

1. ✅ Deploy web frontend to Render
2. ✅ Update backend CORS with web URL
3. ✅ Test all features on production
4. ✅ Build mobile APK with production API
5. ✅ Share with users!

**Need help?** Check Render logs or contact support!
