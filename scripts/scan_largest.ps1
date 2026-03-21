$pack = Get-ChildItem -Path .git\objects\pack -Filter 'pack-*.idx' | Select-Object -First 1
if (-not $pack) { Write-Error 'No pack idx found'; exit 2 }

Write-Host "Using pack: $($pack.Name)"

git verify-pack -v $pack.FullName > .git\verify-pack.txt

git rev-list --objects --all > .git\all-objects.txt

$verify = Get-Content .git\verify-pack.txt
$all = Get-Content .git\all-objects.txt

$lines = @()
foreach ($l in $verify) {
    if ($l -match '^[0-9a-f]{40}\s') {
        $parts = -split $l
        if ($parts.Length -ge 4) {
            $obj = [pscustomobject]@{sha=$parts[0]; type=$parts[1]; size=[int64]$parts[2]; comp=[int64]$parts[3]}
            $lines += $obj
        }
    }
}

$top = $lines | Where-Object { $_.type -eq 'blob' } | Sort-Object size -Descending | Select-Object -First 40

Write-Host "Top $($top.Count) blobs (sha size bytes path):"
foreach ($o in $top) {
    $path = ($all | Select-String $o.sha -SimpleMatch | ForEach-Object { ($_ -split ' ',2)[1] } | Select-Object -First 1)
    if (-not $path) { $path = '<no-path-in-rev-list>' }
    Write-Host "$($o.sha) $($o.size) $path"
}
