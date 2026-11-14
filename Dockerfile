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
RUN npm install --omit=dev --prefix . 2>/dev/null || npm install --prefix .
RUN npm install --prefix client
RUN npm install --prefix server

FROM deps AS build
COPY . .
# DATABASE_URL hace falta en el build solo si corrés migrate acá; migrate va al arranque.
RUN npm run build --prefix client
RUN npm run build --prefix server
RUN npx prisma generate --schema server/prisma/schema.prisma

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/server/package.json ./server/
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/prisma ./server/prisma
COPY --from=build /app/server/seed-images ./server/seed-images
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/scripts ./scripts

# Cliente de Prisma generado
COPY --from=build /app/server/node_modules/.prisma ./server/node_modules/.prisma
COPY --from=build /app/server/node_modules/@prisma ./server/node_modules/@prisma

EXPOSE 4000

WORKDIR /app/server
# Advisory lock off: Neon pooler / cold start (mismo criterio que Render).
CMD ["sh", "-c", "PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 npx prisma migrate deploy && node dist/index.js"]
