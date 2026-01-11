# Stage 1: Build the application
FROM azul/zulu-openjdk-alpine:25.0.1 AS builder

RUN apk add --no-cache git nodejs npm

WORKDIR /app

# Copy gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY gradle.properties .

# Copy source code
COPY api api
COPY contract contract
COPY contract-typespec contract-typespec
COPY serde-api serde-api
COPY frontend frontend
COPY etc etc

# Make gradlew executable and build
RUN chmod +x gradlew
RUN ./gradlew :api:bootJar -Pinclude-frontend=true --no-daemon -x generateGitProperties

# Stage 2: Runtime image
FROM azul/zulu-openjdk-alpine:25.0.1-jre-headless

RUN apk add --no-cache gcompat tzdata
RUN addgroup -S kafkaui && adduser -S kafkaui -G kafkaui
RUN mkdir /etc/kafkaui/ && chown kafkaui /etc/kafkaui

USER kafkaui

COPY --from=builder /app/api/build/libs/*.jar /api.jar

ENV JAVA_OPTS=
EXPOSE 8080

CMD java --add-opens java.rmi/javax.rmi.ssl=ALL-UNNAMED $JAVA_OPTS -jar api.jar
