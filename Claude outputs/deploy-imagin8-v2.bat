@echo off
cd /d "E:\irhaharshad-portfolio"
(
  echo === Imagin8 V Park v2 update run at %DATE% %TIME% ===
  echo.
  echo Extracting update...
  powershell -NoProfile -Command "Expand-Archive -Path 'imagin8-v-park-update-v2.zip' -DestinationPath '.' -Force"
  echo.
  echo Removing assets orphaned by this rework...
  del /q "assets\imagin8-v-park\event-storyboard-review.jpg" 2>nul
  del /q "assets\imagin8-v-park\logo-navy.jpg" 2>nul
  del /q "assets\imagin8-v-park\poster-gaming-for-transformation.jpg" 2>nul
  del /q "assets\imagin8-v-park\poster-process-precedents.jpg" 2>nul
  del /q "assets\imagin8-v-park\sketch-map-before.jpg" 2>nul
  del /q "assets\imagin8-v-park\sketch-map-after.jpg" 2>nul
  del /q "assets\imagin8-v-park\sketch-task-1.jpg" 2>nul
  del /q "assets\imagin8-v-park\sketch-task-2.jpg" 2>nul
  del /q "assets\imagin8-v-park\sketch-task-3.jpg" 2>nul
  del /q "assets\imagin8-v-park\sketch-task-intro.jpg" 2>nul
  del /q "assets\imagin8-v-park\terry-standing.png" 2>nul
  echo.
  echo Cleaning up transfer files...
  del /q imagin8-v-park-update-v2.zip deploy-imagin8-v2.bat 2>nul
  echo.
  echo Setting git identity...
  git config user.name "Irhah Arshad Siddiqui"
  git config user.email "irhah.1998@gmail.com"
  echo.
  echo Staging and committing...
  git add -A
  git commit -m "Rework Imagin8 V Park case study: Figma prototype embed, full branding section, expanded cast, stakeholder callouts, final reflection"
  echo.
  echo Pushing to GitHub...
  git push -u origin main
  echo.
  echo EXIT CODE OF PUSH: %ERRORLEVEL%
) > imagin8-push-log-v2.txt 2>&1
echo Done - log written to imagin8-push-log-v2.txt
pause
