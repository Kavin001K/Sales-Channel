const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

async function updateCredentials() {
  console.log('Updating user credentials in database...');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const client = await pool.connect();
    
    // Update users with correct credentials
    const users = [
      {
        id: 'superadmin',
        email: 'superadmin@pos.com',
        password: 'superadmin123',
        name: 'Super Administrator',
        role: 'super_admin'
      },
      {
        id: 'admin',
        email: 'admin@pos.com',
        password: 'admin123',
        name: 'Company Administrator',
        role: 'admin'
      },
      {
        id: 'manager',
        email: 'manager@pos.com',
        password: 'manager123',
        name: 'Store Manager',
        role: 'manager'
      },
      {
        id: 'cashier',
        email: 'cashier@pos.com',
        password: 'cashier123',
        name: 'Cashier',
        role: 'cashier'
      },
      {
        id: 'sales',
        email: 'sales@pos.com',
        password: 'sales123',
        name: 'Sales Employee',
        role: 'sales'
      },
      {
        id: 'support',
        email: 'support@pos.com',
        password: 'support123',
        name: 'Support Employee',
        role: 'support'
      },
      {
        id: 'defaultcompany',
        email: 'admin@defaultcompany.com',
        password: 'company123',
        name: 'Default Company Admin',
        role: 'company'
      }
    ];

    for (const user of users) {
      // Hash the password (simple base64 for demo, use bcrypt in production)
      const hashedPassword = Buffer.from(user.password).toString('base64');
      
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      );

      if (existingUser.rows.length > 0) {
        // Update existing user
        await client.query(
          `UPDATE users 
           SET password = $1, name = $2, role = $3, updatedAt = NOW()
           WHERE email = $4`,
          [hashedPassword, user.name, user.role, user.email]
        );
        console.log(`✅ Updated user: ${user.email}`);
      } else {
        // Insert new user
        await client.query(
          `INSERT INTO users (id, email, password, name, role, isActive, createdAt, updatedAt)
           VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())`,
          [user.id, user.email, hashedPassword, user.name, user.role]
        );
        console.log(`✅ Created user: ${user.email}`);
      }
    }

    // Update companies with correct credentials
    const companies = [
      {
        id: 'defaultcompany',
        name: 'Default Company',
        email: 'admin@defaultcompany.com',
        password_hash: Buffer.from('company123').toString('base64'),
        address: '123 Business Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zip_code: '600001',
        country: 'India',
        phone: '+91-9876543210',
        tax_id: 'TAX123456789',
        gstin: 'GST123456789',
        is_active: true
      }
    ];

    for (const company of companies) {
      // Check if company exists
      const existingCompany = await client.query(
        'SELECT id FROM companies WHERE email = $1',
        [company.email]
      );

      if (existingCompany.rows.length > 0) {
        // Update existing company
        await client.query(
          `UPDATE companies 
           SET name = $1, password_hash = $2, address = $3, city = $4, state = $5, 
               zip_code = $6, country = $7, phone = $8, tax_id = $9, gstin = $10, 
               is_active = $11, updated_at = NOW()
           WHERE email = $12`,
          [company.name, company.password_hash, company.address, company.city, 
           company.state, company.zip_code, company.country, company.phone, 
           company.tax_id, company.gstin, company.is_active, company.email]
        );
        console.log(`✅ Updated company: ${company.email}`);
      } else {
        // Insert new company
        await client.query(
          `INSERT INTO companies (id, name, email, password_hash, address, city, state, 
                                  zip_code, country, phone, tax_id, gstin, is_active, 
                                  created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
          [company.id, company.name, company.email, company.password_hash, 
           company.address, company.city, company.state, company.zip_code, 
           company.country, company.phone, company.tax_id, company.gstin, company.is_active]
        );
        console.log(`✅ Created company: ${company.email}`);
      }
    }

    client.release();
    await pool.end();
    
    console.log('✅ All credentials updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating credentials:', error.message);
    await pool.end();
  }
}

updateCredentials();
