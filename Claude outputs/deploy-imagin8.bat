@echo off
cd /d "E:\irhaharshad-portfolio"
(
  echo === Imagin8 V Park update run at %DATE% %TIME% ===
  echo.
  echo Extracting update...
  powershell -NoProfile -Command "Expand-Archive -Path 'imagin8-v-park-update.zip' -DestinationPath '.' -Force"
  echo.
  echo Cleaning up transfer files...
  del /q imagin8-v-park-update.zip deploy-imagin8.bat 2>nul
  echo.
  echo Setting git identity...
  git config user.name "Irhah Arshad Siddiqui"
  git config user.email "irhah.1998@gmail.com"
  echo.
  echo Staging and committing...
  git add -A
  git commit -m "Update Imagin8 V Park case study with real assets and prototype link"
  echo.
  echo Pushing to GitHub...
  git push -u origin main
  echo.
  echo EXIT CODE OF PUSH: %ERRORLEVEL%
) > imagin8-push-log.txt 2>&1
echo Done - log written to imagin8-push-log.txt
pause
