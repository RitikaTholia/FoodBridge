# FoodShare

FoodShare is a full-stack food redistribution platform designed to reduce food waste and fight hunger by connecting restaurants with NGOs. Restaurants can donate surplus food, while NGOs can browse and claim available food listings for redistribution to communities in need.

The platform includes secure authentication, role-based dashboards, food categorization, and real-time workflow management for handling food requests efficiently.

---

## Live Demo

Live Website: https://food-bridge-eight-jade.vercel.app/

---

## Features

### Authentication & Security

* User Sign Up & Sign In
* Forgot Password / Reset Password
* Protected Routes
* Role-Based Access Control (Restaurant / NGO)
* Secure backend authentication using Supabase

---

### Restaurant Features

* Create food donation listings
* Categorize food as:

  * Vegan
  * Vegetarian
  * Non-Vegetarian
* Indian-standard food symbols display:

  * 🟢 Vegetarian
  * 🔺 Non-Vegetarian
* Manage active food listings
* View incoming NGO food requests
* Automatic listing status updates after claims

---

### NGO Features

* Browse available food donations
* Request and claim food listings
* Manage accepted food pickups
* Track donation availability in real time

---

### General Features

* Responsive modern UI
* Separate dashboards for NGOs and restaurants
* Real-time backend integration with Supabase
* Persistent database storage
* Production deployment with Vercel
* Environment variable configuration for secure deployment

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Router DOM

---

### Backend & Services

* Supabase

  * PostgreSQL Database
  * Authentication
  * Edge Functions
  * Real-time backend services

---

### Additional Libraries

* TanStack Query
* React Hook Form
* Zod
* Radix UI
* Recharts
* Lucide React

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

## Installation & Setup

### Prerequisites

* Node.js
* npm

---

### Clone Repository

```bash
git clone <your-repository-url>
```

---

### Navigate To Project

```bash
cd foodshare
```

---

### Install Dependencies

```bash
npm install
```

---

### Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

---

### Run Development Server

```bash
npm run dev
```

Application runs at:

```bash
http://localhost:8080
```

---

## Deployment

The application is deployed using Vercel.

Production build command:

```bash
npm run build
```

---

## Future Improvements

* Real-time notifications
* Food pickup scheduling
* NGO verification workflow
* Analytics dashboard
* AI-powered food demand prediction
* Delivery partner integration
* Push notifications

---

## Goal

FoodShare aims to reduce food wastage while helping communities facing food insecurity by creating a seamless bridge between food providers and NGOs.

---
