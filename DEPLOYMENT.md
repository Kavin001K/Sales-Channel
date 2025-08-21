# Deployment Guide for Ace Business Billing System

## 🚀 Netlify Deployment

### Prerequisites
- Netlify account
- Neon database connection string
- GitHub repository with the billing system

### Step 1: Prepare for Deployment

1. **Environment Variables Setup**
   Create a `.env` file in the root directory:
   ```
   VITE_DATABASE_URL=your_neon_database_connection_string
   VITE_APP_NAME=Ace Business Billing
   ```

2. **Build the Application**
   ```bash
   npm run build
   ```

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify UI
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables:
   - `VITE_DATABASE_URL`: Your Neon database connection string
6. Deploy!

#### Option B: Deploy via Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize and deploy:
   ```bash
   netlify init
   netlify deploy --prod
   ```

### Step 3: Configure Environment Variables

In your Netlify dashboard:
1. Go to Site settings > Environment variables
2. Add the following variables:
   - `VITE_DATABASE_URL`: Your Neon PostgreSQL connection string
   - `VITE_APP_NAME`: Ace Business Billing

### Step 4: Database Setup

1. **Neon Database Configuration**
   - Use your existing Neon database connection
   - The application will automatically create tables on first run
   - Run the database setup script if needed:
     ```bash
     npm run setup-db
     ```

2. **Database Connection**
   The application uses the connection string from environment variables:
   ```
   postgresql://neondb_owner:npg_u9wzkM2ArXbo@ep-polished-dew-ael3uza7-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

### Step 5: Custom Domain (Optional)

1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS settings as instructed

## 🔧 Post-Deployment Features

### ✅ Redirect Functionality
After each successful bill completion and printing, users are automatically redirected to:
- **Dashboard**: https://acebusiness.shop

### 🔐 Authentication System
- **Company Login**: Required before accessing the system
- **Employee Login**: Required after company login
- **Multi-tenant**: Each company's data is isolated

### 📊 Features Available
- **Sales Page**: Traditional billing interface
- **QuickPOS**: Fast billing interface
- **Transactions**: View and manage all sales
- **Products**: Inventory management
- **Customers**: Customer database
- **Employees**: Staff management
- **Reports**: Sales analytics and reports
- **Settings**: System configuration

## 🚨 Important Notes

1. **Database Security**: Ensure your Neon database has proper security settings
2. **Environment Variables**: Never commit sensitive data to Git
3. **SSL Certificate**: Netlify provides automatic SSL certificates
4. **Backup**: Regularly backup your Neon database
5. **Monitoring**: Set up monitoring for your application

## 🔄 Updates and Maintenance

### Updating the Application
1. Push changes to your GitHub repository
2. Netlify will automatically rebuild and deploy
3. Monitor the deployment in Netlify dashboard

### Database Migrations
1. Update the database schema in `scripts/setup-database.cjs`
2. Run the reset script if needed:
   ```bash
   npm run reset-db
   ```

## 📞 Support

For technical support or questions about the deployment:
- Check the application logs in Netlify dashboard
- Verify database connectivity
- Ensure all environment variables are set correctly

---

**Deployment Status**: ✅ Ready for production deployment
**Database**: ✅ Neon PostgreSQL configured
**Redirect**: ✅ Dashboard redirect implemented
**Security**: ✅ Authentication system in place 