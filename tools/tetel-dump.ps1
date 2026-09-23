# Egy tétel mezőjének nyers HTML-je, blokkelemek után sortöréssel (a javítások pontos szövegéhez)
param([string]$Id, [string]$Field, [string]$Out = $env:TEMP)
$ErrorActionPreference = 'Stop'
$src = Join-Path (Split-Path -Parent $PSScriptRoot) ('docs\QtEMzHsA3gHsg8AHwR6rGC\data-' + $Id.Substring(0,1).ToLower() + '.js')
$raw = [IO.File]::ReadAllText($src, [Text.Encoding]::UTF8)
$arr = $raw.Substring($raw.IndexOf('=') + 1).Trim().TrimEnd(';') | ConvertFrom-Json
$r = $arr | Where-Object { $_.id -eq $Id }
$h = [string]$r.$Field
$h = [regex]::Replace($h, 'src="data:[^"]{40,}"', 'src="DATA"')
$h = [regex]::Replace($h, '(</(p|h\d|li|tr|table|ul|ol|div|figure|figcaption)>)', "`$1`n")
$out = Join-Path $Out "html-$Id-$Field.txt"
[IO.File]::WriteAllText($out, $h, (New-Object System.Text.UTF8Encoding $false))
"$out ($($h.Length) karakter)"
