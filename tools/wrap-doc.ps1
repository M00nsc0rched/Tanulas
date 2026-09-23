# Claude Docs HTML-exportot (csak <body> tartalom) önálló, mobilbarát olvasólappá alakít.
# Használat: powershell -File tools\wrap-doc.ps1 -Fragment export.html -Id <artifact id>
# Eredmény: docs\<artifact id>\index.html
param(
  [Parameter(Mandatory = $true)][string]$Fragment,
  [Parameter(Mandatory = $true)][string]$Id
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false

$body = [IO.File]::ReadAllText($Fragment, [Text.Encoding]::UTF8)
# A szerző-említés (@u_...) csak a claude.ai-on értelmes
$body = [regex]::Replace($body, ('\s*' + [char]0xB7 + '\s*<span data-atom="mention"[^>]*>[^<]*</span>'), '')

$m = [regex]::Match($body, '<h1[^>]*>(.*?)</h1>')
$title = if ($m.Success) { [regex]::Replace($m.Groups[1].Value, '<[^>]+>', '') } else { $Id }

$tpl = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'doc-template.html'), [Text.Encoding]::UTF8)
$html = $tpl.Replace('{{TITLE}}', $title).Replace('{{ID}}', $Id).Replace('{{BODY}}', $body)

$dir = Join-Path $root "docs\$Id"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
[IO.File]::WriteAllText((Join-Path $dir 'index.html'), $html, $utf8)
Write-Host "OK: docs\$Id\index.html ($($html.Length) chars)"
