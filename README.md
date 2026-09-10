# Radlgarage – lokales Redesign

Die originale öffentliche Website wurde unter `source-mirror/` archiviert. Das neue statische Design liegt unter `dist/` und verwendet ausschließlich Texte und Medien der Originalwebsite.

## Lokal starten

```powershell
python -m http.server 4173 --directory dist
```

Danach `http://localhost:4173/` im Browser öffnen.

## Inhalt erneut spiegeln

```powershell
pwsh -NoProfile -File .\scripts\mirror-site.ps1
pwsh -NoProfile -File .\scripts\build-legal-pages.ps1
```

## Struktur

- `dist/`: fertige statische Website
- `source-mirror/`: Originalseiten, WordPress-Seitendaten und 64 Originalmedien
- `scripts/`: Spiegelungs- und Seitengenerierungsskripte
