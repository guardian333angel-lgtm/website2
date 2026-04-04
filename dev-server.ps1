param(
  [int]$Port = 5500
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Get-ContentType {
  param([string]$Path)

  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    '.html' { 'text/html; charset=utf-8' }
    '.css'  { 'text/css; charset=utf-8' }
    '.js'   { 'application/javascript; charset=utf-8' }
    '.json' { 'application/json; charset=utf-8' }
    '.svg'  { 'image/svg+xml' }
    '.png'  { 'image/png' }
    '.jpg'  { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.gif'  { 'image/gif' }
    '.webp' { 'image/webp' }
    '.ico'  { 'image/x-icon' }
    '.pdf'  { 'application/pdf' }
    '.txt'  { 'text/plain; charset=utf-8' }
    default { 'application/octet-stream' }
  }
}

function Get-VersionStamp {
  $latest = Get-ChildItem -Path $root -Recurse -File |
    Where-Object {
      $_.FullName -notmatch '\\.git\\' -and
      $_.Name -ne 'dev-server.ps1' -and
      $_.Extension.ToLowerInvariant() -in '.html', '.css', '.js', '.pdf'
    } |
    Sort-Object LastWriteTimeUtc -Descending |
    Select-Object -First 1

  if ($null -eq $latest) {
    return '0'
  }

  return $latest.LastWriteTimeUtc.Ticks.ToString()
}

function Get-SafePath {
  param([string]$RequestPath)

  $relativePath = [Uri]::UnescapeDataString(($RequestPath -replace '^/', ''))
  if ([string]::IsNullOrWhiteSpace($relativePath)) {
    $relativePath = 'index.html'
  }

  $combinedPath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))
  if (-not $combinedPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Blocked path traversal attempt.'
  }

  if ((Test-Path $combinedPath) -and (Get-Item $combinedPath).PSIsContainer) {
    $combinedPath = Join-Path $combinedPath 'index.html'
  }

  return $combinedPath
}

$reloadScript = @"
<script>
(() => {
  let version = null;
  const check = async () => {
    try {
      const response = await fetch('/__dev__/version', { cache: 'no-store' });
      if (!response.ok) {
        return;
      }
      const payload = await response.json();
      if (version && payload.version !== version) {
        window.location.reload();
        return;
      }
      version = payload.version;
    } catch (error) {
    }
  };

  check();
  window.setInterval(check, 1000);
})();
</script>
"@

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "Live preview running at http://localhost:$Port/"
Write-Host 'Save HTML, CSS, or JS files to trigger a browser refresh.'

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    try {
      if ($request.Url.AbsolutePath -eq '/__dev__/version') {
        $payload = "{`"version`":`"$(Get-VersionStamp)`"}"
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $response.ContentType = 'application/json; charset=utf-8'
        $response.Headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        $response.StatusCode = 200
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        continue
      }

      $filePath = Get-SafePath -RequestPath $request.Url.AbsolutePath
      if (-not (Test-Path $filePath) -or (Get-Item $filePath).PSIsContainer) {
        $response.StatusCode = 404
        $notFound = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
        $response.ContentType = 'text/plain; charset=utf-8'
        $response.OutputStream.Write($notFound, 0, $notFound.Length)
        $response.Close()
        continue
      }

      $response.ContentType = Get-ContentType -Path $filePath
      $response.Headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'

      if ([System.IO.Path]::GetExtension($filePath).ToLowerInvariant() -eq '.html') {
        $html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        if ($html -match '</body>') {
          $html = $html -replace '</body>', "$reloadScript</body>"
        } else {
          $html += $reloadScript
        }

        $bytes = [System.Text.Encoding]::UTF8.GetBytes($html)
        $response.StatusCode = 200
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        continue
      }

      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $response.StatusCode = 200
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
    } catch {
      $message = [System.Text.Encoding]::UTF8.GetBytes("500 Server Error`n$($_.Exception.Message)")
      $response.StatusCode = 500
      $response.ContentType = 'text/plain; charset=utf-8'
      $response.OutputStream.Write($message, 0, $message.Length)
      $response.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}