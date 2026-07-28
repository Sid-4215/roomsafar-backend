# Roomsafar — Full Stack Room Booking Platform

A Spring Boot microservices backend + Expo SDK 57 mobile app for room booking.

## Architecture

### Backend Services

| Service            | Port | Description                              |
|--------------------|------|------------------------------------------|
| discovery-service  | 8761 | Eureka service registry (starts first)   |
| room-service       | 8081 | Room listings, search, RoomieSync        |
| payment-service    | 8082 | Razorpay payment processing              |
| user-service       | 8083 | Auth, JWT, Google OAuth                  |
| booking-service    | 8084 | Booking management (create + history)    |
| favorites-service  | 8085 | User favorites                           |
| api-gateway        | 8080 | Entry point — routes all traffic         |

### Mobile App

Expo SDK 57 React Native app in `mobile/`. Runs on:
- **Web preview** — port 5000 (via proxy to Metro on 5001)
- **Native (Expo Go)** — scan the QR code from Metro CLI output

## Running

**Backend** — Start application workflow (runs `start.sh`):
- JARs must be built first (see below)
- API gateway on **port 8080** is the single backend entry point

**Mobile** — RoomSafar Mobile workflow (runs `mobile/start-mobile.sh`):
- Web preview available on **port 5000**
- Metro bundler on **port 5001**
- Proxy routes `/api/` and `/auth/` → backend, everything else → Metro

## Build JARs (required before first run)

```bash
cd discovery-service/discovery-service && mvn package -DskipTests
cd user-service && mvn package -DskipTests
cd room-service/room-service && mvn package -DskipTests
cd booking-service && mvn package -DskipTests
cd favorites-service && mvn package -DskipTests
cd payment-service/payment-service && mvn package -DskipTests
cd api-gateway/api-gateway && mvn package -DskipTests
```

Build them in parallel (faster, Maven cache warms on first build):
```bash
cd /home/runner/workspace
for svc in "user-service" "booking-service" "favorites-service"; do
  (cd $svc && mvn package -DskipTests -q) &
done
for svc in "discovery-service/discovery-service" "room-service/room-service" "payment-service/payment-service" "api-gateway/api-gateway"; do
  (cd $svc && mvn package -DskipTests -q) &
done
wait
```

## API Routes (via gateway on port 8080)

| Path                        | Service          | Auth Required |
|-----------------------------|------------------|---------------|
| `POST /auth/register`       | user-service     | No            |
| `POST /auth/login`          | user-service     | No            |
| `POST /auth/google`         | user-service     | No            |
| `GET /auth/me`              | user-service     | Bearer token  |
| `GET /api/rooms/**`         | room-service     | No (reads)    |
| `POST /api/rooms`           | room-service     | Bearer token  |
| `PUT /api/rooms/{id}`       | room-service     | Bearer token  |
| `DELETE /api/rooms/{id}`    | room-service     | Bearer token  |
| `GET /api/rooms/my-rooms`   | room-service     | Bearer token  |
| `GET /api/roomiesync/**`    | room-service     | Mixed         |
| `POST /api/bookings`        | booking-service  | Bearer token  |
| `GET /api/bookings/my`      | booking-service  | Bearer token  |
| `GET/POST /api/favorites/**`| favorites-service| Bearer token  |
| `POST /api/payments/create-order` | payment-service | Bearer token |

### Gateway Auth Mechanism
- `Authorization: Bearer <JWT>` validated at gateway
- Gateway injects `X-User-Email`, `X-User-Id`, `X-User-Role`, `X-User-Name` headers downstream
- Public paths: all GET `/api/rooms/**`, all `/auth/**`

## Mobile App Screens

| Screen       | Route                  | Description                           |
|--------------|------------------------|---------------------------------------|
| Login        | `/(auth)/login`        | Email/password sign in                |
| Register     | `/(auth)/register`     | Create account                        |
| Home         | `/(tabs)/`             | Featured rooms, areas, all rooms list |
| Search       | `/(tabs)/search`       | Filter by type, furnished, gender     |
| RoomieSync   | `/(tabs)/roomiesync`   | Roommate finder — browse & post       |
| Bookings     | `/(tabs)/bookings`     | My booking history                    |
| Saved        | `/(tabs)/favorites`    | Saved rooms                           |
| My Rooms     | `/(tabs)/my-rooms`     | Host: manage listings                 |
| Profile      | `/(tabs)/profile`      | User info & sign out                  |
| Room Detail  | `/room/[id]`           | Photos, book, favorite, contact       |
| Add Room     | `/room/add`            | Host: create new listing              |
| Edit Room    | `/room/edit`           | Host: update existing listing         |

## Database

Replit's built-in PostgreSQL with separate schemas per service:
- `users` — user-service
- `rooms` — room-service
- `booking` — booking-service
- `favorites` — favorites-service
- `payment` — payment-service (stateless, unused)

Spring JPA `ddl-auto: update` auto-creates tables on first run.

## Environment Variables

DB credentials: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` — auto-provided by Replit.

Optional secrets:
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — payment processing

## Tech Stack

- **Backend**: Java 17+ / Spring Boot 3.2.5 / Spring Cloud 2023.0.2
  - Eureka service discovery, Spring Cloud Gateway, Spring Data JPA, JWT, Google OAuth
- **Mobile**: Expo SDK 57 / React Native 0.86 / expo-router 57.x
  - react-native-paper (Material Design 3), react-native-reanimated 4.x, axios

## User Preferences

- Keep existing project structure (one directory per service)
- Mobile app uses Expo Go (latest SDK)
- Backend and mobile connected with all APIs
