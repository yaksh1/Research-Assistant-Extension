# Use JRE only (for smaller image)
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy only the prebuilt JAR file
COPY build/libs/*.jar app.jar

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
