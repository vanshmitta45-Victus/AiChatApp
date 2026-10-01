# ==============================================================================
# Multi-Stage Dockerfile for Spring Boot 3 Backend
# ==============================================================================

# Stage 1: Build the Application
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace/app

# Copy gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Make gradlew executable
RUN chmod +x gradlew

# Pre-fetch dependencies
RUN ./gradlew dependencies --no-daemon || true

# Copy source code and build bootable jar
COPY src src
RUN ./gradlew bootJar -x test --no-daemon

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Add non-root application user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built artifact from builder stage
COPY --from=builder /workspace/app/build/libs/*.jar app.jar

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Expose Spring Boot HTTP port
EXPOSE 8080

# Environment Defaults (can be overridden by docker-compose)
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/aichatdb
ENV SPRING_DATASOURCE_USERNAME=postgres
ENV SPRING_DATASOURCE_PASSWORD=1234
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434
ENV OLLAMA_API_URL=http://host.docker.internal:11434/api/chat
ENV OLLAMA_EMBEDDING_URL=http://host.docker.internal:11434/api/embeddings

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
