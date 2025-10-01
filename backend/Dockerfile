# Use official OpenJDK 17 image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY backend/ .

# Make gradlew executable
RUN chmod +x gradlew

# Download dependencies
RUN ./gradlew dependencies --no-daemon

# Build the application (JAR 파일이 app.jar로 생성됨)
RUN ./gradlew build -x test --no-daemon

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-Dspring.profiles.active=prod", "-Dserver.port=${PORT:-8080}", "-jar", "build/libs/app.jar"]
