@echo off
echo ===================================================
echo AI FYP Generator - One-Click Start Script
echo ===================================================

echo.
echo [1/4] Installing Backend Dependencies...
cd backend
call npm install

echo.
echo [2/4] Running Database Migrations...
echo (If this fails, make sure MySQL is running and your .env is correct)
node migrations/001_add_project_type_columns.js
node migrations/002_create_student_projects.js
node migrations/003_update_student_projects.js

echo.
echo [3/4] Starting Backend in a new window...
start "FYP Backend" cmd /k "npm run dev"

cd ..
echo.
echo [4/4] Installing Frontend Dependencies...
call npm install --legacy-peer-deps

echo.
echo [4/4] Starting Frontend in a new window...
start "FYP Frontend" cmd /k "npm start"

echo.
echo Setup complete! The backend and frontend are opening in new windows.
pause