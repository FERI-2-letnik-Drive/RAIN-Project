# BACKEND DOCKER SETUP

## DOCKER COMPOSE SETUP

### Build And Start Docker Container
```bash
docker compose up --build
```

### Start Docker Container Without Build
```bash
docker compose up
```

### Clean Rebuild And Start Docker Container
```bash
docker compose build --no-cache
docker compose up
```

### Stop And Remove Container
```bash
docker compose down
```

---
## MANUAL SETUP

### Build Docker Image
```bash
docker build -t smartmailbox-backend .
docker build --no-cache -t smartmailbox-backend .
```

---
### Run Docker Container
Env at runtime needed, so we don't pass our credentials with ENV in Dockerfile
```bash
docker run --name smartmailbox_backend_container -p 3001:3001 --env-file .env smartmailbox-backend
```

---
### Stop Docker Container
```bash
docker stop smartmailbox_backend_container
```