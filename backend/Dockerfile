# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Development (hot reload)
FROM node:20-alpine AS dev
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 8000
CMD ["npm", "run", "dev"]

# Stage 3: Production
FROM node:20-alpine AS prod
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 8000
CMD ["npm", "run", "start"]
