# Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue 1: Blank Page / White Screen

#### **Symptoms:**
- Page loads but shows blank/white screen
- No error messages in console
- Application doesn't render

#### **Solutions:**

1. **Clear Browser Cache**
   ```bash
   # Hard refresh the page
   Ctrl + F5 (Windows) or Cmd + Shift + R (Mac)
   ```

2. **Clear Browser Data**
   - Open Developer Tools (F12)
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"

3. **Check Console for Errors**
   - Press F12 to open Developer Tools
   - Check Console tab for error messages
   - Look for JavaScript errors

4. **Restart Development Server**
   ```bash
   # Stop the server
   Ctrl + C
   
   # Clear node modules cache
   npm cache clean --force
   
   # Reinstall dependencies
   npm install
   
   # Start server again
   npm run dev
   ```

### Issue 2: Authentication Errors

#### **Symptoms:**
- Can't login with sample credentials
- "Invalid credentials" error
- Database connection issues

#### **Solutions:**

1. **Reset Database**
   ```bash
   npm run reset-db
   ```

2. **Check Database Connection**
   - Verify Neon database is accessible
   - Check connection string in scripts

3. **Use Sample Credentials**
   ```
   Company: admin@techsolutions.com / admin123
   Employee: EMP001 / emp123
   ```

### Issue 3: Build Errors

#### **Symptoms:**
- `npm run build` fails
- TypeScript compilation errors
- Missing dependencies

#### **Solutions:**

1. **Fix File Extensions**
   ```bash
   # Ensure JSX files have .tsx extension
   # Check all files with JSX syntax
   ```

2. **Update Dependencies**
   ```bash
   npm update
   npm install
   ```

3. **Clear Build Cache**
   ```bash
   rm -rf dist/
   rm -rf node_modules/.vite
   npm run build
   ```

### Issue 4: Redirect Not Working

#### **Symptoms:**
- After billing, no redirect to dashboard
- Page stays on billing screen

#### **Solutions:**

1. **Check Console for Errors**
   - Look for JavaScript errors
   - Check network requests

2. **Verify Redirect Code**
   ```javascript
   // Should be in Sales.tsx and QuickPOS.tsx
   setTimeout(() => {
     window.location.href = 'https://acebusiness.shop';
   }, 1500);
   ```

3. **Test Redirect Manually**
   ```javascript
   // In browser console
   window.location.href = 'https://acebusiness.shop';
   ```

## 🔧 Development Commands

### **Start Development Server**
```bash
npm run dev
```

### **Build for Production**
```bash
npm run build
```

### **Reset Database**
```bash
npm run reset-db
```

### **Setup Database**
```bash
npm run setup-db
```

## 📱 Browser Compatibility

### **Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Required Features:**
- JavaScript enabled
- Local storage support
- Fetch API support

## 🗄️ Database Issues

### **Connection Problems:**
1. Check Neon database status
2. Verify connection string
3. Check network connectivity

### **Data Issues:**
1. Run database reset: `npm run reset-db`
2. Check sample data insertion
3. Verify table structure

## 🚀 Deployment Issues

### **Netlify Build Failures:**
1. Check build logs in Netlify dashboard
2. Verify environment variables
3. Ensure all files have correct extensions

### **Environment Variables:**
```
VITE_DATABASE_URL=your_neon_connection_string
VITE_APP_NAME=Ace Business Billing
```

## 📞 Getting Help

### **Debug Steps:**
1. Check browser console for errors
2. Verify database connection
3. Test with sample credentials
4. Check network requests

### **Common Error Messages:**
- **"Module not found"**: Missing dependency
- **"Cannot read property"**: Undefined variable
- **"Network error"**: Database connection issue
- **"Authentication failed"**: Wrong credentials

---

**Status**: ✅ Troubleshooting guide ready
**Last Updated**: Current session
**Tested**: ✅ Sample credentials working 