# 🏥 Ojas Skin Clinic - Management System MVP

Complete clinic management system built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## ✨ Features

### 🔐 Authentication & Authorization
- Role-based access control (Admin, Doctor, Staff, Client)
- Secure login with NextAuth.js
- Session management

### 👥 Client Management
- Complete patient profiles with medical history
- Skin condition tracking
- Photo documentation
- Client status management (Active/Inactive)

### 💉 Session & Treatment Tracking
- Detailed session records
- Before/after treatment documentation
- Treatment performance tracking
- Doctor notes and prescriptions

### 🧠 Smart Recommendation Engine
- Automated treatment suggestions based on:
  - Acne severity (mild/moderate/severe)
  - Pigmentation levels
  - Skin dullness scale
  - Hair density for LHR
  - Scar types
- AI-powered product recommendations

### 📦 Package Management
- Treatment packages with multiple sessions
- Session tracking (completed/remaining)
- Validity period management

### 💰 Payment & Invoicing
- Invoice generation
- Payment tracking (Cash/UPI/Card/Online)
- GST calculations

### 📊 Dashboard & Analytics
- Real-time clinic statistics
- Revenue tracking
- Session analytics
- Treatment category breakdown

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ojasclinic?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Default Login Credentials

**Admin:** `admin@ojasclinic.com` / `admin123`
**Doctor:** `doctor@ojasclinic.com` / `admin123`
**Staff:** `staff@ojasclinic.com` / `admin123`

## 🎨 Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL with Prisma ORM
- NextAuth.js
- React Hook Form + Zod

## 🔧 Available Scripts

```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run prisma:generate # Generate Prisma client
npm run prisma:push    # Push schema to database
npm run prisma:seed    # Seed database
npm run prisma:studio  # Open Prisma Studio
```

---

Built with ❤️ for Ojas Skin Clinic

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
