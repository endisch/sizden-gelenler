param(
  [string]$DataDirectory = (Join-Path $PSScriptRoot '..\data'),
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\backups')
)

$ErrorActionPreference = 'Stop'
$dataPath = (Resolve-Path -LiteralPath $DataDirectory).Path
$backupPath = [System.IO.Path]::GetFullPath($OutputDirectory)
$dataPrefix = $dataPath.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
if ($backupPath.Equals($dataPath, [System.StringComparison]::OrdinalIgnoreCase) -or
    $backupPath.StartsWith($dataPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'Backup folder must be outside DATA_DIR.'
}

$tar = Get-Command tar -ErrorAction Stop
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$archive = Join-Path $backupPath "mais-data-$stamp.tar.gz"
& $tar.Source -czf $archive -C $dataPath .
if ($LASTEXITCODE -ne 0) { throw "tar failed with exit code $LASTEXITCODE" }
$hash = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath "$archive.sha256" -Value "$hash  $(Split-Path -Leaf $archive)" -Encoding ascii
Get-Item -LiteralPath $archive | Select-Object FullName, Length
