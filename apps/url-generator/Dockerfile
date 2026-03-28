FROM node:22-alpine AS deps
RUN apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS dev
CMD ["npx", "nest", "start", "url-generator", "--watch"]

FROM deps AS build
COPY tsconfig*.json nest-cli.json ./
COPY apps/url-generator ./apps/url-generator
COPY libs ./libs
RUN npx nest build url-generator

FROM node:22-alpine AS production
RUN apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/apps/url-generator/main"]
