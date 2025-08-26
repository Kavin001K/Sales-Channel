# replit.md

## Overview

This is a comprehensive Point of Sale (POS) system built with React and Express.js called "Ace-Bill" or "rest-express". The application provides a full-featured retail management solution with support for sales transactions, inventory management, customer relationship management, employee management, and administrative functions. The system supports both individual company operations and multi-tenant subscription management for software companies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks with custom context providers for authentication and data management
- **Data Fetching**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing with protected routes
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Session-based authentication with bcrypt for password hashing
- **Storage Strategy**: Offline-first approach with local storage fallback and server synchronization
- **Build Process**: ESBuild for server bundling, Vite for client bundling

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **Local Storage**: Browser localStorage for offline-first functionality
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **File Storage**: Local file system for attachments and assets
- **Data Sync**: Custom synchronization service for offline/online data consistency

### Authentication and Authorization
- **Multi-level Authentication**: Company login, employee login, and admin login systems
- **Role-based Access Control**: Different permission levels for admins, managers, cashiers, and custom roles
- **Session Security**: Secure session management with lockout mechanisms for failed login attempts
- **Input Sanitization**: Server-side validation and sanitization for all user inputs

### External Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Payment Processing**: Placeholder for future payment gateway integration
- **Printing**: ESC/POS thermal printer support with multiple driver options
- **Email**: Ready for email service integration (currently mocked)
- **File Processing**: XLSX library for Excel import/export functionality
- **Charts**: Recharts library for data visualization and reporting
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation and formatting

## Key Features

### Core POS Functionality
- Sales transaction processing with barcode/SKU scanning
- Shopping cart management with real-time inventory checking
- Multiple payment methods (cash, card, digital wallet) with split payments
- Receipt generation and thermal printing
- Real-time inventory tracking and low stock alerts

### Business Management
- Product catalog management with categories, suppliers, and variants
- Customer relationship management with loyalty tracking
- Employee management with role-based permissions
- Comprehensive reporting and analytics dashboard
- Invoice generation with multiple templates

### Multi-tenant Capabilities
- Subscription plan management for software companies
- Company onboarding and management
- Support ticket system
- CRM functionality for software company operations
- Administrative dashboards for different user types

### Technical Features
- Offline-first architecture with automatic synchronization
- Responsive design for desktop and mobile use
- Real-time data updates and error handling
- Comprehensive audit logging and security measures
- Excel import/export functionality for bulk data operations