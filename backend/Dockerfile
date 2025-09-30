# Use official OpenJDK 17 image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy all files first
COPY . .

# Make gradlew executable
RUN chmod +x gradlew

# Change to backend directory
WORKDIR /app/backend

# Make gradlew executable in backend directory
RUN chmod +x gradlew

# Download dependencies
RUN ./gradlew dependencies --no-daemon

# Build the application
RUN ./gradlew build -x test --no-daemon

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Run the application
CMD ["./gradlew", "bootRun", "-Dspring.profiles.active=prod"]
