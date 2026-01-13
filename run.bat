@echo off
echo Starting Sudanese Restaurant Dashboard...

echo Starting server...
start "Server" cmd /k "npm run server"

timeout /t 3

echo Starting client...
start "Client" cmd /k "npm run client"

echo Both server and client are starting...
echo Server: http://localhost:5000
echo Client: http://localhost:3000
pause