# Capricorn Calculator

Capricorn is a Spring Boot web application that serves the existing calculator interface and evaluates standard arithmetic expressions through a Java REST API. It is packaged as a Docker image for Render.

## Run locally

Requirements: Java 17 and Maven 3.9+.

```sh
mvn spring-boot:run
```

Open `http://localhost:8080`. The server uses Render's `PORT` environment variable when present and otherwise listens on port 8080.

## API

- `POST /api/calculate` with JSON such as `{"expression":"(12 + 3) * 2"}` returns `{"result":30.0}`.
- `GET /calculate?num1=12&num2=3&operator=add` returns `{"result":15.0}`. Supported operators: `add`, `subtract`, `multiply`, and `divide` (symbol aliases are accepted too).

Invalid expressions return an HTTP 400 response with a JSON `error` message.

## Deploy to Render

1. Push this repository to GitHub.
2. In Render, create a **Web Service** and connect the repository.
3. Set the branch to `main`, runtime to **Docker**, and choose the desired instance size.
4. Deploy. The Docker build compiles the Java 17 Spring Boot application and packages the website files and character assets into the JAR.

Render assigns the service's `PORT` environment variable; the application is configured to use it automatically. No separate static-site service or manual Java installation is required.
