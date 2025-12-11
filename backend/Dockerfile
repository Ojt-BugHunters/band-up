# syntax=docker/dockerfile:1

################################################################################
# STAGE 1: Download dependencies
FROM eclipse-temurin:21-jdk-jammy as deps

WORKDIR /build

COPY --chmod=0755 mvnw mvnw
COPY .mvn/ .mvn/

RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    --mount=type=cache,target=/root/.m2 \
    ./mvnw dependency:go-offline -DskipTests

################################################################################
# STAGE 2: Build package
FROM deps as package

WORKDIR /build

COPY ./src src/
RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    --mount=type=cache,target=/root/.m2 \
    ./mvnw package -DskipTests && \
    mv target/$(./mvnw help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-$(./mvnw help:evaluate -Dexpression=project.version -q -DforceStdout).jar target/app.jar

################################################################################
# STAGE 3: Extract layers
FROM package as extract

WORKDIR /build
RUN java -Djarmode=layertools -jar target/app.jar extract --destination target/extracted

################################################################################
# STAGE 4: Runtime image
FROM eclipse-temurin:21-jre-jammy AS final

ARG UID=10001

# Create app user
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Install AWS CLI (needed to download key from S3)
RUN apt-get update && apt-get install -y awscli && apt-get clean

# Create app directory
WORKDIR /app

# Copy Spring Boot extracted layers
COPY --from=extract /build/target/extracted/dependencies/ ./
COPY --from=extract /build/target/extracted/spring-boot-loader/ ./
COPY --from=extract /build/target/extracted/snapshot-dependencies/ ./
COPY --from=extract /build/target/extracted/application/ ./

# Copy entrypoint for S3 PEM download
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8080

# IMPORTANT: Use entrypoint script → downloads key → runs Java
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["java", "org.springframework.boot.loader.launch.JarLauncher"]
