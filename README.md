# 🎯 FlerDB - Event Management & Sponsorship Platform

A modern, full-featured event management system designed to streamline sponsorship coordination, logistics planning, and team collaboration. Built with React, TypeScript, and Supabase, FlerDB provides a comprehensive solution for organizing and managing large-scale events.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Building for Production](#-building-for-production)
- [API & Database](#-api--database)
- [Project Architecture](#-project-architecture)
- [Key Features in Detail](#-key-features-in-detail)
- [Contributing](#-contributing)
- [Security](#-security)
- [License](#-license)

---

## ✨ Features

### Core Functionality
- **🔐 Secure Authentication** - Email-based authentication with role-based access control
- **📊 Event Management** - Create, track, and manage multiple events with detailed status monitoring
- **🤝 Sponsorship Coordination** - Track sponsorship status, manage contacts, and handle negotiations
- **📦 Logistics Dashboard** - Resource allocation and tracking (hotels, venues, catering, goodies)
- **👥 Team Collaboration** - Organized team structure with role assignments and performance tracking
- **📈 Performance Analytics** - Real-time statistics and completion rate tracking
- **🏆 Ranking System** - Built-in ranking and leaderboard functionality for competitive teams

### User Features
- **Responsive Dashboard** - Real-time insights into event progress and team performance
- **Contact Management** - Track all company communications (email, phone, LinkedIn, outings)
- **Database Management** - Comprehensive company and resource database
- **Team Reports** - Detailed team performance and contribution reports
- **Mobile-Friendly** - Bottom navigation and responsive design for all devices

---

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **React Router 7** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable SVG icons

### Backend & Database
- **Supabase** - Open-source Firebase alternative
- **PostgreSQL** - Robust relational database
- **Supabase Auth** - Built-in authentication system

### Development Tools
- **ESLint** - Code quality and style consistency
- **TypeScript ESLint** - TypeScript-aware linting
- **PostCSS** - CSS transformations
- **Autoprefixer** - Automatic vendor prefixes

---

## 📁 Project Structure

```
FlerDB/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components (Button, Card, Modal, etc.)
│   │   ├── Sidebar.tsx          # Main navigation sidebar
│   │   ├── BottomNav.tsx        # Mobile bottom navigation
│   │   └── RankingLeaderboard.tsx # Ranking display component
│   ├── pages/                   # Page components
│   │   ├── Auth.tsx             # Authentication page
│   │   ├── Home.tsx             # Dashboard home
│   │   ├── Events.tsx           # Event listing and management
│   │   ├── Teams.tsx            # Team management
│   │   ├── Profile.tsx          # User profile
│   │   ├── Database.tsx         # Company/Resource database
│   │   ├── logistics/           # Logistics team pages
│   │   └── sponsoring/          # Sponsoring team pages
│   ├── layouts/
│   │   └── DashboardLayout.tsx  # Main dashboard layout wrapper
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client configuration
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── constants.ts         # Application constants
│   │   ├── mockData.ts          # Mock data for development
│   │   ├── database.types.ts    # Auto-generated Supabase types
│   │   └── ranking.ts           # Ranking calculation logic
│   ├── App.tsx                  # Main app component and routing
│   ├── main.tsx                 # React DOM entry point
│   ├── index.css                # Global styles
│   └── App.css                  # App-specific styles
├── supabase/
│   └── migrations/              # Database migration scripts
├── public/                      # Static assets
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── eslint.config.js            # ESLint configuration
├── package.json                # Project dependencies
└── index.html                  # HTML entry point
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- A **Supabase account** (create one at [supabase.com](https://supabase.com))

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/FlerDB.git
cd FlerDB
```

### 2. Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

---

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**How to get these credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Navigate to Project Settings → API
4. Copy your project URL and anon key

### 2. Configure Allowed Emails

Edit [src/lib/constants.ts](src/lib/constants.ts) to add authorized user emails:

```typescript
export const ALLOWED_EMAILS = [
    'user1@example.com',
    'user2@example.com',
    // Add more emails here
].map(email => email.toLowerCase().trim());
```

### 3. Database Setup

Run the migration scripts in order:

```bash
# From supabase dashboard, run these SQL migrations:
supabase/migrations/add_ranking_system.sql
supabase/migrations/add_event_id_to_companies.sql
```

Or execute them through the Supabase dashboard SQL editor.

---

## 💻 Running the Application

### Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` with hot module replacement (HMR) enabled.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Run Linter

```bash
npm run lint
```

---

## 📊 API & Database

### Core Data Types

The application uses the following main data types:

**User**
- ID, Email, Name, Role (admin/user)
- Team Assignment, Contact/Company/Event counts
- Ranking score

**Event**
- ID, Name, Date, Status (planned/ongoing/finished/completed)
- Description, Logo
- Associated companies and resources

**Company**
- ID, Name, Status (contacted/pending/signed/rejected)
- Assigned Team Member, Contact Method
- Notes and metadata

**Resource** (for Logistics)
- ID, Name, Type (hotel/venue/food/goodies)
- Status, Assigned Team Member
- Event Association

**Team**
- ID, Name, Description
- Member Count, Team-specific dashboards

### Supabase Tables
- `profiles` - User profiles and team assignments
- `events` - Event records
- `companies` - Sponsorship company tracking
- `resources` - Logistics resources
- `rankings` - Ranking data and leaderboards

---

## 🏗️ Project Architecture

### Authentication Flow
1. User lands on Landing page
2. Redirected to Auth page if not authenticated
3. Supabase PKCE flow handles email verification
4. Email whitelist validation in `createProfileIfNeeded()`
5. User profile auto-created on first login
6. Role-based access control enforced

### Component Hierarchy
```
App
├── Auth (Protected)
├── Landing (Public)
└── DashboardLayout (Protected)
    ├── Sidebar (Navigation)
    ├── BottomNav (Mobile)
    └── Routes
        ├── Home
        ├── Events
        ├── Teams (with sub-routes)
        ├── Sponsoring
        ├── Logistics
        └── Profile
```

### State Management
- **Component State** - Uses React hooks (useState, useEffect)
- **Database State** - Synced via Supabase real-time queries
- **Auth State** - Managed through Supabase session

### Data Flow
1. Components fetch data from Supabase on mount
2. Real-time subscriptions update state automatically
3. User actions trigger mutations
4. Optimistic updates for better UX

---

## 🎯 Key Features in Detail

### Event Management
- **Create Events** - Initialize new events with metadata
- **Track Status** - Monitor event lifecycle (planned → ongoing → completed)
- **Event Dossier** - Detailed event information and documents

### Sponsorship Workflow
- **Company Database** - Centralized company contact list
- **Status Tracking** - From initial contact through signed agreements
- **Communication Log** - Track all interactions and methods
- **Team Assignment** - Assign team members to sponsorship opportunities

### Logistics Coordination
- **Resource Allocation** - Manage hotels, venues, catering, goodies
- **Status Monitoring** - Real-time resource availability
- **Contact Management** - Vendor and supplier information

### Team Collaboration
- **Team Dashboards** - Specialized views for each team
- **Performance Metrics** - Contribution and completion tracking
- **Ranking System** - Gamified team performance tracking
- **Team Reports** - Comprehensive activity summaries

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** - `git checkout -b feature/amazing-feature`
3. **Commit your changes** - `git commit -m 'Add amazing feature'`
4. **Push to the branch** - `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style Guidelines
- Use TypeScript for all new code
- Follow ESLint rules (`npm run lint`)
- Write meaningful commit messages
- Add comments for complex logic

---

## 🔒 Security

### Security Features Implemented
- **Email Whitelist** - Only authorized emails can access the system
- **PKCE Flow** - Secure authentication without storing passwords
- **Row-Level Security** - Enforce data access at database level
- **Environment Variables** - Sensitive data never hardcoded
- **Session Management** - Automatic token refresh and persistence

### Best Practices
- Never commit `.env.local` to version control
- Regularly update dependencies: `npm update`
- Review authentication logs in Supabase dashboard
- Implement RLS policies for all tables
- Use HTTPS in production

### For Production Deployment
1. Update `ALLOWED_EMAILS` with your actual users
2. Configure Supabase RLS policies
3. Set up database backups
4. Enable API rate limiting
5. Monitor authentication logs

---

## 📝 License

This project is proprietary and confidential. All rights reserved.

---

## 📞 Support & Contact

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Contact the development team

---

## 🎉 Acknowledgments

Built with modern web technologies for efficient event management and team collaboration.
wiiiiiii
**Happy organizing! 🚀**
