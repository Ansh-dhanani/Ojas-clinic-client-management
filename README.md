# Ojas Skin Clinic - Client Management System

A modern, comprehensive clinic management system built with Next.js 14, TypeScript, Prisma, and PostgreSQL. This application streamlines patient management, treatment tracking, and payment processing for skin clinics.

## Features

### Authentication & Authorization
- Secure login system using NextAuth.js
- Session-based authentication with protected routes
- Role-based access control infrastructure

### Advanced Client Management
The system provides complete patient profile management with real-time status tracking. Client statuses are automatically calculated based on treatment activity:

- **PENDING** - New clients who haven't had their first session yet
- **ACTIVE** - Clients with ongoing treatments and scheduled appointments
- **COMPLETED** - Clients who have successfully finished their treatment course
- **INACTIVE** - Clients with no activity for 7-60 days (needs follow-up)
- **GHOSTED** - Clients who missed appointments (14+ days overdue) or haven't been in contact for 60+ days
- **CANCELLED** - Clients who have cancelled their treatment

Additional client management features include:
- Quick status updates via dropdown menu without entering edit mode
- Manual status override with transparent display of auto-calculated vs actual status
- Intelligent detection of overdue appointments
- Comprehensive skin profile tracking including skin type, concerns, and medical history
- Full contact management (phone, WhatsApp, email, address)
- Pagination support for managing large client databases

### Session & Treatment Tracking
- Detailed session records with precise timestamps
- Per-session treatment completion tracking
- Next appointment scheduling system
- Before and after photo documentation with modal viewer
- Treatment categorization:
  - Acne Treatment
  - Anti-Aging
  - Hydrafacial
  - Chemical Peels
  - Laser Hair Removal
  - Pigmentation
- Comprehensive session statistics and analytics
- Integrated payment tracking for each session

### Payment Management
The payment system tracks multiple payment statuses automatically:

- **PAID** - Sessions that have been fully paid
- **PARTIAL** - Partially paid sessions with outstanding balance
- **PENDING** - Unpaid sessions
- **OVERDUE** - Payments that are 7+ days past due
- **UPCOMING** - Future scheduled payments

Features include real-time payment calculations, outstanding balance tracking, and payment date management.

### Smart Dashboard & Analytics
- Real-time overview of clinic operations
- Pending payments summary with quick navigation
- Recent client activity feed
- Session statistics and trends
- Client status distribution visualization
- Treatment pattern analysis and recommendations

### Intelligent Status Engine
The system automatically calculates client statuses based on multiple factors:
- Days elapsed since last visit
- Overdue appointment detection (14+ days triggers GHOSTED, 7-13 days triggers INACTIVE)
- Historical missed appointment tracking
- Upcoming scheduled session monitoring
- Treatment completion status

Smart recommendations provide:
- Timely follow-up reminders for inactive clients
- Reconnection strategies for clients who have ghosted
- Proactive appointment scheduling suggestions
- Transparent status override system showing both auto-calculated and manual statuses

### Modern User Interface
- Clean, professional design with gradient accents
- Fully responsive layout optimized for all devices
- Intuitive navigation with clear visual hierarchy
- Real-time data updates powered by React Query
- Toast notifications for immediate user feedback
- Modal-based forms for seamless data entry
- Image zoom functionality for reviewing treatment photos
- Tab-based interfaces for organized information display

### Quality Assurance
- Comprehensive test suite with Jest and React Testing Library
- 105 tests across 11 test suites with 100% pass rate
- Unit tests for utility functions and business logic
- Component tests for UI elements
- API route testing for backend functionality
- Future-proof testing patterns with data-testid attributes

## Quick Start

### Installation

Install all dependencies:

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ojasclinic?schema=public"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

Replace the database connection string with your PostgreSQL credentials.

### Database Setup

Set up your database schema and seed initial data:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npm run prisma:seed
```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

The seeded database includes three test accounts:

- **Admin:** admin@ojasclinic.com / admin123
- **Doctor:** doctor@ojasclinic.com / admin123
- **Staff:** staff@ojasclinic.com / admin123

Remember to change these credentials in production environments.

## Tech Stack

This application is built with modern web technologies:

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **PostgreSQL** - Robust relational database
- **Prisma ORM** - Type-safe database client
- **NextAuth.js** - Authentication solution
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Jest & React Testing Library** - Testing framework

## Available Scripts

```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm test                # Run tests in watch mode
npm run test:ci         # Run all tests once
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema to database
npm run prisma:seed     # Seed database with sample data
npx prisma studio       # Open Prisma Studio GUI
```

## Project Structure

```
ojasclinic-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── clients/           # Client management pages
│   ├── dashboard/         # Dashboard page
│   └── login/             # Authentication pages
├── components/            # React components
│   ├── clients/          # Client-related components
│   ├── common/           # Shared components
│   ├── layout/           # Layout components
│   └── sessions/         # Session components
├── lib/                   # Utility functions and helpers
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
└── __tests__/            # Test files
```

## Development Notes

This project uses the Next.js App Router, which provides server-side rendering and improved routing capabilities. The codebase follows TypeScript best practices with strict type checking enabled.

The testing suite is comprehensive and maintained at 100% pass rate. When adding new features, please include corresponding tests to maintain code quality.

## Contributing

When contributing to this project, please ensure:
- All tests pass before submitting changes
- New features include appropriate test coverage
- Code follows the existing TypeScript and ESLint configurations
- Database schema changes include proper migrations

## License

This project is proprietary software developed for Ojas Skin Clinic.

---

Built for Ojas Skin Clinic
