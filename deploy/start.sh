#!/bin/bash
# Zazene CELOTEN sistem (mongo + ORV API + RAIN backend + frontend) z eno skripto.
set -e
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "Manjka .env -> kopiram iz .env.example (nastavi DOCKERHUB_USERNAME)."
  cp .env.example .env
fi
if [ ! -f backend.env ]; then
  echo "Manjka backend.env -> kopiram iz backend.env.example (nastavi SESSION_SECRET)."
  cp backend.env.example backend.env
fi

echo "Poganjam celoten sistem (docker compose, prod slike z Docker Huba)..."
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

echo
echo "Sistem tece:"
echo "  - Frontend (portal):  http://localhost:3000"
echo "  - Backend (API):      http://localhost:3001"
echo "  - ORV face API:       http://localhost:3002"
