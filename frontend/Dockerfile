# FROM node:22-alpine AS deps
# WORKDIR /app
# COPY package.json ./
# RUN npm install
# FROM node:22-alpine
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# CMD ["npm","run","dev"]
FROM node:24-alpine

WORKDIR /app


# ============================================================
# Dependencies
# ============================================================

COPY package.json package-lock.json* ./


RUN npm install


# ============================================================
# Application
# ============================================================

COPY . .


EXPOSE 3000


CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]