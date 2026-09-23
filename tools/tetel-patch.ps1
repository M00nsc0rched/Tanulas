# A Gépész záróvizsga tételtár (docs/QtEMzHsA3gHsg8AHwR6rGC) adatfájljainak pontos, ellenőrzött javítása.
# Használat: powershell -File tools\tetel-patch.ps1 -Patch javitas.txt [-Target docs\...\data-a.js] [-DryRun]
# Javítások alkalmazása a tételtár data-b.js fájljára, pontos (és egyértelmű) szövegcserékkel.
# Patch-formátum (UTF-8):
#   @@ <tétel id> <mező>          pl. @@ B1 body
#   <<<
#   keresett HTML (a sortörések törlődnek, a sorok egybefűzve)
#   ===
#   új HTML (ugyanígy)
#   >>>
# Minden keresett szövegnek pontosan egyszer kell előfordulnia az adott tétel adott mezőjében — különben semmi sem íródik ki.
param([string]$Patch, [string]$Target = (Join-Path (Split-Path -Parent $PSScriptRoot) 'docs\QtEMzHsA3gHsg8AHwR6rGC\data-b.js'), [switch]$DryRun)
$ErrorActionPreference = 'Stop'
$raw = [IO.File]::ReadAllText($Target, [Text.Encoding]::UTF8)
$lines = [IO.File]::ReadAllLines($Patch, [Text.Encoding]::UTF8)

function JsonEsc([string]$s) { return $s.Replace('\', '\\').Replace('"', '\"') }

# Egy mező értékének [kezdet, vég) tartománya a nyers szövegben
function FieldRange([string]$text, [string]$id, [string]$field) {
  $start = $text.IndexOf('{"id":"' + $id + '"')
  if ($start -lt 0) { throw "Nincs ilyen tétel: $id" }
  $key = '"' + $field + '":"'
  $k = $text.IndexOf($key, $start)
  $next = $text.IndexOf('{"id":"', $start + 5)
  if ($k -lt 0 -or ($next -ge 0 -and $k -gt $next)) { throw "Nincs ilyen mező: $id.$field" }
  $i = $k + $key.Length
  while ($i -lt $text.Length) {
    $ch = $text[$i]
    if ($ch -eq '\') { $i += 2; continue }
    if ($ch -eq '"') { break }
    $i++
  }
  return @(($k + $key.Length), $i)
}

# Tartomány-művelet: <<<RANGE / kezdő szöveg / --- / záró szöveg / === / csere / >>>
# A kezdő szövegtől a záró szöveg elejéig tartó részt cseréli (a záró szöveg megmarad). Mindkettő egyértelmű kell legyen.
$ops = @(); $cur = $null; $mode = ''
foreach ($ln in $lines) {
  if ($ln -match '^@@\s+(\S+)\s+(\S+)') { $cur = @{ id = $Matches[1]; field = $Matches[2] }; continue }
  if ($ln -eq '<<<') { $mode = 'find'; $kind = 'plain'; $f = New-Object System.Text.StringBuilder; continue }
  if ($ln -eq '<<<RANGE') { $mode = 'find'; $kind = 'range'; $f = New-Object System.Text.StringBuilder; $e = New-Object System.Text.StringBuilder; continue }
  if ($ln -eq '---' -and $kind -eq 'range' -and $mode -eq 'find') { $mode = 'end'; continue }
  if ($ln -eq '===') { $mode = 'repl'; $r = New-Object System.Text.StringBuilder; continue }
  if ($ln -eq '>>>') {
    $ops += @{ id = $cur.id; field = $cur.field; kind = $kind; find = $f.ToString(); end = $(if ($kind -eq 'range') { $e.ToString() } else { '' }); repl = $r.ToString() }
    $mode = ''; continue
  }
  if ($mode -eq 'find') { [void]$f.Append($ln.Trim()) }
  elseif ($mode -eq 'end') { [void]$e.Append($ln.Trim()) }
  elseif ($mode -eq 'repl') { [void]$r.Append($ln.Trim()) }
}

function CountOf([string]$hay, [string]$needle) { ([regex]::Matches($hay, [regex]::Escape($needle))).Count }

$n = 0
foreach ($op in $ops) {
  $n++
  $rng = FieldRange $raw $op.id $op.field
  $val = $raw.Substring($rng[0], $rng[1] - $rng[0])
  $fe = JsonEsc $op.find; $re = JsonEsc $op.repl
  $cnt = CountOf $val $fe
  if ($cnt -ne 1) { throw "[$n] $($op.id).$($op.field): a keresett szöveg $cnt-szor fordul elő (1 kellene): $($op.find.Substring(0, [Math]::Min(90, $op.find.Length)))" }
  if ($op.kind -eq 'range') {
    $ee = JsonEsc $op.end
    $ecnt = CountOf $val $ee
    if ($ecnt -ne 1) { throw "[$n] $($op.id).$($op.field): a záró szöveg $ecnt-szor fordul elő (1 kellene): $($op.end.Substring(0, [Math]::Min(90, $op.end.Length)))" }
    $s = $val.IndexOf($fe); $t = $val.IndexOf($ee)
    if ($t -le $s) { throw "[$n] $($op.id).$($op.field): a záró szöveg a kezdő előtt van" }
    $removed = $t - $s
    $val2 = $val.Substring(0, $s) + $re + $val.Substring($t)
    $raw = $raw.Substring(0, $rng[0]) + $val2 + $raw.Substring($rng[1])
    "[$n] OK  $($op.id).$($op.field)  tartomány: $removed karakter → $($op.repl.Length) karakter"
    continue
  }
  $val2 = $val.Replace($fe, $re)
  $raw = $raw.Substring(0, $rng[0]) + $val2 + $raw.Substring($rng[1])
  "[$n] OK  $($op.id).$($op.field)  ($($op.find.Length) → $($op.repl.Length) karakter)"
}

# Ellenőrzés: a módosított fájl érvényes JSON-e, és minden tétel megvan-e
$check = $raw.Substring($raw.IndexOf('=') + 1).Trim().TrimEnd(';') | ConvertFrom-Json
"Ellenőrzés: $($check.Count) tétel, érvényes JSON."
if ($DryRun) { 'Próbafuttatás — nem írtam ki.'; return }
[IO.File]::WriteAllText($Target, $raw, (New-Object System.Text.UTF8Encoding $false))
"Kiírva: $Target"
