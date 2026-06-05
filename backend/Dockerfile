# ══════════════════════════════════════════════════════════════
# Backend — Dockerfile optimisé pour Railway + Playwright
# Base : Debian Bookworm slim — vrai Chromium apt, pas de snap
# ══════════════════════════════════════════════════════════════

# ─── Stage 1 : Build ──────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY backend/pom.xml .
RUN mvn dependency:go-offline --no-transfer-progress -q

COPY backend/src ./src
RUN mvn clean package -DskipTests --no-transfer-progress -q

# ─── Stage 2 : Runtime ────────────────────────────────────────
# On utilise directement debian:bookworm-slim + JRE téléchargé manuellement
# car eclipse-temurin n'a pas de tag bookworm-slim avec JRE
FROM debian:bookworm-slim

# Java 21 JRE via le dépôt Adoptium
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    && curl -fsSL https://packages.adoptium.net/artifactory/api/gpg/key/public \
       | gpg --dearmor -o /usr/share/keyrings/adoptium.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb bookworm main" \
       > /etc/apt/sources.list.d/adoptium.list \
    && apt-get update && apt-get install -y --no-install-recommends \
    temurin-21-jre \
    && rm -rf /var/lib/apt/lists/*

# Chromium depuis les dépôts Debian officiels (vrai binaire, pas un snap)
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    fonts-noto \
    && rm -rf /var/lib/apt/lists/*

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
    JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -Djava.security.egd=file:/dev/./urandom"

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]