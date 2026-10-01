param(
  [Parameter(Mandatory = $true)][string]$Archive,
  [Parameter(Mandatory = $true)][string]$DataDirectory
)

$ErrorActionPreference = 'Stop'
$archivePath = (Resolve-Path -LiteralPath $Archive).Path
$targetPath = [System.IO.Path]::GetFullPath($DataDirectory)
$checksumPath = "$archivePath.sha256"
if (Test-Path -LiteralPath $checksumPath) {
  $expectedHash = (Get-Content -LiteralPath $checksumPath -Raw).Trim() -split '\s+' | Select-Object -First 1
  $actualHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
  if ($expectedHash -ne $actualHash) { throw 'Backup SHA-256 checksum does not match.' }
}
if (Test-Path -LiteralPath $targetPath) {
  $existing = Get-ChildItem -LiteralPath $targetPath -Force
  if ($existing.Count -gt 0) { throw 'Restore target must be an empty folder.' }
} else {
  New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
}

$tar = Get-Command tar -ErrorAction Stop
$entries = & $tar.Source -tzf $archivePath
if ($LASTEXITCODE -ne 0) { throw 'Unable to read backup archive.' }
foreach ($entry in $entries) {
  if ($entry -match '(^/|^[A-Za-z]:|(^|[\\/])\.\.([\\/]|$))') {
    throw 'Archive contains an unsafe path; restore cancelled.'
  }
}
$verboseEntries = & $tar.Source -tvzf $archivePath
if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect backup archive entries.' }
if ($verboseEntries | Where-Object { $_ -match '^[lh]' }) {
  throw 'Archive contains symbolic or hard links; restore cancelled.'
}

$tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
$staging = [System.IO.Path]::GetFullPath((Join-Path $tempRoot ('mais-restore-' + [guid]::NewGuid().ToString('N'))))
if (!$staging.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'Temporary restore folder resolved outside the system temp folder.'
}
if ($targetPath.StartsWith($staging + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'Restore target must be outside the temporary staging folder.'
}
New-Item -ItemType Directory -Path $staging | Out-Null
try {
  & $tar.Source -xzf $archivePath -C $staging
  if ($LASTEXITCODE -ne 0) { throw 'Archive extraction failed.' }
  Get-ChildItem -LiteralPath $staging -Force | Copy-Item -Destination $targetPath -Recurse -Force
  Write-Output "Restore completed to $targetPath. Restart the application and verify login and submissions."
} finally {
  Remove-Item -LiteralPath $staging -Recurse -Force
}
