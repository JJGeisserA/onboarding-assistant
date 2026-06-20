# Developer Environment Setup

## Prerequisites

- **Node.js**: v18.x or higher (use nvm to manage versions)
- **Python**: 3.10 or higher
- **Docker**: Docker Desktop 4.x
- **Git**: 2.40+

## Initial Setup Steps

### 1. Clone the repositories

All repositories live under the `projects/` directory in the workspace. Clone using SSH:

```bash
git clone git@github.com:your-org/api-service.git
git clone git@github.com:your-org/frontend-app.git
```

### 2. Install dependencies

For the frontend application:
```bash
cd frontend-app
npm install
```

For backend services:
```bash
cd api-service
pip install -r requirements.txt
```

### 3. Environment variables

Copy the `.env.example` file to `.env` in each service directory and fill in the values. You can get the development credentials from the team's shared 1Password vault under the "Dev Environment" folder.

Never commit `.env` files to version control.

### 4. Start local services with Docker

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432, Redis on port 6379, and the local S3-compatible service on port 9000.

### 5. Run database migrations

```bash
cd api-service
python manage.py migrate
```

### 6. Start the development servers

Frontend (runs on port 3000):
```bash
npm run dev
```

Backend API (runs on port 8000):
```bash
python manage.py runserver
```

## Common Setup Issues

**Port already in use**: Run `lsof -i :3000` to find and kill the conflicting process.

**Docker not starting**: Make sure Docker Desktop is running before executing `docker-compose up`.

**Database connection refused**: Ensure the Docker containers are healthy with `docker-compose ps`.

**Node version mismatch**: Run `nvm use` inside the project directory — there is an `.nvmrc` file that sets the correct version automatically.
