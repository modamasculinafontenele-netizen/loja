$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js nao foi encontrado." -ForegroundColor Red
    Write-Host "Instale o Node.js 22 ou mais recente em https://nodejs.org/ e tente novamente."
    exit 1
}

$majorVersion = [int]((node --version).TrimStart('v').Split('.')[0])
if ($majorVersion -lt 22) {
    Write-Host "A versao instalada do Node.js e muito antiga." -ForegroundColor Red
    Write-Host "Instale o Node.js 22 ou mais recente em https://nodejs.org/."
    exit 1
}

if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot "node_modules"))) {
    Write-Host "Primeira execucao: instalando os componentes do sistema..." -ForegroundColor Cyan
    & npm.cmd install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "" 
Write-Host "Sistema Fontenele iniciado." -ForegroundColor Green
Write-Host "Catalogo:      http://127.0.0.1:5173/"
Write-Host "Administracao: http://127.0.0.1:5173/admin"
Write-Host "Para encerrar, pressione Ctrl+C nesta janela."
Write-Host ""

& npm.cmd run dev
exit $LASTEXITCODE
