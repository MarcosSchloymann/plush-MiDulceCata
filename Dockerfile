# Producción para EasyPanel / Docker (DonWeb Cloud Server)
FROM node:20-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY client/package.json client/package-lock.json* ./client/
COPY server/package.json server/package-lock.json* ./server/
# postinstall de Prisma necesita el schema antes del npm install
COPY server/prisma ./server/prisma
RUN npm install --prefix .
RUN npm install --prefix client
RUN npm install --prefix server

FROM deps AS build
COPY . .
RUN npm run build --prefix client
RUN npm run build --prefix server
# Prisma 6 local; el cwd tiene que ser server/ (ahí está prisma/schema.prisma)
RUN cd /app/server && ./node_modules/.bin/prisma generate

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app

COPY --from=build /app/server/package.json ./server/
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/prisma ./server/prisma
COPY --from=build /app/server/seed-images ./server/seed-images
COPY --from=build /app/client/dist ./client/dist

EXPOSE 4000
WORKDIR /app/server
# Prisma local + advisory lock off (Neon)
CMD ["sh", "-c", "PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 ./node_modules/.bin/prisma migrate deploy && node dist/index.js"]
