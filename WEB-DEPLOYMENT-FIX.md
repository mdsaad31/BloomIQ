# 🔧 Web Frontend Deployment Fix

## ❌ Error: "Publish directory npm run build does not exist!"

### **Root Cause:**
The **Build Command** in Render dashboard is incorrectly set to just `npm install` instead of `npm install && npm run build`.

The logs show:
```
==> Running build command 'npm install'...
==> Publish directory npm run build does not exist!
```

This means:
- ❌ Build command: `npm install` (wrong)
- ❌ Publish directory: `npm run build` (wrong - this should be the build command!)

---

## ✅ Solution: Update Render Dashboard Settings

### **Step-by-Step Fix:**

1. **Go to [Render Dashboard](https://dashboard.render.com)**

2. **Click on your `bloomiq-web` service**

3. **Click "Settings" tab** (left sidebar)

4. **Scroll to "Build & Deploy" section**

5. **Update these fields:**

   **Build Command:**
   ```bash
   npm install && npm run build
   ```
   
   **Publish Directory:**
   ```bash
   build
   ```
   
   **Root Directory:**
   ```bash
   web
   ```

6. **Click "Save Changes"** (bottom of page)

7. **Go to "Manual Deploy" tab**

8. **Click "Deploy latest commit"**

---

## 📋 Correct vs Incorrect Configuration

### ❌ **INCORRECT** (Current):
```
Build Command: npm install
Publish Directory: npm run build
```

### ✅ **CORRECT** (What it should be):
```
Build Command: npm install && npm run build
Publish Directory: build
```

---

## 🎯 Full Configuration Reference

Here's what your static site settings should look like:

| Setting | Value |
|---------|-------|
| **Name** | `bloomiq-web` |
| **Runtime** | Static Site |
| **Branch** | `main` |
| **Root Directory** | `web` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |
| **Auto-Deploy** | Yes |

---

## 🔍 Understanding the Error

The error message shows Render is looking for a directory called `npm run build`:
```
==> Publish directory npm run build does not exist!
```

This happens when:
1. **Publish Directory** is set to `npm run build` (which is a command, not a directory)
2. **Build Command** is only `npm install` (doesn't actually build the app)

**What should happen:**
1. **Build Command** runs: `npm install && npm run build`
   - This installs dependencies AND builds the React app
   - Creates a `build/` directory with compiled files
2. **Publish Directory** points to: `build`
   - Render serves the static files from this directory

---

## 🧪 Verify Build Locally

Before redeploying, verify the build works locally:

```bash
cd web
npm install
npm run build
```

You should see:
```
Creating an optimized production build...
Compiled successfully.

File sizes after gzip:
  XX.XX kB  build/static/js/main.xxxxxxxx.js
  XX.XX kB  build/static/css/main.xxxxxxxx.css

The build folder is ready to be deployed.
```

Check that `web/build/` directory was created with:
- `index.html`
- `static/` folder
- `_redirects` file

---

## 📝 Alternative: Delete and Recreate Service

If updating settings doesn't work:

### **Option 1: Delete & Recreate**

1. **Delete the `bloomiq-web` service** from Render
2. **Create new Static Site** with correct settings from the start:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
   - Root Directory: `web`

### **Option 2: Use Blueprint (render.yaml)**

1. **Delete the `bloomiq-web` service**
2. **Create new service using Blueprint**:
   - Click "New +" → "Blueprint"
   - Connect GitHub
   - Select `web/render.yaml`
   - Click "Apply"

---

## ⚠️ Common Mistakes to Avoid

| Mistake | Why It's Wrong | Correct Value |
|---------|----------------|---------------|
| Build Command: `npm install` | Doesn't build the app | `npm install && npm run build` |
| Build Command: `npm run build` | Doesn't install dependencies first | `npm install && npm run build` |
| Publish Directory: `npm run build` | This is a command, not a directory | `build` |
| Publish Directory: `./build` | Relative path can cause issues | `build` |
| Root Directory: (empty) | Render looks in wrong place | `web` |

---

## 🔄 After Fixing

Once you update the settings and redeploy, the logs should show:

```bash
==> Running build command 'npm install && npm run build'...
npm install
# ... package installation ...

npm run build
Creating an optimized production build...
Compiled successfully.

The build folder is ready to be deployed.

==> Uploading build from build...
==> Build succeeded 🎉
==> Deploying...
==> Your service is live 🎉
```

---

## 🎯 Post-Deployment Checklist

After successful deployment:

- [ ] Visit `https://bloomiq-web.onrender.com`
- [ ] Check homepage loads
- [ ] Try navigating to different routes
- [ ] Test login functionality
- [ ] Test registration
- [ ] Verify API connection to backend
- [ ] Check browser console for errors
- [ ] Test on mobile browser

---

## 🐛 Still Having Issues?

### **Check Build Logs:**
1. Go to Render dashboard
2. Click on service
3. Click "Logs" tab
4. Look for specific error messages

### **Common Issues:**

**Issue: "Module not found"**
- Solution: Check `package.json` dependencies are correct
- Run `npm install` locally to verify

**Issue: "Out of memory"**
- Solution: Upgrade to paid Render plan (free tier has memory limits)
- Or: Reduce bundle size (remove unused dependencies)

**Issue: "Routes return 404"**
- Solution: Verify `_redirects` file exists in `web/public/`
- Content should be: `/*    /index.html   200`

---

## ✅ Success Indicators

When deployment succeeds, you'll see:

**In Render Logs:**
```
==> Build succeeded 🎉
==> Your service is live 🎉
==> Available at https://bloomiq-web.onrender.com
```

**In Browser:**
- ✅ Web app loads
- ✅ No console errors
- ✅ Can navigate between pages
- ✅ Can connect to backend API

---

## 📞 Need More Help?

**Resources:**
- [Render Static Site Docs](https://render.com/docs/static-sites)
- [Troubleshooting Deploys](https://render.com/docs/troubleshooting-deploys)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)

**Quick Test:**
```bash
# Test if backend is accessible
curl https://bloomiq.onrender.com/health

# Should return: {"status":"ok","mongodb":"connected"}
```

---

## 🎉 Summary

**The Fix:**
1. Go to Render Dashboard → bloomiq-web → Settings
2. Update **Build Command** to: `npm install && npm run build`
3. Update **Publish Directory** to: `build`
4. Save and redeploy

**Expected Result:**
- ✅ Build completes successfully
- ✅ Web app deployed and accessible
- ✅ Can connect to backend API
- ✅ All features working

**Next Steps:**
1. Fix settings in Render
2. Redeploy
3. Test at `https://bloomiq-web.onrender.com`
4. Update backend CORS if needed
5. Test all features!

🚀 **Your web app will be live soon!**
