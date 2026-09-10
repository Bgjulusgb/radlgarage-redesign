$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$pages = Get-Content -Raw (Join-Path $projectRoot 'source-mirror\pages.json') | ConvertFrom-Json

function Clean-RadlContent([string]$html) {
    $clean = $html
    $clean = $clean -replace '<(?:div|span)[^>]*>', ''
    $clean = $clean -replace '</(?:div|span)>', ''
    $clean = $clean -replace '<img[^>]*>', ''
    $clean = $clean -replace '\s(?:class|style|id|data-[\w-]+|aria-[\w-]+)=("[^"]*"|''[^'']*'')', ''
    $clean = $clean -replace '<p>\s*</p>', ''
    $clean = $clean -replace '<p><h1><p>', '<h1>'
    $clean = $clean -replace '</p></h1><p>', '</h1><p>'
    $clean = $clean -replace '<p>\s*<h1>', '<h1>'
    $clean = $clean -replace '</h1>\s*</p>', '</h1>'
    $clean = $clean -replace '(?s)^<h1>.*?</h1>', ''
    return $clean.Trim()
}

function Build-LegalPage([string]$slug, [string]$title) {
    $source = $pages | Where-Object slug -eq $slug
    if (-not $source) { throw "Missing page: $slug" }
    $content = Clean-RadlContent $source.content.rendered
    $outputDir = Join-Path $projectRoot "dist\$slug"
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

    $document = @"
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="$title – Radlgarage">
  <title>$title – Radlgarage</title>
  <link rel="icon" href="../assets/Radlgarage_Fahrradladen-Muenchen-Shop-Service.png">
  <link rel="stylesheet" href="../assets/site.css">
  <script src="../assets/site.js" defer></script>
</head>
<body>
  <div class="site-loader" aria-hidden="true"><img src="../assets/Radlgarage_Fahrradladen-Muenchen-Shop-Service_2x.png" alt=""><span></span></div>
  <a class="skip-link" href="#inhalt">$title</a>
  <header class="site-header inner-header" data-header>
    <a class="brand" href="../" aria-label="Radlgarage"><img src="../assets/Radlgarage_Fahrradladen-Muenchen-Shop-Service_2x.png" alt="Radlgarage"></a>
    <button class="menu-button" type="button" aria-label="Toggle mobile menu" aria-expanded="false" aria-controls="hauptnavigation" data-menu-button><i aria-hidden="true"></i></button>
    <nav id="hauptnavigation" class="main-nav" aria-label="Hauptmenü" data-menu><a href="../">Home</a><a href="../#news">News</a><a href="../#marken">Marken</a><a href="../service/">Service</a><a class="nav-contact" href="tel:+498923960891">+49 (0)89 23960891</a></nav>
  </header>
  <main id="inhalt">
    <section class="page-hero"><img src="../assets/Radlgarage_Fahrradladen-Muenchen-Header.jpg" alt="Radl Garage"><div><p class="eyebrow">Radlgarage</p><h1>$title</h1></div></section>
    <article class="legal-page"><div class="legal-copy">$content</div></article>
  </main>
  <footer class="site-footer">
    <div class="footer-grid"><div class="footer-brand"><img src="../assets/Radlgarage_Fahrradladen-Muenchen-Shop-Service_2x.png" alt="Radlgarage"></div><div><h2>Adresse</h2><address>Radl Garage<br>Pelkoven Straße 88<br>80992 München</address></div><div><h2>Kontakt</h2><p>E-Mail: <a href="mailto:info@radlgarage.de">info@radlgarage.de</a><br>Telefon: <a href="tel:+498923960891">+49 (0)89 23960891</a></p></div><div><h2>Öffnungszeiten</h2><p>Mo. geschlossen<br>Di. – Fr. 9 bis 13 Uhr, 15 bis 18 Uhr<br>Sa. 10 bis 14 Uhr</p></div></div>
    <div class="footer-bottom"><span>Copyright 2024 Radl Garage</span><nav aria-label="Radlgarage"><a href="../datenschutz/">Datenschutz</a><a href="../impressum/">Impressum</a></nav></div>
  </footer>
</body>
</html>
"@
    Set-Content -Encoding utf8 -Path (Join-Path $outputDir 'index.html') -Value $document
}

Build-LegalPage 'datenschutz' 'Datenschutz'
Build-LegalPage 'impressum' 'Impressum'
