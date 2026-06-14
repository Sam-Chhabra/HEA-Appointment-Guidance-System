# HEA Appointment Guidance System

A full-stack, web-based hospital appointment guidance and booking system built to fulfill the academic project requirements. 

## Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: SQLite3 (No ORM, using raw SQL queries with strict database transactions)

## Features
- **Symptom Guidance**: A keyword-based recommendation engine for mapping medical needs to specific departments.
- **Booking Management**: Patients can search doctors, view available slots, book appointments, reschedule, and cancel.
- **Admin Tools**: Administrators can manage doctor availability to prevent booking conflicts.
- **Doctor Portal**: Doctors can view their assigned schedules and upcoming appointments (read-only).
- **Strict Consistency**: SQLite transactions guarantee atomicity when booking or rescheduling, preventing double-booking and data inconsistency.
- **Audit Logs**: Every sensitive action (booking, cancelling, admin modifications) is safely logged.

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm

### 1. Start the Backend
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
npm install
npm run seed
npm run dev
```
*Note: The backend runs on port 4000. The `npm run seed` command ensures your database is populated with test accounts and dummy data.*

### 2. Start the Frontend
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
*Note: The frontend runs on port 3000.*

### Default Accounts
The database is automatically seeded with test accounts:
- **Admin**: `admin@hea.test` / `password123`
- **Patient**: `patient@hea.test` / `password123`
- **Doctors**: Check `backend/src/db/seed.ts` for specific doctor accounts.
