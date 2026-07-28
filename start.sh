#!/bin/bash
# Roomsafar - Start all microservices
set -e

JVM_OPTS="-Xmx256m -Xms64m -XX:+UseSerialGC"

echo "============================================"
echo "  Starting Roomsafar Backend Services"
echo "============================================"

# 1. Discovery Service (Eureka) — must start first
echo "[1/7] Starting Discovery Service (Eureka) on port 8761..."
java $JVM_OPTS -jar discovery-service/discovery-service/target/discovery-service-0.0.1-SNAPSHOT.jar &
DISCOVERY_PID=$!
echo "  Discovery PID: $DISCOVERY_PID"

echo "  Waiting 20s for Eureka to be ready..."
sleep 20

# 2. User Service
echo "[2/7] Starting User Service on port 8083..."
java $JVM_OPTS -jar user-service/target/user-service-1.0.0.jar &
USER_PID=$!
echo "  User PID: $USER_PID"

# 3. Room Service
echo "[3/7] Starting Room Service on port 8081..."
java $JVM_OPTS -jar room-service/room-service/target/room-service-0.0.1-SNAPSHOT.jar &
ROOM_PID=$!
echo "  Room PID: $ROOM_PID"

# 4. Booking Service
echo "[4/7] Starting Booking Service on port 8084..."
java $JVM_OPTS -jar booking-service/target/booking-service-1.0.0.jar &
BOOKING_PID=$!
echo "  Booking PID: $BOOKING_PID"

# 5. Favorites Service
echo "[5/7] Starting Favorites Service on port 8085..."
java $JVM_OPTS -jar favorites-service/target/favorites-service-1.0.0.jar &
FAVORITES_PID=$!
echo "  Favorites PID: $FAVORITES_PID"

# 6. Payment Service
echo "[6/7] Starting Payment Service on port 8082..."
java $JVM_OPTS -jar payment-service/payment-service/target/payment-service-0.0.1-SNAPSHOT.jar &
PAYMENT_PID=$!
echo "  Payment PID: $PAYMENT_PID"

echo "  Waiting 15s for services to register with Eureka..."
sleep 15

# 7. API Gateway — starts last so all services are registered
echo "[7/7] Starting API Gateway on port 8080..."
java $JVM_OPTS -jar api-gateway/api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar &
GATEWAY_PID=$!
echo "  Gateway PID: $GATEWAY_PID"

echo ""
echo "============================================"
echo "  All services started!"
echo "  API Gateway (entry point): port 8080"
echo "  Eureka Dashboard:          port 8761"
echo "============================================"

# Trap SIGTERM/SIGINT to shut down all services gracefully
cleanup() {
  echo "Shutting down all services..."
  kill $DISCOVERY_PID $USER_PID $ROOM_PID $BOOKING_PID $FAVORITES_PID $PAYMENT_PID $GATEWAY_PID 2>/dev/null
  exit 0
}
trap cleanup SIGTERM SIGINT

# Keep script alive
wait
