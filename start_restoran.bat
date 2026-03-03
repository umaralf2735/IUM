@echo off
echo ===================================================
echo   Memulai Server Restoran Kita...
echo ===================================================

echo.
echo [1] Menjalankan Backend API (Port 5000)...
start cmd /k "cd /d ""%~dp0backend"" && .\venv\Scripts\activate && python run.py"

echo [2] Menjalankan Frontend Web (Port 8191)...
start cmd /k "cd /d ""%~dp0frontend"" && python -m http.server 8191"

echo.
echo Semua server berhasil dijalankan!
echo - Buka Halaman Pembeli: http://127.0.0.1:8191
echo - Buka Halaman Admin:   http://127.0.0.1:8191/admin/login.html
echo.
pause
