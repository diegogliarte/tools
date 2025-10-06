@echo off
set inputDir=%~dp0..\public\portraits
set baseOutput=%~dp0..\public\digimon-portraits-webp

:: Make subfolders for each variant
for %%D in (q75_256) do (
    if not exist "%baseOutput%\%%D" mkdir "%baseOutput%\%%D"
)

echo.
echo ======================================
echo Generating ALL variants for comparison
echo   4. q75_256 (scaled to 256px)
echo ======================================
echo.

for %%F in ("%inputDir%\*.png") do (
    echo Processing %%~nxF...
	
    :: 4. Quality 75 scaled to 256px wide
    ffmpeg -y -i "%%F" -vf "scale=256:-1" -c:v libwebp -q:v 75 "%baseOutput%\q75_256\%%~nF.webp"
)

echo.
echo ✅ Done! Variants saved into:
echo   %baseOutput%\q75_256
pause
