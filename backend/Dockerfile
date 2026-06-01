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
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

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
# eclipse-temurin:21-jre-alpine ≈ 95 MB vs 250 MB (Debian JRE)
# Moins de bande passante à transférer sur Railway à chaque deploy
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# JVM optimisé pour les conteneurs Railway :
#  UseContainerSupport  → lit les limites mémoire cgroup de Railway
#  MaxRAMPercentage=75  → utilise 75% de la RAM allouée (évite OOM)
#  urandom              → entropie rapide → démarrage Spring Boot plus court
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -Djava.security.egd=file:/dev/./urandom"

# exec → Java devient PID 1 → reçoit SIGTERM → arrêt propre (graceful shutdown)
# Le healthcheck est géré par railway.toml, inutile de le dupliquer ici
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
