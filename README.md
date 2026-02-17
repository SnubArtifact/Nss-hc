# NSS Hour Count Portal

A unified repository for the NSS Hour Count management system.

## Project Structure

- `frontend`: React/Vite frontend application.
- `backend`: Express/TypeScript/Prisma backend application.

## Getting Started

### Prerequisites

- Node.js (v20+)
- PostgreSQL

### Installation

1. Clone the repository.
2. Install dependencies for both parts:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

### Running Locally

1. Setup environment variables in `backend/.env` (see `.env.template`).
2. Run backend:
   ```bash
   cd backend && npm run dev
   ```
3. Run frontend:
   ```bash
   cd frontend && npm run dev
   ```

## Development

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)
- API Docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
