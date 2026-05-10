# Relay

A short URL platform with click analytics, QR code generation, and a microservices architecture.

## Features

- Generate short URLs with optional custom slugs and expiration dates
- Redirect short URLs with Redis caching
- Track clicks with aggregated analytics (daily counts, top referrers)
- Generate QR codes (PNG or SVG) for any short URL
- JWT authentication via signed HTTP-only cookies
- Rate limiting backed by Redis

## Architecture

Two services communicate over gRPC and RabbitMQ:

```
Client → relay (HTTP :3000) → url-generator (gRPC :5001)
                ↕                      ↕
            MongoDB              PostgreSQL
                ↕                      ↕
              Redis             RabbitMQ (queue: main)
```

### relay

The main REST API. Handles auth, short URL management, redirects, and analytics. Stores users, URL mappings, and click events in MongoDB. Caches redirects and QR codes in Redis.

### url-generator

A gRPC + RabbitMQ microservice that manages a pool of pre-generated base62 short URL keys in PostgreSQL. A cron job keeps the pool above a minimum threshold. Keys are locked with pessimistic row-level locks during reservation.

### Messaging

| Pattern | Direction | Purpose |
|---|---|---|
| `GetShortUrl` (gRPC) | relay → url-generator | Reserve a short URL key |
| `verify_and_unreserve_short_url` | relay → relay | Check if a mapping was saved; release lock if not |
| `unreserve_short_url` | relay → url-generator | Release a previously reserved key |

## Tech Stack

- **Framework**: NestJS 11, TypeScript 5.7
- **Databases**: MongoDB (Mongoose), PostgreSQL (TypeORM)
- **Cache / Rate limiting**: Redis (cache-manager, @nest-lab/throttler-storage-redis)
- **Transport**: gRPC (@grpc/grpc-js), RabbitMQ (amqplib)
- **Auth**: JWT + signed HTTP-only cookies
- **QR codes**: qrcode

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `JWT_SECRET` | JWT signing secret | — |
| `MONGO_URI` | MongoDB connection URI | — |
| `DATABASE_URL` | PostgreSQL connection URL | — |
| `RMQ_URL` | RabbitMQ connection URL | — |
| `REDIS_HOST` | Redis host | — |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | — |
| `REDIS_TLS` | Enable Redis TLS | `false` |
| `GRPC_URL` | gRPC server bind address | `0.0.0.0:5001` |
| `GRPC_CLIENT_URL` | gRPC client address (from relay) | — |
| `BASE_URL` | Base URL used in QR code links | — |
| `SHORT_URL_BATCH_SIZE` | Keys generated per cron run | `400` |
| `SHORT_URL_MIN_POOL_SIZE` | Minimum unused keys before refill | `1000` |
| `SHORT_URL_CRON` | Cron expression for pool maintenance | `45 * * * * *` |
| `REDIRECT_CACHE_TTL` | Redirect cache TTL in ms | `3600000` |

## Running the App

### Docker (recommended)

```bash
# Production
docker compose up

# Development (file watch + volume mounts)
docker compose -f docker-compose.yml -f docker-compose.override.yml up
```

### Local

```bash
npm install

# Start both services in watch mode
npm run start:dev
npm run start:url-generator:dev
```

## API

Swagger docs are available at `http://localhost:3000/api/v1/docs` when the relay service is running.

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Login (returns JWT cookie). Rate limited to 5 req/min |

### Short URLs

| Method | Path | Description |
|---|---|---|
| `POST` | `/short-url` | Reserve a short URL |
| `GET` | `/short-url` | List short URLs for the current user (paginated) |
| `GET` | `/short-url/:shortUrl/analytics` | Click events for a short URL (paginated) |
| `GET` | `/short-url/:shortUrl/analytics/summary` | Aggregated analytics summary |
| `GET` | `/short-url/:shortUrl/qr` | QR code (PNG or SVG) |

### Redirect

| Method | Path | Description |
|---|---|---|
| `GET` | `/:shortUrl` | Redirect to the long URL. Rate limited to 100 req/min |

## Testing

```bash
npm run test          # Unit tests
npm run test:cov      # Coverage report
npm run test:e2e      # End-to-end tests
```
