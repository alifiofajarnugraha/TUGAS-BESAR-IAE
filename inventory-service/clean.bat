@echo off
echo Cleaning up unnecessary files...

:: Remove node_modules
echo Removing node_modules...
rmdir /s /q node_modules
rmdir /s /q frontend\node_modules

:: Remove build files
echo Removing build files...
rmdir /s /q frontend\build

:: Remove cache files
echo Removing cache files...
del /s /q *.log
del /s /q .cache\*.*
del /s /q .next\*.*

:: Remove Docker volumes
echo Removing Docker volumes...
docker volume prune -f

echo Cleanup complete!
echo Please run 'npm install' and 'cd frontend && npm install' to reinstall dependencies. 