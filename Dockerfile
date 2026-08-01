# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder  
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .


# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN chown -R node:node /app
USER node

COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

# Now Docker knows 'builder' refers to Stage 1!
COPY --chown=node:node --from=builder /app/src ./src

EXPOSE 3000
CMD ["node", "src/server.js"]