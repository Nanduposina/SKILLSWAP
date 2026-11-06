FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/frontend/package*.json ./src/frontend/
RUN cd src/frontend && npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .

FROM base AS development
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm run build
ENV NODE_ENV=production
EXPOSE 5002
CMD ["npm", "start"]
