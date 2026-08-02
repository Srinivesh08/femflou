# Femflou Monorepo

This repository is structured as a monorepo containing a `frontend` and `backend` workspace.

## Prerequisites

- Node.js
- npm (workspaces are enabled via the root package.json)

## Workspaces

- **`frontend`**: The Vite + React application.
- **`backend`**: The backend service (currently a placeholder).

## Running the Project

To install dependencies for all workspaces, simply run `npm install` at the root directory:

```bash
npm install
```

To run both the frontend and backend simultaneously:

```bash
npm run dev
```

You can also run them individually:

```bash
npm run dev:frontend
npm run dev:backend
```
