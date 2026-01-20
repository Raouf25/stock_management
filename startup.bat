@echo off
REM Stock Management - Script de Démarrage (Windows)
REM Usage: startup.bat

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Stock Management System - Startup
echo ========================================
echo.

REM 1. Vérifier Docker
echo [1/3] Vérification de Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker n'est pas installé
    exit /b 1
)
echo [OK] Docker trouvé

REM 2. Démarrer PostgreSQL
echo.
echo [2/3] Démarrage de PostgreSQL...
docker-compose -f docker-compose.dev.yml up -d
timeout /t 3 /nobreak
echo [OK] PostgreSQL en cours d'exécution

REM 3. Compiler Backend
echo.
echo [3/3] Compilation du Backend...
cd backend
call mvn clean install -q
if errorlevel 1 (
    echo [ERROR] Compilation échouée
    exit /b 1
)
echo [OK] Backend compilé
cd..

REM 4. Instructions finales
echo.
echo ========================================
echo Configuration Initiale Complète!
echo ========================================
echo.
echo Prochaines Étapes:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   mvn spring-boot:run
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm install
echo   npm start
echo.
echo URLs d'Accès:
echo   Dashboard:    http://localhost:4200
echo   API Swagger:  http://localhost:8080/swagger-ui.html
echo   PostgreSQL:   localhost:5432
echo.
echo Arrêter PostgreSQL:
echo   docker-compose -f docker-compose.dev.yml down
echo.
pause
