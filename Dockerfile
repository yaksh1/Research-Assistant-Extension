# -------- Stage 1: Build the JAR using Java 21 and gradle wrapper --------
FROM eclipse-temurin:21-jdk as build
WORKDIR /app

# Copy Gradle wrapper and build files first (for layer caching)
COPY gradlew .
COPY gradle/ gradle/
COPY settings.gradle* .
COPY build.gradle* .
COPY gradle.properties* .

# Preload dependencies
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# Copy source code and build the project
COPY . .
RUN ./gradlew build -x test --no-daemon

# -------- Stage 2: Run the JAR using Java 21 JRE --------
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
