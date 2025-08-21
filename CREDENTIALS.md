# Sample Login Credentials

## 🔐 Company Login Credentials

### Company 1: Tech Solutions Inc
- **Email**: `admin@techsolutions.com`
- **Password**: `admin123`

### Company 2: Retail Store Plus
- **Email**: `admin@retailstore.com`
- **Password**: `admin123`

## 👥 Employee Login Credentials

### Company 1 (Tech Solutions Inc) Employees:

#### Employee 1: Alice Manager
- **Employee ID**: `EMP001`
- **Password**: `emp123`
- **Position**: Store Manager

#### Employee 2: Bob Sales
- **Employee ID**: `EMP002`
- **Password**: `emp123`
- **Position**: Sales Associate

### Company 2 (Retail Store Plus) Employees:

#### Employee 3: Carol Cashier
- **Employee ID**: `EMP003`
- **Password**: `emp123`
- **Position**: Cashier

## 🚀 How to Login

### Step 1: Company Login
1. Go to the application URL
2. Enter company email and password
3. Click "Login to Company"

### Step 2: Employee Login
1. After company login, you'll be redirected to employee login
2. Enter employee ID and password
3. Click "Login as Employee"

### Step 3: Access Dashboard
1. After successful employee login, you'll access the main dashboard
2. Navigate to Sales or QuickPOS for billing
3. Complete transactions and print receipts
4. Automatic redirect to https://acebusiness.shop after billing

## 📊 Sample Data Available

### Products (Company 1 - Tech Solutions)
- **Laptop Computer**: ₹1,299.99
- **Wireless Mouse**: ₹29.99

### Products (Company 2 - Retail Store Plus)
- **Office Chair**: ₹199.99
 
### Customers
- John Smith, Sarah Johnson, Mike Davis

## 🔧 Database Setup

To reset the database with sample data:
```bash
npm run reset-db
```

To setup the database for the first time:
```bash
npm run setup-db
```

## 🎯 Testing Flow

1. **Login with Company**: Use any company credentials above
2. **Login with Employee**: Use corresponding employee credentials
3. **Create Bill**: Add products to cart and complete transaction
4. **Print Receipt**: Receipt will be generated and printed
5. **Dashboard Redirect**: Automatic redirect to https://acebusiness.shop

## 🚨 Important Notes

- All passwords are hashed using bcrypt
- Each company has isolated data
- Employees can only access their company's data
- After billing, users are redirected to the dashboard
- The system supports multi-tenant architecture

---

**Status**: ✅ Ready for testing
**Database**: ✅ Sample data configured
**Authentication**: ✅ Company and employee login working
**Redirect**: ✅ Dashboard redirect implemented 