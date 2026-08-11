# FEMFLOU - Intelligent Maternal Health Diagnostics

FEMFLOU is a full-stack AI-assisted maternal health screening platform. This repository is structured as a monorepo containing a React/Vite frontend and a Node.js/Express backend, all managed concurrently.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TypeScript, TailwindCSS, Framer Motion, Recharts, Zustand, React Query
- **Backend:** Node.js, Express, TypeScript, Prisma (ORM)
- **Database:** PostgreSQL

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### 1. Prerequisites

Before you begin, ensure you have the following installed on your computer:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/download/) (Installed and running on port `5432`)
- Git

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd femflou
```

### 3. Install Dependencies

Since this is a monorepo, you can install dependencies for both the frontend and backend from the root directory using a single command:

```bash
npm install
```

*(This command also automatically generates the Prisma Client for the backend).*

### 4. Database Setup

1. Open **pgAdmin 4** (or your preferred Postgres client).
2. Create a new database named **`femflou`**.
3. In the project, navigate to the `backend` folder and create a `.env` file (you can copy `.env.example` if it exists).
4. Add your database connection string to `backend/.env`. 

It should look like this:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/femflou?schema=public"
JWT_SECRET="super-secret-key-change-me"
JWT_EXPIRES_IN="7d"
PORT="4000"
FRONTEND_URL="http://localhost:5173"
```
> **⚠️ IMPORTANT:** Replace `YOUR_PASSWORD` with the password you set during your PostgreSQL installation. If your password contains special characters like `@`, you **must** URL-encode them (e.g., change `@` to `%40`).

### 5. Initialize the Database (Prisma)

Once your `.env` is configured, push the Prisma schema to your database to create the required tables:

```bash
cd backend
npx prisma db push
```

**(Optional but recommended):** Seed the database with initial calibration data and mock users:
```bash
npx prisma db seed
```

---

## 🏃‍♂️ Running the Application

To start both the frontend and backend development servers concurrently, run this command from the **root directory** (`/femflou`):

```bash
npm run dev
```

- **Frontend:** Open your browser to `http://localhost:5173`
- **Backend API:** Running on `http://localhost:4000`

### Running Workspaces Individually
If you prefer to run them separately in different terminal windows:

```bash
npm run dev:frontend  # Starts only the React app
npm run dev:backend   # Starts only the Node/Express server
```

## 🏗️ Building for Production

To build the frontend application for production:

```bash
npm run build
```
This will create a `dist` folder in the root containing your optimized static assets.
