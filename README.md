# Sales Channel - POS System

A modern Point of Sale (POS) system built with React, TypeScript, and PostgreSQL. This application can run as both a web application and a desktop application using Electron.

## Features

- **Product Management**: Add, edit, and manage products with categories, SKUs, and barcodes
- **Customer Management**: Track customer information and purchase history
- **Employee Management**: Manage staff information and roles
- **Transaction Processing**: Complete sales with multiple payment methods
- **Inventory Tracking**: Real-time stock management with low stock alerts
- **Sales Reports**: Comprehensive analytics and reporting
- **Receipt Printing**: Customizable receipt templates
- **Database**: PostgreSQL database with Neon cloud hosting
- **Desktop App**: Electron-based desktop application

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Database**: PostgreSQL (Neon cloud)
- **Desktop**: Electron
- **Build Tool**: Vite
- **State Management**: React Query
- **Forms**: React Hook Form with Zod validation

## Database Setup

The application uses PostgreSQL hosted on Neon. The database is automatically set up with all necessary tables and sample data.

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL database (already configured)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Sales-Channel
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run setup-db
```

This will:
- Connect to the Neon PostgreSQL database
- Create all necessary tables (products, customers, employees, transactions, settings)
- Insert sample data
- Create performance indexes

## Running the Application

### Web Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Desktop Application (Electron)

#### Development Mode
```bash
npm run electron:dev
```
This starts both the Vite dev server and Electron app.

#### Production Build
```bash
npm run electron:build
```
Creates distributable packages for Windows, macOS, and Linux.

### Database Operations

The application uses a PostgreSQL database with the following main tables:

- **products**: Product catalog with pricing and inventory
- **customers**: Customer information and purchase history
- **employees**: Staff management
- **transactions**: Sales records with detailed item breakdown
- **settings**: Application configuration

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── pos/            # POS-specific components
│   │   ├── layout/         # Layout components
│   │   └── import/         # Import functionality
│   ├── pages/              # Application pages
│   ├── lib/                # Utilities and services
│   │   ├── database.ts     # Database service
│   │   ├── postgres-database.ts # PostgreSQL implementation
│   │   └── types.ts        # TypeScript types
│   └── hooks/              # Custom React hooks
├── electron/               # Electron configuration
│   ├── main.js            # Main process
│   └── preload.js         # Preload script
├── scripts/               # Database setup scripts
└── public/               # Static assets
```

## Database Schema

### Products Table
- `id`: Primary key
- `name`: Product name
- `description`: Product description
- `price`: Selling price
- `cost`: Cost price
- `stock`: Current inventory
- `category`: Product category
- `barcode`: Product barcode
- `sku`: Stock keeping unit
- `image`: Product image URL
- `is_active`: Active status
- `created_at`, `updated_at`: Timestamps

### Customers Table
- `id`: Primary key
- `name`: Customer name
- `email`: Email address
- `phone`: Phone number
- `address`, `city`, `state`, `zip_code`, `country`: Address fields
- `notes`: Additional notes
- `total_spent`: Total amount spent
- `visit_count`: Number of visits
- `last_visit`: Last visit timestamp
- `is_active`: Active status
- `created_at`, `updated_at`: Timestamps

### Transactions Table
- `id`: Primary key
- `customer_id`: Foreign key to customers
- `employee_id`: Foreign key to employees
- `items`: JSONB array of transaction items
- `subtotal`: Pre-tax amount
- `tax`: Tax amount
- `discount`: Discount amount
- `total`: Final total
- `payment_method`: Payment method used
- `status`: Transaction status
- `notes`: Additional notes
- `timestamp`: Transaction timestamp

## Features

### POS System
- Quick product search and scanning
- Real-time inventory updates
- Multiple payment methods
- Receipt generation
- Customer lookup and history

### Inventory Management
- Stock level tracking
- Low stock alerts
- Product categories
- Barcode scanning support
- Cost and profit tracking

### Customer Management
- Customer profiles
- Purchase history
- Contact information
- Customer notes and preferences

### Reporting
- Sales reports by date range
- Top-selling products
- Customer analytics
- Employee performance
- Inventory reports

### Settings
- Company information
- Tax rates
- Receipt customization
- System preferences

## Development

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update database schema if needed
4. Add types in `src/lib/types.ts`
5. Update database service in `src/lib/postgres-database.ts`

### Database Changes

To modify the database schema:

1. Update the setup script in `scripts/setup-database.cjs`
2. Run `npm run setup-db` to apply changes
3. Update the PostgreSQL service in `src/lib/postgres-database.ts`

## Building for Production

### Web Application
```bash
npm run build
```

### Desktop Application
```bash
npm run electron:build
```

This creates distributable packages for:
- Windows (.exe installer)
- macOS (.dmg)
- Linux (AppImage)

## Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string (configured for Neon)
- `NODE_ENV`: Environment mode (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.
