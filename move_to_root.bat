@echo off
echo ========================================
echo   Moving medi-safe to GitHub Root
echo ========================================
echo.

set "source=E:\Randomize-Hackathon\medi-safe"
set "dest=E:\Randomize-Hackathon"

echo Moving files from %source% to %dest%...
echo.

xcopy /s /e "%source%\*" "%dest%\" /y

if %errorlevel% equ 0 (
    echo.
    echo Files copied successfully!
    echo.
    echo Removing empty medi-safe folder...
    rmdir /s /q "%source%"
    
    if %errorlevel% equ 0 (
        echo.
        echo Done! medi-safe folder has been removed.
    ) else (
        echo.
        echo Warning: Could not remove medi-safe folder. Please delete it manually.
    )
) else (
    echo.
    echo Error: Failed to copy files!
)

echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo 1. Open terminal in E:\Randomize-Hackathon
echo 2. Run: git status
echo 3. Run: git add .
echo 4. Run: git commit -m "Move project to root"
echo 5. Run: git push
echo ========================================
pause
