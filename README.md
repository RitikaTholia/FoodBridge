# FoodShare

FoodShare is a full-stack web platform designed to reduce food waste and combat hunger by connecting restaurants with NGOs. Restaurants can donate surplus food, while NGOs can request and manage food pickups for redistribution to communities in need.

The platform provides separate dashboards and workflows for restaurants and NGOs, enabling efficient coordination, authentication, and food management.

---

## Features

### Authentication

* User Sign Up & Sign In
* Forgot Password / Reset Password
* Protected Routes
* Role-based access (Restaurant / NGO)

### Restaurant Features

* Create food donation listings
* Manage available surplus food
* View donation history
* Track NGO pickup requests

### NGO Features

* Browse available food donations
* Request food pickups
* Manage accepted donations
* Track ongoing distributions

### General Features

* Responsive modern UI
* Role-based dashboards
* Real-time backend integration with Supabase
* Secure authentication and database management

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Router

### Backend & Services

* Supabase

  * PostgreSQL Database
  * Authentication
  * Edge Functions

### Additional Libraries

* React Hook Form
* Zod
* TanStack Query
* Radix UI
* Recharts

---

## Project Structure

```bash
foodshare/
├── public/
├── src/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── integrations/
│   │   └── supabase/
│   ├── pages/
│   └── lib/
├── supabase/
│   ├── functions/
│   └── migrations/
├── package.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

* Node.js
* npm

---

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Navigate into the project:

```bash
cd foodshare
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will run at:

```bash
http://localhost:8080
```

---

## Environment Variables

Create a `.env` file in the root directory and add:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

---

## Supabase Setup

This project uses Supabase for:

* Authentication
* Database management
* Edge Functions
* Backend APIs

Database migrations are available in:

```bash
supabase/migrations
```

---

## Deployment

The project can be deployed on:

* Vercel
* Netlify
* Any Vite-compatible hosting platform

For production deployment:

```bash
npm run build
```

---

## Future Improvements

* Real-time donation tracking
* AI-powered food demand prediction
* NGO verification system
* Delivery partner integration
* Analytics dashboard
* Push notifications

---

## Goal

FoodShare aims to reduce food waste while helping communities facing food insecurity by creating a seamless bridge between food providers and NGOs.

---
