@echo off
set inputDir=%~dp0
set outputDir=%~dp0webp_64_q75

:: Make output folder
if not exist "%outputDir%" mkdir "%outputDir%"

echo.
echo ======================================
echo Converting all PNGs in current folder:
echo   - Quality: 75%
echo   - Width:   64px (scaled, aspect kept)
echo ======================================
echo.

for %%F in ("%inputDir%\*.png") do (
    echo Processing %%~nxF...
    ffmpeg -y -i "%%F" -vf "scale=64:-1" -c:v libwebp -q:v 75 "%outputDir%\%%~nF.webp"
)

echo.
echo ✅ Done! Files saved into:
echo   %outputDir%
pause
