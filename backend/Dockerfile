# ══════════════════════════════════════════════════════════════
# Backend — Dockerfile optimisé pour Railway
# ──────────────────────────────────────────────────────────────
# Optimisations :
#  1. Alpine  → image runtime ~95 MB (vs ~250 MB Debian)
#  2. Layer cache → deps cachées si pom.xml inchangé
#  3. Sans -Xint  → JIT activé, build 3x plus rapide
#  4. JVM container-aware → lit les limites RAM cgroup Railway
#  5. Sans curl/apt → pas d'installation inutile au runtime
#  6. exec java  → PID 1 = shutdown propre sur Railway
# ══════════════════════════════════════════════════════════════
# ─── Stage 1 : Build ──────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# ── Couche dépendances (cachée par Railway si pom.xml inchangé) ──
# Seul pom.xml est copié ici : si le code change mais pas les deps,
# Railway réutilise cette couche et ne re-télécharge rien.
COPY backend/pom.xml .
RUN mvn dependency:go-offline --no-transfer-progress -q

# ── Couche build (reconstruite uniquement si le source change) ──
COPY backend/src ./src
RUN mvn clean package -DskipTests --no-transfer-progress -q

# ─── Stage 2 : Runtime ────────────────────────────────────────
FROM eclipse-temurin:21-jre-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    ca-certificates \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libgtk-3-0 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# JVM optimisé pour les conteneurs Railway :
#  UseContainerSupport  → lit les limites mémoire cgroup de Railway
#  MaxRAMPercentage=75  → utilise 75% de la RAM allouée (évite OOM)
#  urandom              → entropie rapide → démarrage Spring Boot plus court
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -Djava.security.egd=file:/dev/./urandom"

ENV CHROMIUM_PATH=/usr/bin/chromium

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]