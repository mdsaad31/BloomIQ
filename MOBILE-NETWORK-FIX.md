# 📱 Fix Mobile App Connection to Local Backend

## ✅ Changes Applied

### **Backend Server (server.js)**
- ✅ Updated to bind to `0.0.0.0` (all network interfaces)
- ✅ Now accessible from other devices on your network
- ✅ Server running at: **http://10.250.134.24:5000**

### **Mobile App (.env)**
- ✅ Updated API_URL to: **http://10.250.134.24:5000/api**
- ✅ Using your computer's network IP address

---

## 🔥 Windows Firewall Configuration (REQUIRED)

Windows Firewall might be blocking incoming connections on port 5000. You need to add a firewall rule:

### **Method 1: Using Windows Defender Firewall (GUI)**

1. **Open Windows Defender Firewall**:
   - Press `Win + R`
   - Type: `wf.msc`
   - Press Enter

2. **Create Inbound Rule**:
   - Click "Inbound Rules" in left sidebar
   - Click "New Rule..." in right sidebar
   - Select "Port" → Click "Next"
   - Select "TCP" and enter port: `5000`
   - Click "Next"
   - Select "Allow the connection"
   - Click "Next"
   - Check all profiles: Domain, Private, Public
   - Click "Next"
   - Name: `Node.js BloomIQ Backend (Port 5000)`
   - Click "Finish"

### **Method 2: Using PowerShell (Admin Required)**

Open PowerShell as Administrator and run:

```powershell
New-NetFirewallRule -DisplayName "Node.js BloomIQ Backend (Port 5000)" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

### **Method 3: Quick Test (Temporary)**

To test if firewall is the issue, temporarily disable Windows Firewall:

1. Open Windows Defender Firewall
2. Click "Turn Windows Defender Firewall on or off"
3. Turn off for Private networks (just for testing)
4. Test mobile app
5. **Remember to turn it back on!**

---

## 📱 Restart Mobile App

After configuring the firewall, restart your mobile app to use the new API URL:

```bash
# In the terminal with Expo running, press Ctrl+C to stop
# Then restart:
cd mobile-expo
npx expo start
```

Or press `r` in the Expo terminal to reload the app.

---

## 🧪 Test Connection

### **1. Test from your phone's browser first**:

Open your phone's browser and navigate to:
```
http://10.250.134.24:5000
```

You should see:
```json
{
  "name": "BloomIQ Backend API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": { ... }
}
```

If this doesn't work:
- ✅ Check firewall is configured
- ✅ Ensure phone and computer are on the same WiFi network
- ✅ Backend server is running

### **2. Test from command line** (on your computer):

```powershell
curl http://10.250.134.24:5000
```

### **3. Test from mobile app**:

- Open the BloomIQ app
- Try to login or register
- Check if it connects successfully

---

## 🔍 Troubleshooting

### **Problem: "Network request failed"**

**Solution 1: Check WiFi**
- Ensure your phone and computer are on the **same WiFi network**
- Not using mobile data or VPN

**Solution 2: Check IP Address**
If your computer's IP changed, get the new IP:

```powershell
ipconfig | Select-String "IPv4"
```

Look for your network adapter's IP (usually starts with 192.168.x.x or 10.x.x.x)

Update `mobile-expo/.env`:
```env
API_URL=http://YOUR_NEW_IP:5000/api
```

**Solution 3: Check Backend Server**
Make sure backend is running:
- Look for: `✅ Server running on port 5000`
- Network URL shows: `🔗 Network: http://10.250.134.24:5000`

**Solution 4: Restart Everything**
1. Stop backend server (Ctrl+C)
2. Stop Expo (Ctrl+C)
3. Restart backend: `cd backend && node server.js`
4. Restart Expo: `cd mobile-expo && npx expo start`
5. Reload app on phone (shake device → Reload)

---

## ⚡ Quick Fix Checklist

- [ ] Backend server is running
- [ ] Server shows network URL: `http://10.250.134.24:5000`
- [ ] Windows Firewall rule created for port 5000
- [ ] Phone and computer on same WiFi
- [ ] Mobile app `.env` has correct IP: `http://10.250.134.24:5000/api`
- [ ] Expo app reloaded/restarted
- [ ] Can access `http://10.250.134.24:5000` from phone's browser

---

## 🚀 Alternative: Use ngrok (If Nothing Works)

If you still can't connect, use ngrok to create a public URL:

```bash
# Install ngrok: https://ngrok.com/download
# Or use: choco install ngrok (if you have Chocolatey)

# Run ngrok
ngrok http 5000
```

Copy the public URL (e.g., `https://abc123.ngrok.io`) and update:

```env
# mobile-expo/.env
API_URL=https://abc123.ngrok.io/api
```

---

## 📊 Current Configuration

| Setting | Value |
|---------|-------|
| **Computer IP** | 10.250.134.24 |
| **Backend Port** | 5000 |
| **Backend URL** | http://10.250.134.24:5000 |
| **Mobile API URL** | http://10.250.134.24:5000/api |
| **Server Binding** | 0.0.0.0 (all interfaces) |

---

## ✅ Success Indicators

When everything is working, you'll see:

**Backend Terminal:**
```
✅ Server running on port 5000
🔗 Network: http://10.250.134.24:5000
✅ MongoDB Connected
```

**Mobile App:**
- Login/Register works
- Analysis uploads images
- Reports load
- Weather search works
- No "Network request failed" errors

---

## 🔗 Next Steps

Once mobile app connects successfully:

1. **Test all features**:
   - Login/Register
   - Crop analysis
   - View reports
   - Weather search

2. **Build APK for distribution**:
   ```bash
   cd mobile-expo
   eas build --platform android --profile preview
   ```

3. **Deploy backend to Render** for permanent public access

---

**Need help?** Check the server logs for any error messages!
