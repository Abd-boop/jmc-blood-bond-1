@echo off
echo ========================================================
echo Adding Windows Firewall Rule for JMC Blood Bond (Port 3000 & 8000)
echo ========================================================
echo A User Account Control (UAC) prompt will appear.
echo Please click "YES" to allow incoming Wi-Fi connections.
echo ========================================================

powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/k netsh advfirewall firewall add rule name=\"JMC Blood Bond 3000\" dir=in action=allow protocol=TCP localport=3000 profile=any & netsh advfirewall firewall add rule name=\"Local Web Server 8000\" dir=in action=allow protocol=TCP localport=8000 profile=any & echo. & echo ====================================================== & echo  [SUCCESS] Firewall rule added! Ports 3000 and 8000 are open. & echo  Now open http://192.168.0.108:3000 on your phone. & echo ====================================================== & pause'"

