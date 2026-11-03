# Build the Spring Boot application and package the existing Capricorn web UI.
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
COPY index.html script.js style.css ./
COPY assets ./assets
RUN mvn -B clean package -DskipTests

# Run the executable Spring Boot JAR with a small Java 17 runtime.
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/capricorn-calculator-1.0.0.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
