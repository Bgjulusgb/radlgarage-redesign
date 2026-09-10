$ErrorActionPreference = 'Stop'

$siteRoot = 'https://www.radlgarage.de'
$mirrorRoot = Join-Path $PSScriptRoot '..\source-mirror'
$pagesRoot = Join-Path $mirrorRoot 'pages'
$mediaRoot = Join-Path $mirrorRoot 'wp-content\uploads'

New-Item -ItemType Directory -Force -Path $pagesRoot | Out-Null
New-Item -ItemType Directory -Force -Path $mediaRoot | Out-Null

$pages = Invoke-RestMethod "$siteRoot/wp-json/wp/v2/pages?per_page=100&context=view"
$media = Invoke-RestMethod "$siteRoot/wp-json/wp/v2/media?per_page=100&context=view"

$pages | ConvertTo-Json -Depth 40 | Set-Content -Encoding utf8 (Join-Path $mirrorRoot 'pages.json')
$media | ConvertTo-Json -Depth 40 | Set-Content -Encoding utf8 (Join-Path $mirrorRoot 'media.json')

foreach ($page in $pages) {
    $slug = if ($page.slug -eq 'radl-garage-muenchen') { 'index' } else { $page.slug }
    Invoke-WebRequest -Uri $page.link -OutFile (Join-Path $pagesRoot "$slug.html")
}

foreach ($item in $media) {
    $fileName = [System.Uri]::UnescapeDataString(([System.Uri]$item.source_url).Segments[-1])
    Invoke-WebRequest -Uri $item.source_url -OutFile (Join-Path $mediaRoot $fileName)
}

Invoke-WebRequest -Uri "$siteRoot/robots.txt" -OutFile (Join-Path $mirrorRoot 'robots.txt')
Write-Host "Archived $($pages.Count) pages and $($media.Count) media files in $mirrorRoot"
