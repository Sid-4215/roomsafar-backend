# Roomsafar Backend

A Spring Boot microservices backend for a room booking platform.

## Architecture

| Service            | Port | Description                              |
|--------------------|------|------------------------------------------|
| discovery-service  | 8761 | Eureka service registry (starts first)   |
| room-service       | 8081 | Room listings and search                 |
| payment-service    | 8082 | Razorpay payment processing              |
| user-service       | 8083 | Auth, JWT, Google OAuth                  |
| booking-service    | 8084 | Booking management                       |
| favorites-service  | 8085 | User favorites                           |
| api-gateway        | 8080 | Entry point — routes all traffic         |

## Running

Start all services with the **Start** workflow (runs `start.sh`).  
The API gateway on **port 8080** is the single entry point for all clients.

Build JARs first if needed:
```bash
cd discovery-service/discovery-service && mvn package -DskipTests
cd user-service && mvn package -DskipTests
cd room-service/room-service && mvn package -DskipTests
cd booking-service && mvn package -DskipTests
cd favorites-service && mvn package -DskipTests
cd payment-service/payment-service && mvn package -DskipTests
cd api-gateway/api-gateway && mvn package -DskipTests
```

## API Routes (via gateway on port 8080)

| Path              | Service          |
|-------------------|------------------|
| `/auth/**`        | user-service     |
| `/api/rooms/**`   | room-service     |
| `/api/bookings/**`| booking-service  |
| `/api/favorites/**`| favorites-service|
| `/api/payments/**`| payment-service  |

## Database

Uses Replit's built-in PostgreSQL with separate schemas per service:
- `users` — user-service
- `rooms` — room-service
- `booking` — booking-service
- `favorites` — favorites-service
- `payment` — payment-service (currently unused; service is stateless)

Spring JPA `ddl-auto: update` auto-creates tables on first run.

## Environment Variables

All DB credentials are provided automatically by Replit (`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`).

Secrets to configure:
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — for payment processing (optional until payments are used)

## Tech Stack

- Java 17 / Spring Boot 3.2.5 / Spring Cloud 2023.0.2
- Spring Cloud Netflix Eureka (service discovery)
- Spring Cloud Gateway (API gateway)
- PostgreSQL (via Spring Data JPA)
- JWT + Google OAuth (user-service)

## User Preferences

- Keep existing project structure (one directory per service)
- Mobile app frontend to be built as a follow-up task
