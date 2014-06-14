@echo off

:LOOP
START "TCS-API" /B /WAIT node bin\start-api.js
IF NOT %ERRORLEVEL% == 3 (
	exit /b
)
GOTO:LOOP