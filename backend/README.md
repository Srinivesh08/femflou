# Backend API

This is the Express backend for FEMFLOU.

## Setup Instructions

1. Start the local database (from the repo root):
   ```bash
   docker compose up -d
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies (from the repo root or inside `backend/`):
   ```bash
   npm install
   ```

4. Initialize Prisma and push schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The server will be available at `http://localhost:4000`. You can check the health status at `http://localhost:4000/api/health`.

## Production Deployment

### Required Environment Variables
Ensure the following variables are set in your production environment:
- `DATABASE_URL`: Connection string for the production PostgreSQL database.
- `JWT_SECRET`: A strong, randomly generated secret for signing JWTs.
- `JWT_EXPIRES_IN`: e.g., `7d` or `24h`.
- `PORT`: Usually provided by the hosting service (default is 4000).
- `FRONTEND_URL`: The origin URL of the deployed frontend for CORS configuration.

### Running Migrations
In production, do not use `npx prisma db push`. Instead, apply structured migrations:
```bash
npx prisma migrate deploy
```

### File Storage
By default, the backend stores image uploads on the local disk inside the `uploads/` folder using `multer.memoryStorage()` for temporary buffers and moving them locally, though currently implemented in memory in the `sample.routes.ts` configuration.
Before scaling to multiple instances or deploying statelessly (e.g., Docker, AWS ECS, Heroku), you must swap local disk storage for an external provider (like Amazon S3 or Google Cloud Storage) using a `StorageProvider` abstraction.
