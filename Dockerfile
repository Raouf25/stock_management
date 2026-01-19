# Stage 1 : Build
FROM maven:3.9-eclipse-temurin-21 as builder

WORKDIR /app

# Copier les fichiers de configuration Maven
COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn

# Télécharger les dépendances
RUN ./mvnw dependency:resolve

# Copier le code source
COPY src ./src

# Compiler l'application
RUN ./mvnw clean package -DskipTests

# Stage 2 : Runtime
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copier le JAR depuis le stage de build
COPY --from=builder /app/target/*.jar app.jar

# Exposer le port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/products || exit 1

# Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
