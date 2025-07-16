# ----------- Stage 1: Build the JAR ------------
FROM gradle:8.4-jdk17 AS build
WORKDIR /app

# Copy all source files
COPY . .

# Make wrapper executable and build
RUN chmod +x ./gradlew && ./gradlew build -x test

# ----------- Stage 2: Run the JAR -------------
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy JAR from the build stage
COPY --from=build /app/build/libs/research-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
