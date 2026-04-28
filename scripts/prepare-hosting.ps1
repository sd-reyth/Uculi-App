$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$sourceIndex = Join-Path $repoRoot 'index.html'
$publicDir = Join-Path $repoRoot 'public'
$publicStaticDir = Join-Path $repoRoot 'public-static'

if (-not (Test-Path -LiteralPath $sourceIndex -PathType Leaf)) {
    throw "Cannot find app entry file at $sourceIndex"
}

if (-not (Test-Path -LiteralPath $publicDir -PathType Container)) {
    New-Item -ItemType Directory -Path $publicDir | Out-Null
}

Get-ChildItem -LiteralPath $publicDir -Force |
    Where-Object { $_.Name -ne '.gitkeep' } |
    Remove-Item -Recurse -Force

Copy-Item -LiteralPath $sourceIndex -Destination (Join-Path $publicDir 'index.html') -Force

if (Test-Path -LiteralPath $publicStaticDir -PathType Container) {
    Get-ChildItem -LiteralPath $publicStaticDir -Force |
        ForEach-Object {
            Copy-Item -LiteralPath $_.FullName -Destination $publicDir -Recurse -Force
        }
}

$stagedFiles = Get-ChildItem -LiteralPath $publicDir -Recurse -File |
    ForEach-Object {
        $_.FullName.Substring($repoRoot.Length + 1).Replace('\', '/')
    }

Write-Host 'Staged hosting files:'
$stagedFiles | ForEach-Object { Write-Host " - $_" }