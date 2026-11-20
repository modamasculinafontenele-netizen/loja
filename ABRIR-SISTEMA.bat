@echo off
title Fontenele - Sistema de Vendas
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0ABRIR-SISTEMA.ps1"
if errorlevel 1 pause
