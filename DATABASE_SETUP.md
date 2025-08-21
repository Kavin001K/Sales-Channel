# Database Setup and Security Guide

## 🗄️ Database Configuration

### 1. Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Database Configuration
VITE_DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Security Configuration
VITE_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application Configuration
VITE_APP_NAME=Sales Channel POS
VITE_APP_VERSION=1.0.0
```

### 2. PostgreSQL Database Setup

1. **Install PostgreSQL** (if not already installed)
2. **Create a new database** for the POS system
3. **Run the schema script**:

```bash
psql -d your_database_name -f database/schema.sql
```

### 3. Security Best Practices

#### ✅ DO:
- Use strong, unique passwords for database users
- Enable SSL connections in production
- Use environment variables for all sensitive data
- Regularly rotate JWT secrets
- Use parameterized queries (already implemented)
- Validate all input data

#### ❌ DON'T:
- Hardcode database credentials in source code
- Use default passwords
- Share environment files in version control
- Use weak JWT secrets
- Trust user input without validation

## 🔒 Security Features Implemented

### 1. SQL Injection Prevention
- ✅ All queries use parameterized statements
- ✅ Column names are validated against whitelist
- ✅ Table names are validated against whitelist
- ✅ Input sanitization implemented

### 2. Connection Security
- ✅ Environment variable configuration
- ✅ SSL support for production
- ✅ Connection pooling and error handling
- ✅ Secure credential management

### 3. Data Validation
- ✅ Type checking for all database operations
- ✅ Input validation before database queries
- ✅ Error handling with safe defaults

## 🚀 Deployment Checklist

### Before Deployment:
- [ ] Set up PostgreSQL database
- [ ] Run schema migration
- [ ] Configure environment variables
- [ ] Test database connectivity
- [ ] Verify SSL connections
- [ ] Set strong JWT secret
- [ ] Review security settings

### Production Environment:
- [ ] Use production-grade PostgreSQL instance
- [ ] Enable SSL/TLS encryption
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Monitor database performance
- [ ] Set up logging and alerting

## 🔧 Troubleshooting

### Common Issues:

1. **Connection Failed**
   - Check database URL format
   - Verify credentials
   - Ensure database is running
   - Check firewall settings

2. **SSL Connection Issues**
   - Verify SSL mode in connection string
   - Check certificate validity
   - Ensure SSL is enabled on database

3. **Permission Denied**
   - Check user permissions
   - Verify database access rights
   - Ensure proper role assignments

### Debug Mode:
Set `VITE_ENABLE_DEBUG=true` in your environment to enable detailed logging.

## 📊 Database Schema

The application uses the following main tables:

- **companies** - Company information
- **users** - User authentication
- **employees** - Employee management
- **products** - Product catalog
- **customers** - Customer database
- **transactions** - Sales transactions
- **settings** - Application settings

All tables include:
- UUID primary keys
- Created/updated timestamps
- Soft delete support
- Company-based data isolation

## 🔄 Migration Guide

### From Old Schema:
If migrating from the previous subscription-based schema:

1. Backup existing data
2. Run new schema script
3. Migrate data using provided scripts
4. Update application configuration
5. Test all functionality

### Data Migration Scripts:
See `scripts/migrate-data.sql` for data migration utilities.

## 📞 Support

For database-related issues:
1. Check the troubleshooting section
2. Review error logs
3. Verify environment configuration
4. Contact support with error details
