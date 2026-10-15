# MTE · Schaftböller Ebner: Website

Projekt-Repository für die neue Website von **Schaftböller Ebner** (Oberalm, Salzburg). Die Website zeigt die Manufaktur, bietet einen Schaftböller-Konfigurator und bekommt in einem 2. Schritt einen Onlineshop.

| Inhalt | Pfad |
|---|---|
| **Website-Konzept** (Interpretation, Design, Konfigurator, Technik, Shop, Recht, Aufwand) | [`docs/konzept/website-konzept.md`](docs/konzept/website-konzept.md) |
| **Briefing**: Mail von David Ebner vom 14.10.2026 und Inventar der Anhänge | [`docs/briefing/2026-10-14_mail-david-ebner/`](docs/briefing/2026-10-14_mail-david-ebner/README.md) |
| Gesicherte Anhänge (Logos, Referenzbilder) | [`docs/briefing/2026-10-14_mail-david-ebner/anhaenge/`](docs/briefing/2026-10-14_mail-david-ebner/anhaenge/) |
| **Klickbarer Design-Prototyp** (statisches HTML, keine Build-Schritte) | [`prototype/index.html`](prototype/index.html) |
| Abgeleitete Logo-Varianten (weiß/schwarz, Monogramm, Favicons) | [`prototype/assets/`](prototype/assets/) |

## Prototyp ansehen

`prototype/index.html` direkt im Browser öffnen oder lokal ausliefern:

```bash
npx serve prototype   # oder: python3 -m http.server -d prototype
```

- `?intro` spielt das Logo-Intro erneut ab (es läuft sonst nur einmal pro Browser-Sitzung).
- Konfigurator → Übersicht → **Link kopieren** erzeugt einen teilbaren Link, der die Konfiguration wiederherstellt.
- Alle Fotos sind **Platzhalter**, alle Preise sind **Beispielwerte**. Die Vorschau des Böllers ist eine SVG-Illustration. Live wird sie durch Bildebenen aus echten Produktfotos ersetzt.
