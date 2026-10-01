@echo off
echo ===================================================
echo Starting AI Chat Application (Backend + Frontend)
echo ===================================================

echo [1/2] Launching Spring Boot Backend (port 8080)...
start "AI Chat - Spring Boot Backend" cmd /k "cd /d \"%~dp0backend\" && gradlew.bat bootRun"

echo [2/2] Launching React Frontend (port 5173)...
start "AI Chat - React Frontend" cmd /k "cd /d \"%~dp0frontend\" && npm run dev"

echo.
echo Both servers are starting up!
echo Once loaded, open your browser at: http://localhost:5173
echo ===================================================
pause
