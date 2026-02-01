# NSS Hour Count Backend

This is the backend code for the NSS Hour Count Portal

## Run Locally

Clone the project

```bash
git clone https://github.com/AtharvAgarwal20/nss-hour-count-backend.git
```

Go to the project directory

```bash
cd nss-hour-count-backend
```

Install dependencies

```bash
npm install
```

Setup .env file

```bash
DATABASE_URL="db url"

PORT=3000

SESSION_SECRET=your_session_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

NODE_ENV=production

BASE_URL=http://localhost:5173
```

Start the server

```bash
npm run dev
```

## Deployment

Setup app.yaml (Google App Engine deployment)

```bash
runtime: nodejs
env: flex
entrypoint: npm run start

runtime_config:
  operating_system: "ubuntu22"

env_variables:
  NODE_ENV: production
  DATABASE_URL: "db_url"
  SESSION_SECRET: session_secret
  GOOGLE_CLIENT_ID: your_google_client_id
  GOOGLE_CLIENT_SECRET: your_google_client_secret
  BASE_URL: http://localhost:5173
```

Build the project

```bash
npm run build
```

Deploy the project

```bash
gcloud app deploy
```

## Authors

- [AtharvAgarwal20](https://github.com/AtharvAgarwal20)
