FROM node:24.16.0-alpine

WORKDIR /backend

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3001

CMD ["npm", "start"]